// Simplified server for cPanel shared hosting
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool;

// Initialize database
async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    console.log('✅ Connected to MySQL database');
    await createTables();
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Create tables
async function createTables() {
  const tables = [
    `CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      referralId VARCHAR(50) UNIQUE NOT NULL,
      referredBy INT DEFAULT NULL,
      isActive BOOLEAN DEFAULT true,
      unlockedLevels INT DEFAULT 0,
      leftChild INT DEFAULT NULL,
      rightChild INT DEFAULT NULL,
      leftTeamCount INT DEFAULT 0,
      rightTeamCount INT DEFAULT 0,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`,
    
    `CREATE TABLE IF NOT EXISTS packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      packageType ENUM('bronze', 'silver', 'gold', 'diamond') NOT NULL,
      monthlyAmount DECIMAL(10,2) NOT NULL,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )`,
    
    `CREATE TABLE IF NOT EXISTS earnings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      type ENUM('level_income', 'binary_income', 'direct_referral') NOT NULL,
      level INT DEFAULT NULL,
      fromUserId INT DEFAULT NULL,
      description TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )`
  ];

  for (const table of tables) {
    await pool.execute(table);
  }
  
  // Create admin user
  await createAdminUser();
  console.log('✅ Database tables created');
}

async function createAdminUser() {
  try {
    const [rows] = await pool.execute('SELECT id FROM users WHERE email = ?', ['admin@pelnora.com']);
    
    if (rows.length === 0) {
      const hashedPassword = await bcrypt.hash('Qwertghjkl@13', 10);
      await pool.execute(
        'INSERT INTO users (name, email, password, referralId, isActive) VALUES (?, ?, ?, ?, ?)',
        ['Admin User', 'admin@pelnora.com', hashedPassword, 'ADMIN001', true]
      );
      console.log('✅ Admin user created');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../dist/public')));

// Authentication middleware
const isAuthenticated = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

const isAdmin = async (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    const user = rows[0];
    
    if (!user || user.email !== 'admin@pelnora.com') {
      return res.status(403).json({ message: "Admin access required" });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT 1');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'unhealthy',
      database: 'error',
      error: error.message
    });
  }
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    req.session.userId = user.id;
    req.session.isAdmin = user.email === 'admin@pelnora.com';
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, referralId } = req.body;
    
    // Check if user exists
    const [existing] = await pool.execute('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }
    
    // Generate unique referral ID
    const newReferralId = 'REF' + Date.now().toString().slice(-6);
    
    // Find referrer
    let referredBy = null;
    if (referralId) {
      const [referrer] = await pool.execute('SELECT id FROM users WHERE referralId = ?', [referralId]);
      if (referrer.length > 0) {
        referredBy = referrer[0].id;
      }
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, referralId, referredBy) VALUES (?, ?, ?, ?, ?)',
      [name, email, hashedPassword, newReferralId, referredBy]
    );
    
    const userId = result.insertId;
    req.session.userId = userId;
    
    res.json({
      id: userId,
      name,
      email,
      referralId: newReferralId,
      referredBy
    });
  } catch (error) {
    res.status(500).json({ message: "Registration failed" });
  }
});

app.get('/api/auth/me', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  
  try {
    const [rows] = await pool.execute('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    const user = rows[0];
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    const { password: _, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out successfully" });
});

// Admin login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (username !== 'admin') {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    const [rows] = await pool.execute('SELECT * FROM users WHERE email = ?', ['admin@pelnora.com']);
    const admin = rows[0];
    
    if (!admin || !await bcrypt.compare(password, admin.password)) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    
    req.session.userId = admin.id;
    req.session.isAdmin = true;
    
    const { password: _, ...adminWithoutPassword } = admin;
    res.json(adminWithoutPassword);
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

// User routes
app.get('/api/users', isAdmin, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT id, name, email, referralId, isActive, unlockedLevels, createdAt FROM users ORDER BY createdAt DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users" });
  }
});

// Package routes
app.get('/api/packages/me', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM packages WHERE userId = ? AND isActive = true', [req.session.userId]);
    res.json(rows[0] || null);
  } catch (error) {
    res.status(500).json({ message: "Error fetching package" });
  }
});

app.post('/api/packages', isAuthenticated, async (req, res) => {
  try {
    const { packageType, monthlyAmount } = req.body;
    
    const [result] = await pool.execute(
      'INSERT INTO packages (userId, packageType, monthlyAmount) VALUES (?, ?, ?)',
      [req.session.userId, packageType, monthlyAmount]
    );
    
    const [newPackage] = await pool.execute('SELECT * FROM packages WHERE id = ?', [result.insertId]);
    res.json(newPackage[0]);
  } catch (error) {
    res.status(500).json({ message: "Error creating package" });
  }
});

// Earnings routes
app.get('/api/earnings/me', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM earnings WHERE userId = ? ORDER BY createdAt DESC', [req.session.userId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching earnings" });
  }
});

// Referrals routes
app.get('/api/referrals/me', isAuthenticated, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, referralId, createdAt FROM users WHERE referredBy = ? ORDER BY createdAt DESC',
      [req.session.userId]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching referrals" });
  }
});

// Admin stats
app.get('/api/admin/stats', isAdmin, async (req, res) => {
  try {
    const [userCount] = await pool.execute('SELECT COUNT(*) as count FROM users');
    const [packageCount] = await pool.execute('SELECT COUNT(*) as count FROM packages WHERE isActive = true');
    const [totalEarnings] = await pool.execute('SELECT SUM(amount) as total FROM earnings');
    
    res.json({
      userCount: userCount[0].count,
      activePackages: packageCount[0].count,
      totalEarnings: totalEarnings[0].total || 0
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

// Serve React app for all other routes
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, '../dist/public/index.html');
  console.log('Attempting to serve index.html from:', indexPath);
  res.sendFile(indexPath);
});

// Start server
async function startServer() {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();