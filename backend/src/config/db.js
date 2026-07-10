const mysql = require('mysql2/promise');
require('dotenv').config();

const base = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
};

const pool = mysql.createPool(
  process.env.DB_SOCKET
    ? { ...base, socketPath: process.env.DB_SOCKET }
    : { ...base, host: process.env.DB_HOST || 'localhost', port: Number(process.env.DB_PORT || 3306) }
);

module.exports = pool;
