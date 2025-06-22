import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || 'localhost',
  port: parseInt(process.env.PGPORT || '5432'),
  database: process.env.PGDATABASE || 'pelnora',
  user: process.env.PGUSER || 'postgres',
  password: process.env.PGPASSWORD || 'admin',
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