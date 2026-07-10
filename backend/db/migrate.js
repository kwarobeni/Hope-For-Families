require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

async function run() {
  const connConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    multipleStatements: true,
  };
  if (process.env.DB_SOCKET) {
    connConfig.socketPath = process.env.DB_SOCKET;
  } else {
    connConfig.host = process.env.DB_HOST || 'localhost';
    connConfig.port = Number(process.env.DB_PORT || 3306);
  }
  const connection = await mysql.createConnection(connConfig);

  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    console.log(`Running migration ${file}...`);
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await connection.query(sql);
  }

  console.log('Migrations complete.');
  await connection.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
