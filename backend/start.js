require('dotenv').config();
const { spawnSync } = require('child_process');

// Prevent unhandled rejections from crashing the server process
process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught exception:', err.message);
  console.error(err.stack);
});
process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled rejection:', reason instanceof Error ? reason.message : reason);
});

console.log('[server] PORT:', process.env.PORT || '(not set)');

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
