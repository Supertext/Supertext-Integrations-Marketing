const path = require('path');
const { databaseUrl } = require('../lib/database-url');

// Postgres when DATABASE_URL is set (Railway; INTEGRATIONS_DB_NAME picks our database on the
// shared server), otherwise a local SQLite file.
module.exports = ({ env }) =>
  env('DATABASE_URL')
    ? {
        connection: {
          client: 'postgres',
          connection: { connectionString: databaseUrl() },
          pool: { min: 0, max: 7 },
        },
      }
    : {
        connection: {
          client: 'sqlite',
          connection: { filename: path.join(__dirname, '..', '.tmp', 'data.db') },
          useNullAsDefault: true,
        },
      };
