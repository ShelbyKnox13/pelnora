// Database setup script for cPanel deployment
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

try {
  require('dotenv').config();
} catch (error) {
  console.log('dotenv not found, using environment variables directly');
}

// Database configuration
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',  // Explicitly use IPv4
  user: process.env.DB_USER || 'uadoshxd_pelnora_user',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'uadoshxd_pelnora',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  namedPlaceholders: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: false,
  connectTimeout: 10000,
  // Force IPv4 only
  socketPath: undefined
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
  const createUsersTable = `
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
  `;

  const createPackagesTable = `
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
  `;

  const createEarningsTable = `
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
  `;

  const createEMIPaymentsTable = `
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
  `;

  const createWithdrawalsTable = `
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
  `;

  const createSessionsTable = `
    CREATE TABLE IF NOT EXISTS sessions (
      session_id VARCHAR(128) COLLATE utf8mb4_bin NOT NULL,
      expires INT(11) UNSIGNED NOT NULL,
      data MEDIUMTEXT COLLATE utf8mb4_bin,
      PRIMARY KEY (session_id)
    )
  `;

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
    // Check if admin user already exists
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@pelnora.com']
    );
    
    if (rows.length === 0) {
      console.log('Creating admin user...');
      
      // Create admin user
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      await pool.execute(
        'INSERT INTO users (name, email, password, referralId, isActive, unlockedLevels) VALUES (?, ?, ?, ?, ?, ?)',
        ['Admin User', 'admin@pelnora.com', hashedPassword, 'ADMIN001', true, 10]
      );
      
      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user already exists');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase().catch(console.error);
}

module.exports = { setupDatabase };