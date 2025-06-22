import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigrations() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'pelnora_db',
    user: 'pelnora_user',
    password: 'Pelnora@2024#Secure',
    ssl: false
  });

  try {
    await client.connect();
    console.log('Connected to database');

    // Create migrations table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of applied migrations
    const { rows: appliedMigrations } = await client.query('SELECT name FROM migrations');
    const appliedMigrationNames = appliedMigrations.map(m => m.name);

    // Get all migration files
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure migrations run in order

    console.log(`Found ${migrationFiles.length} migration files`);
    
    // Run migrations that haven't been applied yet
    for (const migrationFile of migrationFiles) {
      if (!appliedMigrationNames.includes(migrationFile)) {
        console.log(`Applying migration: ${migrationFile}`);
        const sqlFile = path.join(migrationsDir, migrationFile);
        const sql = fs.readFileSync(sqlFile, 'utf8');

        // Start a transaction for each migration
        await client.query('BEGIN');
        try {
          await client.query(sql);
          await client.query('INSERT INTO migrations (name) VALUES ($1)', [migrationFile]);
          await client.query('COMMIT');
          console.log(`Migration ${migrationFile} applied successfully`);
        } catch (error) {
          await client.query('ROLLBACK');
          console.error(`Error applying migration ${migrationFile}:`, error);
          throw error;
        }
      } else {
        console.log(`Migration ${migrationFile} already applied, skipping`);
      }
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration process failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
