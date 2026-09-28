const mysql = require('mysql2');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'mysql@567project',
  database: process.env.DB_NAME || 'my_database',   
});

console.log('Database connection pool created successfully.');

module.exports = pool.promise();