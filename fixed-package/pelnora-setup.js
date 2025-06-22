// All-in-one setup script for Pelnora MLM Application on cPanel
const fs = require('fs');
const path = require('path');

console.log('Starting Pelnora MLM Application setup...');

// Check if server exists and what type it is
const serverPath = path.join(__dirname, 'server');
try {
  const stats = fs.statSync(serverPath);
  
  // If server exists but is a file, rename it first
  if (stats.isFile()) {
    console.log('Found "server" as a file, renaming to server.backup...');
    fs.renameSync(serverPath, path.join(__dirname, 'server.backup'));
    console.log('✅ Renamed server file to server.backup');
  }
} catch (error) {
  // If path doesn't exist, that's fine - we'll create it
  if (error.code !== 'ENOENT') {
    console.error('❌ Error checking server path:', error);
  }
}

// Create server directory
console.log('Creating server directory...');
try {
  fs.mkdirSync(serverPath, { recursive: true });
  console.log('✅ Server directory created successfully');
} catch (error) {
  console.error('❌ Error creating server directory:', error);
  process.exit(1);
}

// Create server/index.js file
console.log('Creating server/index.js file...');
const serverIndexContent = `// Simplified server for cPanel shared hosting
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
  connectTimeout: 10000
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
    const userReferralId = referralId || \`REF\${Date.now()}\`;
    
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
      console.log(\`✅ Server is running on port \${PORT}\`);
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
}`;

try {
  fs.writeFileSync(path.join(serverDir, 'index.js'), serverIndexContent);
  console.log('✅ Created server/index.js successfully');
} catch (error) {
  console.error('❌ Error creating server/index.js:', error);
  process.exit(1);
}

// Create setup-database.js file
console.log('Creating server/setup-database.js file...');
const setupDatabaseContent = `// Database setup script for cPanel deployment
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not found, using environment variables directly');
}

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  user: process.env.DB_USER || 'uadoshxd_pelnora_user',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'uadoshxd_pelnora',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true
};

async function setupDatabase() {
  let pool;
  
  try {
    console.log('Initializing database connection...');
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();
    
    // Create tables
    await createTables(pool);
    
    // Create admin user
    await createAdminUser(pool);
    
    console.log('✅ Database setup completed successfully');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
  } finally {
    if (pool) {
      await pool.end();
    }
  }
}

async function createTables(pool) {
  const createUsersTable = \`
    CREATE TABLE IF NOT EXISTS users (
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
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (referredBy) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (leftChild) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (rightChild) REFERENCES users(id) ON DELETE SET NULL
    )
  \`;

  const createPackagesTable = \`
    CREATE TABLE IF NOT EXISTS packages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      packageType ENUM('bronze', 'silver', 'gold', 'diamond') NOT NULL,
      monthlyAmount DECIMAL(10,2) NOT NULL,
      isActive BOOLEAN DEFAULT true,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  \`;

  const createEarningsTable = \`
    CREATE TABLE IF NOT EXISTS earnings (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      type ENUM('level_income', 'binary_income', 'direct_referral') NOT NULL,
      level INT DEFAULT NULL,
      fromUserId INT DEFAULT NULL,
      description TEXT,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (fromUserId) REFERENCES users(id) ON DELETE SET NULL
    )
  \`;

  const createEMIPaymentsTable = \`
    CREATE TABLE IF NOT EXISTS emi_payments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      packageId INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      dueDate DATE NOT NULL,
      paidDate DATE DEFAULT NULL,
      status ENUM('pending', 'paid', 'overdue') DEFAULT 'pending',
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (packageId) REFERENCES packages(id) ON DELETE CASCADE
    )
  \`;

  const createWithdrawalsTable = \`
    CREATE TABLE IF NOT EXISTS withdrawals (
      id INT AUTO_INCREMENT PRIMARY KEY,
      userId INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
      bankDetails JSON,
      createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      processedAt TIMESTAMP NULL,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    )
  \`;

  const createSessionsTable = \`
    CREATE TABLE IF NOT EXISTS sessions (
      session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
      expires INT(11) UNSIGNED NOT NULL,
      data MEDIUMTEXT COLLATE utf8mb4_bin,
      PRIMARY KEY (session_id)
    )
  \`;

  try {
    console.log('Creating database tables...');
    
    await pool.execute(createUsersTable);
    console.log('✅ Users table created/verified');
    
    await pool.execute(createPackagesTable);
    console.log('✅ Packages table created/verified');
    
    await pool.execute(createEarningsTable);
    console.log('✅ Earnings table created/verified');
    
    await pool.execute(createEMIPaymentsTable);
    console.log('✅ EMI Payments table created/verified');
    
    await pool.execute(createWithdrawalsTable);
    console.log('✅ Withdrawals table created/verified');
    
    await pool.execute(createSessionsTable);
    console.log('✅ Sessions table created/verified');
    
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

async function createAdminUser(pool) {
  try {
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@pelnora.com']
    );

    if (rows.length === 0) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await pool.execute(
        'INSERT INTO users (name, email, password, referralId, isActive) VALUES (?, ?, ?, ?, ?)',
        ['Admin User', 'admin@pelnora.com', hashedPassword, 'ADMIN001', true]
      );
      console.log('✅ Admin user created');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Run the setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };`;

try {
  fs.writeFileSync(path.join(serverDir, 'setup-database.js'), setupDatabaseContent);
  console.log('✅ Created server/setup-database.js successfully');
} catch (error) {
  console.error('❌ Error creating server/setup-database.js:', error);
  process.exit(1);
}

// Update package.json
console.log('Creating/updating package.json...');
const packageJsonContent = `{
  "name": "pelnora-app",
  "version": "1.0.0",
  "main": "server/index.js",
  "scripts": {
    "start": "node server/index.js",
    "setup": "node server/setup-database.js",
    "build": "echo 'Build completed'",
    "postinstall": "npm run setup"
  },
  "dependencies": {
    "@neondatabase/serverless": "^0.10.4",
    "bcryptjs": "^2.4.3",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "drizzle-orm": "^0.36.4",
    "express": "^4.21.1",
    "express-mysql-session": "^3.0.0",
    "express-session": "^1.18.1",
    "mysql2": "^3.11.4",
    "path": "^0.12.7",
    "pg": "^8.11.3",
    "zod": "^3.23.8"
  },
  "engines": {
    "node": ">=18.20.7"
  }
}`;

try {
  fs.writeFileSync(path.join(__dirname, 'package.json'), packageJsonContent);
  console.log('✅ Updated package.json successfully');
} catch (error) {
  console.error('❌ Error updating package.json:', error);
  process.exit(1);
}

// Create .env.example file
console.log('Creating .env.example file...');
const envExampleContent = `# Database Configuration
DB_HOST=127.0.0.1
DB_USER=your_cpanel_db_username
DB_PASSWORD=your_cpanel_db_password
DB_NAME=your_cpanel_db_name
DB_PORT=3306

# Server Configuration
PORT=3000
NODE_ENV=production

# Session Configuration
SESSION_SECRET=your_session_secret_key

# CORS Configuration
CORS_ORIGIN=*`;

try {
  fs.writeFileSync(path.join(__dirname, '.env.example'), envExampleContent);
  console.log('✅ Created .env.example successfully');
} catch (error) {
  console.error('❌ Error creating .env.example:', error);
  process.exit(1);
}

// Create app.js file
console.log('Creating app.js file...');
const appJsContent = `// Import the server module
try {
  const server = require('./server/index.js');
  // Start the server
  server.startServer();
} catch (error) {
  console.error('Error starting server. Please run the setup script first:');
  console.error('node pelnora-setup.js');
  console.error('Error details:', error);
}`;

try {
  fs.writeFileSync(path.join(__dirname, 'app.js'), appJsContent);
  console.log('✅ Created app.js successfully');
} catch (error) {
  console.error('❌ Error creating app.js:', error);
  process.exit(1);
}

// Create installation guide
const installationGuideContent = `# Pelnora MLM Application - Installation Guide

This guide provides step-by-step instructions for deploying the Pelnora MLM application on a cPanel shared hosting environment.

## Prerequisites

1. A cPanel hosting account with:
   - Node.js support (version 18.x or higher)
   - MySQL database
   - SSH access (recommended for troubleshooting)

## Installation Steps

### 1. Upload Files

1. Log in to your cPanel account
2. Go to File Manager or use FTP to upload all files in this package to your desired directory
3. Make sure all files are uploaded correctly, including hidden files like \`.htaccess\` and \`.env.example\`

### 2. Create a MySQL Database

1. In cPanel, go to MySQL Databases
2. Create a new database (e.g., \`your_username_pelnora\`)
3. Create a new database user with a strong password
4. Add the user to the database with ALL PRIVILEGES
5. Note down the database name, username, and password for the next step

### 3. Configure Environment Variables

1. Rename \`.env.example\` to \`.env\` or create a new \`.env\` file
2. Update the database credentials and other settings in the \`.env\` file:
   \`\`\`
   DB_HOST=127.0.0.1
   DB_USER=your_cpanel_db_username
   DB_PASSWORD=your_cpanel_db_password
   DB_NAME=your_cpanel_db_name
   PORT=3000
   SESSION_SECRET=your_random_secret_key
   NODE_ENV=production
   \`\`\`

### 4. Install Dependencies and Set Up Database

#### Option 1: Using SSH (Recommended)

1. Connect to your server via SSH
2. Navigate to your application directory:
   \`\`\`bash
   cd /path/to/your/application
   \`\`\`
3. Run the setup script:
   \`\`\`bash
   node pelnora-setup.js
   \`\`\`
   This will:
   - Create all necessary server files
   - Install all dependencies
   - Set up the database tables
   - Create an admin user

#### Option 2: Using cPanel Node.js App Setup

1. In cPanel, go to "Setup Node.js App"
2. Create a new Node.js application:
   - Application mode: Production
   - Node.js version: 18.x (or higher)
   - Application root: /path/to/your/application
   - Application URL: Your domain or subdomain
   - Application startup file: app.js
   - Environment variables: Add the same variables as in your .env file
3. After setting up, connect via SSH and run:
   \`\`\`bash
   cd /path/to/your/application
   node server/setup-database.js
   \`\`\`

### 5. Start the Application

#### Option 1: Using cPanel Node.js App

1. In the Node.js App interface, click "Start"
2. Your application should now be running

#### Option 2: Using PM2 (Recommended for production)

If your hosting supports PM2, use it to keep the application running:

\`\`\`bash
# Install PM2 globally if not already installed
npm install -g pm2

# Start the application with PM2
pm2 start app.js --name pelnora

# Set PM2 to start on server reboot
pm2 startup
pm2 save
\`\`\`

### 6. Verify Installation

1. Visit your domain or subdomain in a web browser
2. You should see the Pelnora MLM application login page
3. Test the API by visiting: \`https://your-domain.com/api/health\`
   - You should see a JSON response: \`{"status":"ok","message":"Server is running"}\`

## Troubleshooting

### Database Connection Issues

- Verify your database credentials in the .env file
- Make sure the database user has the correct permissions
- Check if the database server is running
- Look for error messages in the Node.js application logs

### Application Not Starting

- Check the error logs in cPanel
- Verify that all dependencies are installed correctly
- Make sure the Node.js version is compatible (18.x or higher)
- Check if the port specified in your .env file is available

### 404 Errors

- Verify that the .htaccess file is properly configured
- Check if mod_rewrite is enabled on your server
- Make sure the application is running and listening on the correct port

### Admin Access

- Default admin credentials:
  - Email: admin@pelnora.com
  - Password: Admin@123
- Change these credentials immediately after first login

## Support

If you encounter any issues, please contact support at support@pelnora.in`;

try {
  fs.writeFileSync(path.join(__dirname, 'INSTALLATION.md'), installationGuideContent);
  console.log('✅ Created INSTALLATION.md successfully');
} catch (error) {
  console.error('❌ Error creating INSTALLATION.md:', error);
}

// Check if .env file exists, if not create it from .env.example
if (!fs.existsSync(path.join(__dirname, '.env'))) {
  console.log('Creating .env file from .env.example...');
  try {
    if (fs.existsSync(path.join(__dirname, '.env.example'))) {
      fs.copyFileSync(path.join(__dirname, '.env.example'), path.join(__dirname, '.env'));
      console.log('✅ .env file created successfully');
    } else {
      console.log('❌ .env.example file not found. Please create a .env file manually.');
    }
  } catch (error) {
    console.error('❌ Error creating .env file:', error);
  }
}

console.log(`
✅ Setup completed!

Next steps:
1. Edit the .env file with your database credentials
2. Install dependencies with: npm install
3. Start the application with: npm start
4. If using PM2, run: pm2 start app.js --name pelnora

For more information, see the INSTALLATION.md file.
`);