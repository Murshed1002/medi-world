import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

export async function runMigrations() {
  // Create a new client for each migration run
  const client = new Client({
    host: process.env.POSTGRES_HOST || 'localhost',
    user: process.env.POSTGRES_USER || 'root',
    password: process.env.POSTGRES_PASSWORD || 'root',
    database: process.env.POSTGRES_DB || 'mediworld_db',
  });

  try {
    await client.connect();

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename TEXT UNIQUE,
        applied_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Find migrations directory - works in both dev and compiled environments
    const migrationsDir = __dirname.includes('/dist/')
      ? path.join(__dirname.replace('/dist/', '/'), 'migrations')
      : path.join(__dirname, 'migrations');
    
    const files = fs.readdirSync(migrationsDir).sort();

    for (const file of files) {
      const res = await client.query(
        'SELECT 1 FROM schema_migrations WHERE filename = $1',
        [file]
      );

      if (res.rowCount === 0) {
        const sql = fs.readFileSync(
          path.join(migrationsDir, file),
          'utf8'
        );
        console.log(`Running migration: ${file}`);
        await client.query(sql);
        await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1)',
          [file]
        );
      }
    }
  } finally {
    await client.end();
  }
}

// Only run if called directly (not when imported)
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('✅ All migrations completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    });
}
