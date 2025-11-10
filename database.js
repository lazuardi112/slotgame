const mysql = require('mysql2');
const config = require('./config/config.js');

// Create a connection pool
const pool = mysql.createPool({
  connectionLimit: 10,
  host: config.host,
  user: config.user,
  password: config.password,
  database: config.database
});

// Export the pool for use in other modules
module.exports = pool;
