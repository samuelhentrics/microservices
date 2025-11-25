const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user:password@db-monitoring:5432/monitoring'
});

module.exports = pool;
