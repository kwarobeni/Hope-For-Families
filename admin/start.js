import { spawnSync } from 'child_process';
import { createRequire } from 'module';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const candidates = [
  process.env.BACKEND_DIR,
  join(__dirname, '..', 'public_html', 'backend'),
  join(__dirname, '..', 'backend'),
  join(__dirname, 'backend'),
].filter(Boolean);

console.log('[startup] running from:', __dirname);
for (const c of candidates) {
  console.log('[startup]', existsSync(c) ? '✓' : '✗', c);
}

const socketPaths = [
  '/var/run/mysqld/mysqld.sock',
  '/var/lib/mysql/mysql.sock',
  '/tmp/mysql.sock',
  '/tmp/mysqld.sock',
];
for (const s of socketPaths) {
  console.log('[socket]', existsSync(s) ? '✓' : '✗', s);
}

const backendDir = candidates.find(existsSync);

if (!backendDir) {
  console.error('[startup] ERROR: backend not found in any candidate path.');
  process.exit(1);
}

console.log('[startup] starting backend from:', backendDir);
console.log('[startup] PORT:', process.env.PORT || '(not set)');

// Run migrations and seed as child processes — errors are non-fatal
function runScript(label, scriptPath) {
  console.log(`\n→ ${label}...`);
  const result = spawnSync(process.execPath, [scriptPath], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.status !== 0) {
    console.warn(`⚠  ${label} exited with code ${result.status} — continuing anyway`);
  }
}

runScript('Migrations', join(backendDir, 'db', 'migrate.js'));
runScript('Seed data', join(backendDir, 'db', 'seed.js'));

console.log('\n→ Starting server...\n');

// Load the Express server in THIS process so Hostinger detects listen().
// Using createRequire because backend is CommonJS and this file is ESM.
const require = createRequire(import.meta.url);
require(join(backendDir, 'src', 'server.js'));
