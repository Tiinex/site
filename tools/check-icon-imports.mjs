import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const DENIED_FONT_AWESOME_EXPORTS = new Set([
  'faFolderArrowDown'
]);

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.site-publish') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (/\.(js|jsx|mjs|ts|tsx)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const files = walk(path.join(ROOT, 'src'));
const findings = [];
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8');
  for (const iconName of DENIED_FONT_AWESOME_EXPORTS) {
    if (text.includes(iconName)) {
      findings.push(`${path.relative(ROOT, file)} imports or references unavailable FontAwesome icon ${iconName}`);
    }
  }
}

if (findings.length) {
  console.error('✗ icon import guard failed');
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log('✓ icon import guard passed');
