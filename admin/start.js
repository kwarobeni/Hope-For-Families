// Hostinger locks the Node.js app root to admin/.
// This file lives alongside the compiled Vite build in public_html/admin/.
// It simply starts the Express backend — Apache already serves the Astro
// frontend as static files, so no frontend build step is needed here.
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendDir = join(__dirname, '..', 'backend');

console.log('[startup] admin dir  :', __dirname);
console.log('[startup] backend dir:', backendDir, '— exists:', existsSync(backendDir));

if (!existsSync(backendDir)) {
  console.error('[startup] ERROR: backend directory not found at', backendDir);
  console.error('[startup] Make sure the backend has been deployed via GitHub Actions.');
  process.exit(1);
}

console.log('[startup] Starting Express backend...');

const server = spawn(process.execPath, ['start.js'], {
  cwd: backendDir,
  env: process.env,
  stdio: 'inherit',
});

server.on('exit', (code) => {
  console.log('[startup] Backend exited with code', code);
  process.exit(code ?? 0);
});
