import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('../..', import.meta.url)).replace(/[\\/]$/, '');
const source = readFileSync(join(root, 'src/ui/icon.paths.js'), 'utf8');
const context = { window: {}, globalThis: {} };
context.globalThis = context.window;
vm.runInNewContext(source, context, { filename: 'src/ui/icon.paths.js' });
const icons = context.window.TiinexIconPaths;
for (const key of ['create', 'multiverse', 'open', 'merge', 'lineage', 'source']) {
  if (!icons?.[key]?.includes('<path')) throw new Error(`missing icon ${key}`);
}
if (source.includes('GH') || source.includes('🔗')) throw new Error('icon vocabulary must not use ad hoc text or emoji glyphs');
console.log('✓ icon paths vocabulary passed');
