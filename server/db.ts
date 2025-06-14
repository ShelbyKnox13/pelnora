import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../shared/schema';

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'pelnora',
  user: 'postgres',
  password: 'admin',
  ssl: false,
});

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    process.exit(1);
  }
  console.log('Successfully connected to database');
  release();
});

export const db = drizzle(pool, { schema }); 