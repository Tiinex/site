import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildWorkspaceDiscoveryView } from '../workspaces/workspace.discoveryView.js';
import { displayOptionsActiveConstraintCount } from '../workspaces/workspace.displayOptions.js';
import { recordSchemaBadge, recordSchemaCanOpen, recordSchemaOpenValue } from '../schemas/workspace/workspace.viewFormatting.js';
import { recordMatchesQuery } from '../workspaces/workspace.displayFilters.js';

const index = fs.readFileSync('index.html', 'utf8');
const tokens = fs.readFileSync('src/styles/tokens.css', 'utf8');
const txBg = tokens.match(/--tx-bg:\s*(#[0-9a-fA-F]{6})/)?.[1] || '';
assert.ok(txBg, 'normal theme must expose a concrete --tx-bg token for static prepaint parity');
const prepaintAt = index.indexOf('id="tiinex-prepaint-fallback"');
const moduleAt = index.indexOf('type="module"');
assert.ok(prepaintAt >= 0 && moduleAt > prepaintAt, 'pre-module shell must own a Tiinex prepaint fallback before the React module executes');
assert.ok(index.includes(`html,body,#root{background:${txBg}}`), 'prepaint fallback stays byte-value aligned with the established --tx-bg theme token');
assert.equal(/Opening workspace|EmptyStage|Start Tiinex/i.test(index.slice(prepaintAt, moduleAt)), false, 'static prepaint shell must not claim workspace/startup ownership');

const choice = fs.readFileSync('src/schemas/workspace/workspace.entrypointChoice.views.jsx', 'utf8');
assert.match(choice, /Open[\s\S]*Replace current source\/non-draft workspace context[\s\S]*durable unpublished local work protected/, 'Open copy explains replacement and durable-local preservation');
assert.match(choice, /Merge[\s\S]*Keep the current workspace context[\s\S]*Add or update matching incoming workspaces and sources/, 'Merge copy explains retention plus add/update behavior');

const schemaDefinition = { id: 'schema', title: 'Schema module', path: '.topics/.schemas/x.schema.md', envelopeSchemaId: 'tiinex.schema.module.v1', kind: 'schema-definition', sourceMode: 'source-backed', source: { adapterId: 'github' }, markdown: '# Schema' };
const plain = { id: 'plain', title: 'README', path: 'README.md', kind: 'markdown', sourceMode: 'local-manual', source: { adapterId: 'local' }, markdown: '# README' };
const task = { id: 'task', title: 'Task', summary: 'A task summary', path: '001.trace.md', schemaId: 'tiinex.task.v1', kind: 'markdown', status: 'open', sourceMode: 'local-manual', source: { adapterId: 'local' }, markdown: '# Task\nBody-only needle' };
const workspace = { id: 'w', records: [schemaDefinition, plain, task], assets: [] };
const defaults = { leavesOnly: true, showSupportingMarkdown: false, showWorkspaceArtifacts: true, showAssets: false, mismatchesOnly: false, schemaFilter: 'all', artifactFilter: 'all', sourceFilter: 'all' };
const defaultView = buildWorkspaceDiscoveryView(workspace, { displayOptions: defaults, query: '' });
assert.deepEqual(defaultView.records.map((record) => record.id), ['task'], 'default Discovery still prioritizes work leaves instead of blanket-showing schema/support material');
const schemaView = buildWorkspaceDiscoveryView(workspace, { displayOptions: { ...defaults, schemaFilter: 'tiinex.schema.module.v1' }, query: '' });
assert.deepEqual(schemaView.records.map((record) => record.id), ['schema'], 'an explicit qualified Schema selection must reveal its match instead of being vetoed by default leaf/support visibility');
const allAgain = buildWorkspaceDiscoveryView(workspace, { displayOptions: { ...defaults, schemaFilter: 'all' }, query: '' });
assert.deepEqual(allAgain.records.map((record) => record.id), ['task'], 'returning to All schemas restores normal default visibility semantics');

assert.equal(recordSchemaOpenValue(plain), '', 'kind-only Markdown is not presentation schema identity');
assert.equal(recordSchemaBadge(plain), 'artifact', 'kind-only Markdown gets a neutral artifact badge rather than a fake schema badge');
assert.equal(recordSchemaCanOpen(plain), false, 'kind-only Markdown does not expose schema navigation');
assert.equal(recordSchemaOpenValue(task), 'tiinex.task.v1');
assert.equal(recordSchemaBadge(task), 'task');

assert.equal(recordMatchesQuery(task, 'A task summary'), true, 'current discovery search covers summary');
assert.equal(recordMatchesQuery(task, '001.trace'), true, 'current discovery search covers path');
assert.equal(recordMatchesQuery(task, 'tiinex.task.v1'), true, 'current loaded-material search may broaden when schema coverage is actually implemented');
assert.equal(recordMatchesQuery(task, 'Body-only needle'), true, 'current loaded-material search may broaden when body coverage is actually implemented');
const chrome = fs.readFileSync('src/schemas/workspace/workspace.chrome.views.jsx', 'utf8');
assert.ok(chrome.includes('Search title/body/schema/path…'), 'search placeholder states the actual bounded loaded-material search contract');

assert.equal(displayOptionsActiveConstraintCount(defaults), 3, 'display badge counts active presentation constraints, not hidden artifact cardinality');
assert.ok(chrome.includes('activeDisplayConstraintCount'), 'toolbar consumes active-constraint semantics');
assert.ok(chrome.includes(' active`'), 'toolbar describes the count as active constraints rather than hidden artifacts');
assert.equal(chrome.includes('${hiddenPresentationCount} hidden'), false, 'old hidden-cardinality wording is removed');

console.log('post-v428 pre-Q product parity hardening presentation truth: PASS');
