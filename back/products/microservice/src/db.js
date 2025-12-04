const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL || 'postgres://user:password@db-products:5432/products';
const pool = new Pool({ connectionString });
module.exports = pool;
