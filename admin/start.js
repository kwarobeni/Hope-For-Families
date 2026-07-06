// Entry point Hostinger calls (root dir locked to admin/).
// Backend deps are installed via postinstall in package.json.
// This file builds the Astro frontend (if needed) then spawns Express.
import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendDir  = join(__dirname, '..', 'backend');
const frontendDir = join(__dirname, '..', 'frontend');
const frontendDist = join(frontendDir, 'dist');

// Diagnostic — visible in Hostinger Runtime logs
console.log('=== Hope For Families startup ===');
console.log('admin dir  :', __dirname);
console.log('backend dir:', backendDir, '| exists:', existsSync(backendDir));
console.log('backend nm :', join(backendDir, 'node_modules'), '| exists:', existsSync(join(backendDir, 'node_modules')));
console.log('frontend dist:', frontendDist, '| exists:', existsSync(frontendDist));

// Build Astro frontend on first deploy (node_modules were installed via postinstall)
if (!existsSync(frontendDist)) {
  console.log('→ Installing frontend dependencies...');
  execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });

  console.log('→ Building Astro frontend...');
  execSync('npm run build', {
    cwd: frontendDir,
    stdio: 'inherit',
    env: {
      ...process.env,
      PUBLIC_API_URL: process.env.PUBLIC_API_URL || 'https://hopeforfamiliescharity.org.uk/api',
      PUBLIC_PAYPAL_CLIENT_ID: process.env.PUBLIC_PAYPAL_CLIENT_ID || '',
    },
  });
  console.log('→ Frontend built successfully.');
}

// Pass frontend dist path to the Express server
process.env.FRONTEND_DIST = frontendDist;

console.log('→ Spawning Express server from', backendDir);
const server = spawn(process.execPath, ['start.js'], {
  cwd: backendDir,
  env: process.env,
  stdio: 'inherit',
});

server.on('exit', (code) => {
  console.log('Server process exited with code', code);
  process.exit(code ?? 0);
});
