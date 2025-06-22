import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

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

// Test the connection
pool.query('SELECT 1')
  .then(() => {
    console.log('Database connection successful!');
    // Test if tables exist
    return pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `);
  })
  .then((result) => {
    if (!result.rows[0].exists) {
      console.log('Tables do not exist. Please run the migration script: npm run migrate');
    } else {
      console.log('Tables exist and are ready to use.');
    }
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    console.error('Please check if:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database "pelnora" exists');
    console.error('3. Username and password are correct');
    console.error('4. Port 5432 is accessible');
  });

export const db = drizzle(pool, { schema }); 