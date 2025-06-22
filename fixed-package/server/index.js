// Simplified server for cPanel shared hosting
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not found, using environment variables directly');
}

const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const path = require('path');

// Serve static files from the assets directory
app.use(express.static(path.join(__dirname, '../assets')));
app.use(express.static(path.join(__dirname, '..')));

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',  // Explicitly use IPv4
  user: process.env.DB_USER || 'uadoshxd_pelnora_user',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'uadoshxd_pelnora',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  namedPlaceholders: true,
  ssl: false,
  connectTimeout: 10000,
  // Force IPv4 only
  socketPath: undefined
};

// Session store configuration
const sessionStore = new MySQLStore({
  ...dbConfig,
  createDatabaseTable: true
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

let pool;

// Initialize database
async function initDatabase() {
  try {
    console.log('Initializing database connection...');
    
    pool = mysql.createPool(dbConfig);
    
    // Test the connection
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    
    // Test if we can query the database
    const [rows] = await connection.query('SELECT 1');
    console.log('✅ Database query test successful');
    
    // Check if tables exist
    const [tables] = await connection.query('SHOW TABLES');
    console.log('✅ Database tables:', tables.map(t => Object.values(t)[0]).join(', '));
    
    connection.release();
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', {
      message: error.message,
      code: error.code,
      errno: error.errno,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage
    });
    throw error;
  }
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Authentication middleware
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

// User routes
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, referralId } = req.body;
    
    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate unique referral ID if not provided
    const userReferralId = referralId || `REF${Date.now()}`;
    
    // Create user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, referralId) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, userReferralId]
    );
    
    res.status(201).json({
      id: result.insertId,
      name,
      email,
      referralId: userReferralId
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    req.session.userId = user.id;
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      referralId: user.referralId
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/user/profile', requireAuth, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, name, email, referralId, isActive, unlockedLevels FROM users WHERE id = ?',
      [req.session.userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Package routes
app.post('/api/packages', requireAuth, async (req, res) => {
  try {
    const { packageType, monthlyAmount } = req.body;
    
    const [result] = await pool.query(
      'INSERT INTO packages (userId, packageType, monthlyAmount) VALUES (?, ?, ?)',
      [req.session.userId, packageType, monthlyAmount]
    );
    
    res.status(201).json({
      id: result.insertId,
      packageType,
      monthlyAmount
    });
  } catch (error) {
    console.error('Package creation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/packages', requireAuth, async (req, res) => {
  try {
    const [packages] = await pool.query(
      'SELECT * FROM packages WHERE userId = ? AND isActive = true',
      [req.session.userId]
    );
    
    res.json(packages);
  } catch (error) {
    console.error('Packages fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Earnings routes
app.get('/api/earnings', requireAuth, async (req, res) => {
  try {
    const [earnings] = await pool.query(
      'SELECT * FROM earnings WHERE userId = ? ORDER BY createdAt DESC',
      [req.session.userId]
    );
    
    res.json(earnings);
  } catch (error) {
    console.error('Earnings fetch error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve the main application for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Start the server
async function startServer() {
  try {
    await initDatabase();
    app.listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Export the app and startServer function
module.exports = {
  app,
  startServer
};

// Start the server if this file is run directly
if (require.main === module) {
  startServer(); 
}