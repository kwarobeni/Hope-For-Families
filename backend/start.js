require('dotenv').config();
const { spawnSync } = require('child_process');

function run(label, script) {
  console.log(`\n→ ${label}...`);
  const result = spawnSync(process.execPath, [script], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    console.warn(`⚠  ${label} exited with code ${result.status} — continuing anyway`);
  }
}

run('Migrations', 'db/migrate.js');
run('Seed data', 'db/seed.js');

console.log('\n→ Starting server...\n');
require('./src/server.js');
