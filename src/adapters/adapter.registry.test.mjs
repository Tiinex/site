import assert from 'assert';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { ADAPTER_DEFINITION_SCHEMA_ID, ADAPTER_RESULT_SCHEMA_ID, makeAdapterResult } from './adapter.contracts.js';
import { TiinexAdapterRegistry } from './registry.js';
import { gitNativeUnavailableResult } from './git-native/git-native.adapter.js';
import { materializeGithubFiles } from './github/github.adapter.js';
import { materializeLocalMarkdownFiles } from './local/local.adapter.js';
import { materializeExplicitUrls } from './static/static.adapter.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const adapterSchema = JSON.parse(readFileSync(join(__dirname, 'adapter.definition.schema.json'), 'utf8'));
assert(adapterSchema.$id === ADAPTER_DEFINITION_SCHEMA_ID, 'adapter definition JSON schema id must match runtime contract');
const registry = TiinexAdapterRegistry;
assert(registry.get('archive'), 'archive adapter must be registered');
assert(registry.get('github'), 'github adapter must be registered');
assert(registry.get('local'), 'local adapter must be registered');
assert(registry.get('git-native'), 'git-native adapter must be registered');
assert(registry.get('export'), 'export adapter must be registered');

for (const adapter of registry.adapters) {
  assert(adapter.schema === ADAPTER_DEFINITION_SCHEMA_ID, `${adapter.id} must use adapter definition schema`);
  assert(adapter.id && adapter.label, 'adapter requires id and label');
  assert(Array.isArray(adapter.sourceKinds) && adapter.sourceKinds.length, `${adapter.id} must expose at least one source kind`);
  assert(adapter.capabilities && typeof adapter.capabilities === 'object', `${adapter.id} must expose capabilities`);
  assert(adapter.resultShape?.schema === ADAPTER_RESULT_SCHEMA_ID, `${adapter.id} must describe adapter result shape`);
}

assert(registry.forSourceKind('archive.zip')?.id === 'archive', 'archive.zip source kind must resolve to archive adapter');
assert(registry.forSourceKind('github.repo')?.id === 'github', 'github.repo source kind must resolve to github adapter');
assert(registry.forSourceKind('local.session')?.id === 'local', 'local.session source kind must resolve to local adapter');
assert(registry.forSourceKind('git.native-repo')?.id === 'git-native', 'git.native-repo source kind must resolve to git-native adapter');

const unavailable = gitNativeUnavailableResult();
assert(unavailable.schema === ADAPTER_RESULT_SCHEMA_ID, 'unavailable result must use result schema');
assert(unavailable.state === 'unavailable', 'git-native unavailable result must be explicit');
assert(unavailable.errors.length === 1, 'git-native unavailable result must explain unavailability');

const partial = makeAdapterResult({ adapterId: 'x', records: [{}], errors: [{ code: 'x' }] });
assert(partial.state === 'partial', 'result with records and errors must be partial');

const githubSource = { id: 'github:owner/repo', repo: 'owner/repo', ref: 'main', rootPath: '.topics' };
const raw = 'https://raw.githubusercontent.com/owner/repo/main/.topics/a.md';
const result = await materializeGithubFiles(githubSource, [raw, 'missing.md'], {
  fetchImpl: async (url) => url === raw
    ? { ok: true, status: 200, text: async () => '# A\n\nbody' }
    : { ok: false, status: 404, statusText: 'Not Found' }
});
assert(result.schema === ADAPTER_RESULT_SCHEMA_ID, 'github materialize result must be contract-shaped');
assert(result.state === 'partial', 'github mixed fetch result must be partial');
assert(result.records.length === 1 && result.errors.length === 1, 'github result must preserve success and failure');
assert(!result.records[0].source, 'adapter result records must not attach lifecycle source provenance');


const localResult = await materializeLocalMarkdownFiles([
  { name: 'a.md', webkitRelativePath: 'notes/a.md', text: async () => '# Local A\n\nbody' },
  { name: 'image.png', webkitRelativePath: 'image.png', text: async () => 'binary' }
]);
assert(localResult.schema === ADAPTER_RESULT_SCHEMA_ID, 'local materialization result must be contract-shaped');
assert(localResult.records.length === 1, 'local adapter must materialize supported markdown files');
assert(localResult.warnings.length === 1, 'local adapter must report unsupported local files as warnings');
assert(!localResult.records[0].source, 'local adapter result records must not attach lifecycle source provenance');

const urlResult = await materializeExplicitUrls(['https://example.test/a.md', 'notaurl'], {
  fetchImpl: async (url) => url === 'https://example.test/a.md'
    ? { ok: true, status: 200, text: async () => '# URL A\n\nbody' }
    : { ok: false, status: 404, statusText: 'Not Found' }
});
assert(urlResult.schema === ADAPTER_RESULT_SCHEMA_ID, 'explicit URL result must be contract-shaped');
assert(urlResult.state === 'partial', 'explicit URL mixed result must be partial');
assert(urlResult.records.length === 1 && urlResult.errors.length === 1, 'explicit URL adapter must preserve success and failure');

console.log('✓ adapter registry tests passed');
