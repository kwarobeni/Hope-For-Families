import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Hostinger Node.js app runs from /nodejs/ (outside public_html).
// Backend is FTP-deployed to public_html/backend/, so from /nodejs/
// the correct relative path is ../public_html/backend — not ../backend.
// We try several candidates so this works regardless of folder layout.
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

// Log which MySQL socket paths exist so we can configure DB_SOCKET
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
  console.error('[startup] ERROR: backend not found in any of the above paths.');
  process.exit(1);
}

console.log('[startup] starting backend from:', backendDir);

const server = spawn(process.execPath, ['start.js'], {
  cwd: backendDir,
  env: process.env,
  stdio: 'inherit',
});

server.on('exit', (code) => {
  process.exit(code ?? 0);
});
