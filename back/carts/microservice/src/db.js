const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user:password@db-carts:5432/carts'
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool
};
