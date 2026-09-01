import assert from 'node:assert/strict';
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { schemaRegistry } from './registry.js';
import { resolveFindingMessage } from '../validation/i18n.js';
import { normalizeFinding } from '../validation/findings.js';

const root = fileURLToPath(new URL('../..', import.meta.url)).replace(/[\\/]$/, '');
const schemaRoot = join(root, 'src/schemas');

function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full.replace(root + '/', '').replaceAll('\\', '/'));
  }
  return out;
}

const files = walk(schemaRoot);
for (const module of schemaRegistry.modules) {
  assert(files.some((file) => file.endsWith(`/${module.id}.schema.md`) || file === `src/schemas/${module.id}.schema.md`), `${module.id} must use versioned schema snapshot naming`);
  assert(files.some((file) => file.endsWith(`/${module.id}.schema.json`) || file === `src/schemas/${module.id}.schema.json`), `${module.id} must use versioned binding naming`);
  assert(files.some((file) => file.endsWith(`/${module.id}.schema.js`) || file === `src/schemas/${module.id}.schema.js`), `${module.id} must use versioned module naming`);
  if (module.findings?.codes) {
    for (const [code, definition] of Object.entries(module.findings.codes)) {
      assert.equal(definition.messageKey || code, code, `${module.id} finding ${code} should use the finding code as message key unless explicitly justified`);
      const rendered = resolveFindingMessage(normalizeFinding({ code, source: module.id }, { schemaId: module.id }), { locale: 'en', schemaId: module.id });
      assert.notEqual(rendered, code, `${module.id} finding ${code} must render through i18n or have an explicit fallback`);
    }
  }
}

const inertSurfaceOrFormFiles = files.filter((file) => /\.(feed|tree|lineage|detail|preview|share|graph)\.presenter\.js$|\.(create|edit|quick|full)\.form\.js$/.test(file));
assert.deepEqual(inertSurfaceOrFormFiles, [], 'inactive surface presenter/form scaffold files should not ship before a real divergent owner exists');

const sv = resolveFindingMessage(normalizeFinding({ code: 'topic.body.thin', source: 'tiinex.topic.v1' }, { schemaId: 'tiinex.topic.v1' }), { locale: 'sv', schemaId: 'tiinex.topic.v1' });
assert.equal(sv, 'Topic body is thin; reader may not understand the active topic thread.', 'missing locale-specific key should fall back explicitly to English pack');

console.log('✓ schema companion contract is flat, versioned, i18n-backed, and free of inert scaffold files');
