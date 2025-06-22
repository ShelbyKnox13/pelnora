import { Pool } from 'pg';

// Explicit database configuration
const config = {
  host: 'localhost',
  port: 5432,
  database: 'pelnora',
  username: 'postgres',
  password: 'admin',
};

// Create connection string
const connectionString = `postgres://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;

console.log('Database configuration:', {
  host: config.host,
  port: config.port,
  database: config.database,
  username: config.username,
});

const pool = new Pool({
  connectionString,
});

async function main() {
  console.log('Running migrations...');
  
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        kyc_status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS kyc_submissions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id),
        pan_number VARCHAR(10) NOT NULL,
        id_proof_type VARCHAR(50) NOT NULL,
        id_proof_number VARCHAR(50) NOT NULL,
        pan_card_image TEXT NOT NULL,
        id_proof_image TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TIMESTAMP
      );
    `);
    
    // Add missing email_verification_token column if it doesn't exist
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token VARCHAR(255);
    `);
    
    console.log('Migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main(); 