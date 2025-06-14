import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'pelnora',
    user: 'postgres',
    password: 'admin'
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const sqlFile = path.join(__dirname, 'migrations', 'update_user_references.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');

    await client.query(sql);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

runMigration(); 