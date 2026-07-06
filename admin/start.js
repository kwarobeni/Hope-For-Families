// Hostinger locks root directory to admin/ for this monorepo.
// This file is the Express entry point Hostinger calls. It:
//   1. Installs backend dependencies
//   2. Builds the Astro frontend (so Express can serve it as static files)
//   3. Spawns the real Express server from backend/
import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendDir = join(__dirname, '..', 'backend');
const frontendDir = join(__dirname, '..', 'frontend');
const frontendDist = join(frontendDir, 'dist');

// 1. Install backend deps if missing
if (!existsSync(join(backendDir, 'node_modules'))) {
  console.log('→ Installing backend dependencies...');
  execSync('npm install --omit=dev', { cwd: backendDir, stdio: 'inherit' });
}

// 2. Build Astro frontend if not already built
if (!existsSync(frontendDist)) {
  console.log('→ Installing frontend dependencies...');
  execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });

  console.log('→ Building frontend...');
  execSync('npm run build', {
    cwd: frontendDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      PUBLIC_API_URL: process.env.PUBLIC_API_URL || 'https://hopeforfamiliescharity.org.uk/api',
      PUBLIC_PAYPAL_CLIENT_ID: process.env.PUBLIC_PAYPAL_CLIENT_ID || '',
    },
  });
  console.log('→ Frontend built.');
}

// 3. Tell the backend where the built frontend lives
process.env.FRONTEND_DIST = frontendDist;

console.log('→ Starting Express server from', backendDir);
const server = spawn(process.execPath, ['start.js'], {
  cwd: backendDir,
  env: process.env,
  stdio: 'inherit',
});

server.on('exit', (code) => process.exit(code ?? 0));
