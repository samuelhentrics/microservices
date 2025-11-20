const { Pool } = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://login_user:login_pass@db:5432/users';
const pool = new Pool({ connectionString });
module.exports = pool;
