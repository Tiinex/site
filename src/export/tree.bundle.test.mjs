import assert from 'node:assert/strict';
import { buildWorkspaceTreeExportBundle, inspectTreeExportBundle, normalizeTreePath } from './tree.bundle.js';
import { exportTreeZipUint8Array } from './package.zip.js';
import { zipBufferToImportEntries } from '../adapters/archive/archive.adapter.js';

const workspace = {
  id: 'ws',
  title: 'Export UX',
  records: [
    {
      id: 'source:topic',
      path: '.topics/.github/tiinusen/socials/.issues/3/001-lagar-och-regler.trace.md',
      title: 'Lagar och regler',
      markdown: '# Lagar och regler\n\nNu ska vi få ordning på torpet',
      source: { adapterId: 'github', boundary: 'explicit source-backed material' }
    },
    {
      id: 'local:task',
      path: '.topics/.github/tiinusen/socials/.issues/3/001-1-continue-lagar-och-regler.trace.md',
      title: 'Continue · Lagar och regler',
      markdown: '# Continue · Lagar och regler\n\nContinuation leaf',
      sourceMode: 'local-transition',
      source: { adapterId: 'local', kind: 'local-session' }
    },
    {
      id: 'package:local:task',
      path: 'artifacts/.topics/.github/tiinusen/socials/.issues/3/001-2-package-imported-task.trace.md',
      title: 'Package imported task',
      markdown: '# Package imported task\n\nPackage prefix must not leak.',
      sourceMode: 'package-import',
      source: { adapterId: 'export-package', kind: 'local-session', sourceBacked: false }
    },
    {
      id: 'github:fixed-003',
      path: '.topics/.github/tiinusen/socials/.issues/3/comment-003-5011140374-recovered-1-ngkvistlagen.trace.md',
      title: '§1 Ängkvistlagen',
      markdown: '# §1 Ängkvistlagen\n\nFixed ordinal recovered comment.',
      sourceMode: 'github-comment-embedded-artifact',
      source: { adapterId: 'github', repo: 'Tiinusen/socials' },
      sourceTarget: { inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011140374' }
    },
    {
      id: 'github:bare-long-id',
      path: 'comment-5011198457-fler-bondgårdar.trace.md',
      title: 'Fler bondgårdar',
      markdown: '# Fler bondgårdar\n\nLong comment id must not become a logical tree filename.',
      sourceMode: 'github-comment-embedded-artifact',
      source: { adapterId: 'github', repo: 'Tiinusen/socials' },
      sourceTarget: { inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011198457' }
    }
  ],
  assets: [
    { id: 'asset:1', path: 'assets/evidence/note.txt', name: 'note.txt', content: 'asset note', type: 'text/plain' }
  ]
};

const bundle = buildWorkspaceTreeExportBundle(workspace, { clock: () => '2026-08-07T08:00:00.000Z' });
assert.equal(bundle.schema, 'tiinex.export.tree.bundle.v1');
assert.equal(bundle.exportType, 'tree');
assert.equal(bundle.transportLevel, 'TL0');
assert.equal(bundle.transport.schema, 'tiinex.transport.operationPlan.v1');
assert.equal(bundle.transport.operation, 'local-download');
assert.equal(bundle.transport.credentialMaterialIncluded, false);
assert.equal(bundle.packageEnvelope, false);
assert.equal(bundle.status, 'ready');
assert.equal(bundle.counts.records, 5);
assert.equal(bundle.counts.assets, 1);
const paths = bundle.files.map((file) => file.path).sort();
assert.deepEqual(paths, [
  '.topics/.github/tiinusen/socials/.issues/3/001-1-continue-lagar-och-regler.trace.md',
  '.topics/.github/tiinusen/socials/.issues/3/001-2-package-imported-task.trace.md',
  '.topics/.github/tiinusen/socials/.issues/3/001-lagar-och-regler.trace.md',
  '.topics/.github/tiinusen/socials/.issues/3/003-1-ngkvistlagen.trace.md',
  '.topics/.github/tiinusen/socials/.issues/3/004-fler-bondg-rdar.trace.md',
  'assets/evidence/note.txt'
].sort(), 'ordinary tree export must mirror logical paths without artifacts/ or tiinex.package/ envelope');
assert(paths.every((path) => !path.startsWith('artifacts/') && !path.startsWith('tiinex.package/')));
assert.equal(inspectTreeExportBundle(bundle).status, 'valid');

const zip = exportTreeZipUint8Array(bundle);
const imported = await zipBufferToImportEntries(zip, { source: 'tree-export-roundtrip', excludeRepositoryInternals: true });
assert.equal(imported.entries.filter((entry) => entry.kind === 'record').length, 5);
assert(imported.entries.some((entry) => entry.path === '.topics/.github/tiinusen/socials/.issues/3/001-1-continue-lagar-och-regler.trace.md'), 'tree import sees the same logical path after unzip');
assert(!imported.entries.some((entry) => entry.path.startsWith('artifacts/')), 'tree import must not see package envelope folder');
assert(!imported.entries.some((entry) => entry.path.startsWith('tiinex.package/')), 'tree import must not see package control folder');

assert.equal(normalizeTreePath('../bad/leaf.trace.md'), 'bad/leaf.trace.md');
assert.equal(normalizeTreePath('.topics/a/001'), '.topics/a/001.md');



const invalidEnvelopeBundle = {
  schema: 'tiinex.export.tree.bundle.v1',
  packageEnvelope: false,
  files: [{ path: 'artifacts/.topics/bad.trace.md', content: '# Bad', kind: 'artifact-markdown' }]
};
assert.equal(inspectTreeExportBundle(invalidEnvelopeBundle).status, 'invalid', 'ordinary tree export treats package envelope paths as invalid, not degraded');
assert.throws(() => exportTreeZipUint8Array(invalidEnvelopeBundle), /export\.tree\.zip\.bundle\.invalid/);


const workspaceWithEntry = {
  id: 'ws-entry',
  title: 'Imported Gaming',
  workspaceMarkdown: '# Imported Gaming\n\n- Current Schema: [tiinex.workspace.v1](tiinex.workspace.v1.schema.md)\n',
  workspaceImport: { path: '.topics/gaming/000-gaming.workspace.md' },
  records: [{ id: 'entry-record', title: 'Leaf', path: '.topics/gaming/001-leaf.trace.md', markdown: '# Leaf' }],
  assets: [],
  workspaceMergeCandidates: [{ id: 'candidate', path: '.topics/gaming/999-extra.workspace.md', title: 'Extra', markdown: '# Extra\n\n- Current Schema: [tiinex.workspace.v1](tiinex.workspace.v1.schema.md)\n' }]
};
const entryBundle = buildWorkspaceTreeExportBundle(workspaceWithEntry, { clock: () => '2026-08-09T00:00:00.000Z' });
assert.equal(entryBundle.counts.workspaceEntries, 2, 'tree export should preserve workspace entrypoints/candidates, not only leaf records');
assert(entryBundle.files.some((file) => file.kind === 'workspace-markdown' && file.path === '.topics/gaming/000-gaming.workspace.md'));
assert(entryBundle.files.some((file) => file.kind === 'workspace-markdown' && file.path === '.topics/gaming/999-extra.workspace.md'));
const entryZip = exportTreeZipUint8Array(entryBundle);
const entryImported = await zipBufferToImportEntries(entryZip, { source: 'tree-export-roundtrip', excludeRepositoryInternals: true });
assert.equal(entryImported.entries.filter((entry) => entry.kind === 'workspace').length, 2, 'roundtrip parser must see exported workspace entries as Open/Merge candidates again');
assert.equal(entryImported.entries.filter((entry) => entry.kind === 'record').length, 1);

console.log('✓ tree export bundle tests passed');
