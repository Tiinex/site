import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const viteBin = process.platform === 'win32'
  ? join(root, 'node_modules', '.bin', 'vite.cmd')
  : join(root, 'node_modules', '.bin', 'vite');

const requiredPackages = [
  'react',
  'react-dom',
  'vite',
  '@vitejs/plugin-react',
  '@fortawesome/react-fontawesome'
];

function packageInstalled(pkg) {
  return existsSync(join(root, 'node_modules', ...pkg.split('/'), 'package.json'));
}

function hasRequiredDeps() {
  return existsSync(viteBin) && requiredPackages.every(packageInstalled);
}

function hasLockfile() {
  return existsSync(join(root, 'package-lock.json'));
}

if (hasRequiredDeps()) {
  console.log('[tiinex] dependencies already installed.');
  process.exit(0);
}

const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const args = hasLockfile()
  ? ['ci', '--no-audit', '--no-fund']
  : ['install', '--no-audit', '--no-fund'];

console.log(`[tiinex] installing dependencies with: npm ${args.join(' ')}`);
const result = spawnSync(npmCommand, args, {
  cwd: root,
  stdio: 'inherit',
  shell: false
});

if (result.error) {
  console.error(`[tiinex] failed to start npm: ${result.error.message}`);
  process.exit(1);
}

if (result.status !== 0) {
  console.error(`[tiinex] npm ${args[0]} failed with exit code ${result.status}.`);
  process.exit(result.status ?? 1);
}

if (!hasRequiredDeps()) {
  console.error('[tiinex] dependencies install completed, but required dev/runtime packages are still missing.');
  process.exit(1);
}

console.log('[tiinex] dependencies ready.');
