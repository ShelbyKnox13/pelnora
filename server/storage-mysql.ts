import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || '',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

let pool: mysql.Pool;

// Initialize database connection
export async function initDatabase() {
  try {
    pool = mysql.createPool(dbConfig);
    
    // Test connection
    const connection = await pool.getConnection();
    console.log('✅ Connected to MySQL database');
    connection.release();
    
    // Create tables if they don't exist
    await createTables();
    
    return pool;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Create necessary tables
async function createTables() {
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
      FOREIGN KEY (referredBy) REFERENCES users(id),
      FOREIGN KEY (leftChild) REFERENCES users(id),
      FOREIGN KEY (rightChild) REFERENCES users(id)
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
      FOREIGN KEY (fromUserId) REFERENCES users(id)
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

  try {
    await pool.execute(createUsersTable);
    await pool.execute(createPackagesTable);
    await pool.execute(createEarningsTable);
    await pool.execute(createEMIPaymentsTable);
    await pool.execute(createWithdrawalsTable);
    
    console.log('✅ Database tables created/verified');
    
    // Create admin user if not exists
    await createAdminUser();
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw error;
  }
}

// Create admin user
async function createAdminUser() {
  try {
    const [rows] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      ['admin@pelnora.com']
    );

    if ((rows as any[]).length === 0) {
      const hashedPassword = await bcrypt.hash('Qwertghjkl@13', 10);
      await pool.execute(
        'INSERT INTO users (name, email, password, referralId, isActive) VALUES (?, ?, ?, ?, ?)',
        ['Admin User', 'admin@pelnora.com', hashedPassword, 'ADMIN001', true]
      );
      console.log('✅ Admin user created');
    }
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  }
}

// Storage class for MySQL operations
export class MySQLStorage {
  // User operations
  async createUser(userData: any) {
    try {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const [result] = await pool.execute(
        'INSERT INTO users (name, email, password, referralId, referredBy) VALUES (?, ?, ?, ?, ?)',
        [userData.name, userData.email, hashedPassword, userData.referralId, userData.referredBy || null]
      );
      
      const userId = (result as any).insertId;
      return this.getUser(userId);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async getUser(id: number) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      return (rows as any[])[0] || null;
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );
      return (rows as any[])[0] || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      throw error;
    }
  }

  async getUserByReferralId(referralId: string) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM users WHERE referralId = ?',
        [referralId]
      );
      return (rows as any[])[0] || null;
    } catch (error) {
      console.error('Error getting user by referral ID:', error);
      throw error;
    }
  }

  async getAllUsers() {
    try {
      const [rows] = await pool.execute('SELECT * FROM users ORDER BY createdAt DESC');
      return rows as any[];
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  async updateUser(id: number, updates: any) {
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      
      await pool.execute(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        values
      );
      
      return this.getUser(id);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Package operations
  async createPackage(packageData: any) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO packages (userId, packageType, monthlyAmount) VALUES (?, ?, ?)',
        [packageData.userId, packageData.packageType, packageData.monthlyAmount]
      );
      
      const packageId = (result as any).insertId;
      return this.getPackage(packageId);
    } catch (error) {
      console.error('Error creating package:', error);
      throw error;
    }
  }

  async getPackage(id: number) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM packages WHERE id = ?',
        [id]
      );
      return (rows as any[])[0] || null;
    } catch (error) {
      console.error('Error getting package:', error);
      throw error;
    }
  }

  async getPackageByUserId(userId: number) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM packages WHERE userId = ? AND isActive = true',
        [userId]
      );
      return (rows as any[])[0] || null;
    } catch (error) {
      console.error('Error getting package by user ID:', error);
      throw error;
    }
  }

  async updatePackage(id: number, updates: any) {
    try {
      const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(updates), id];
      
      await pool.execute(
        `UPDATE packages SET ${setClause} WHERE id = ?`,
        values
      );
      
      return this.getPackage(id);
    } catch (error) {
      console.error('Error updating package:', error);
      throw error;
    }
  }

  async deletePackage(id: number) {
    try {
      // First delete related EMI payments
      await pool.execute('DELETE FROM emi_payments WHERE packageId = ?', [id]);
      
      // Then delete the package
      const [result] = await pool.execute('DELETE FROM packages WHERE id = ?', [id]);
      
      return (result as any).affectedRows > 0;
    } catch (error) {
      console.error('Error deleting package:', error);
      throw error;
    }
  }

  // Earnings operations
  async createEarning(earningData: any) {
    try {
      const [result] = await pool.execute(
        'INSERT INTO earnings (userId, amount, type, level, fromUserId, description) VALUES (?, ?, ?, ?, ?, ?)',
        [
          earningData.userId,
          earningData.amount,
          earningData.type,
          earningData.level || null,
          earningData.fromUserId || null,
          earningData.description || null
        ]
      );
      
      return (result as any).insertId;
    } catch (error) {
      console.error('Error creating earning:', error);
      throw error;
    }
  }

  async getEarningsByUserId(userId: number) {
    try {
      const [rows] = await pool.execute(
        'SELECT * FROM earnings WHERE userId = ? ORDER BY createdAt DESC',
        [userId]
      );
      return rows as any[];
    } catch (error) {
      console.error('Error getting earnings:', error);
      throw error;
    }
  }

  // Referral operations
  async getReferralsByUserId(userId: number) {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, email, referralId, createdAt FROM users WHERE referredBy = ? ORDER BY createdAt DESC',
        [userId]
      );
      return rows as any[];
    } catch (error) {
      console.error('Error getting referrals:', error);
      throw error;
    }
  }

  // Close connection
  async close() {
    if (pool) {
      await pool.end();
    }
  }
}

// Export singleton instance
export const storage = new MySQLStorage();