// Creates this site's own database on the shared Postgres server if it doesn't exist yet.
// DATABASE_URL points at the server (any database); INTEGRATIONS_DB_NAME is ours.
// Runs before Strapi starts (npm start). Without DATABASE_URL (local SQLite) it does nothing.
const { Client } = require('pg');
const { databaseUrl } = require('../lib/database-url');

(async () => {
  const name = process.env.INTEGRATIONS_DB_NAME;
  if (!process.env.DATABASE_URL || !name) return;
  if (!/^[a-z_][a-z0-9_]*$/.test(name)) throw new Error('INTEGRATIONS_DB_NAME: lower-case letters, digits and _ only');
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  const { rowCount } = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [name]);
  if (!rowCount) {
    await client.query(`CREATE DATABASE "${name}"`);
    console.log(`[setup] Created database ${name}`);
  }
  await client.end();
  // Make sure the target is reachable before Strapi starts.
  const check = new Client({ connectionString: databaseUrl() });
  await check.connect();
  await check.end();
})().catch((error) => {
  console.error(`[setup] Database check failed: ${error.message}`);
  process.exit(1);
});
