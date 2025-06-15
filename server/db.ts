import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'pelnora',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'admin',
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    console.error('Please check if:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database "pelnora" exists');
    console.error('3. Username and password are correct');
    console.error('4. Port 5432 is accessible');
    process.exit(1);
  }
  console.log('Successfully connected to PostgreSQL database');
  release();
});

export const db = drizzle(pool, { schema }); 