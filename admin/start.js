// Hostinger locks the root directory to admin/ for this repo.
// This file is the Express entry point Hostinger calls — it installs
// the real backend's dependencies (if missing) then spawns it as a
// child process with the correct working directory.
import { spawn, execSync } from 'child_process';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const backendDir = join(__dirname, '..', 'backend');

if (!existsSync(join(backendDir, 'node_modules'))) {
  console.log('Installing backend dependencies...');
  execSync('npm install --omit=dev', { cwd: backendDir, stdio: 'inherit' });
}

console.log('Starting Hope For Families API from', backendDir);

const server = spawn(process.execPath, ['start.js'], {
  cwd: backendDir,
  env: process.env,
  stdio: 'inherit',
});

server.on('exit', (code) => process.exit(code ?? 0));
