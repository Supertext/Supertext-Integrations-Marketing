// DATABASE_URL with the database name replaced by INTEGRATIONS_DB_NAME (shared Postgres server).
function databaseUrl() {
  const raw = process.env.DATABASE_URL;
  const name = process.env.INTEGRATIONS_DB_NAME;
  if (!raw || !name) return raw;
  const url = new URL(raw);
  url.pathname = `/${name}`;
  return url.toString();
}

module.exports = { databaseUrl };
