import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { loadFullLineageCommand } from '../app/lineageCommand.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';

await import('../workspaces/workspace.lifecycle.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;

const docsSource = Object.freeze({
  id: 'github:tiinex/docs', adapterId: 'github', kind: 'github-tree', sourceKind: 'github.repo',
  label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics', sourceBacked: true
});

function artifact({ id, title, path, trace = '', source = docsSource, sourceMode = '', sourceTarget = {}, snapshot = {} }) {
  const markdown = [
    '# Continuity Context', '',
    '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
    trace ? '- Parent' : '',
    trace ? '  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)' : '',
    trace ? `  - Trace: [Parent](${trace})` : '',
    '- Current',
    '  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)',
    `  - Summary: ${title}`, '', '---', '', `# ${title}`
  ].filter(Boolean).join('\n');
  return Object.assign(createRecordFromMarkdown(markdown, { path, sourceMode }), {
    id, title, path, source, sourceMode, sourceTarget: Object.assign({}, sourceTarget), snapshot: Object.assign({}, snapshot)
  });
}

const issueRoot = artifact({
  id: 'issue-root-9', title: 'Welcome to the Next Dimension',
  path: '.topics/.github/tiinex/docs/.issues/9/issue-root-recovered-welcome-to-the-next-dimension.trace.md',
  sourceMode: 'github-issue-embedded-artifact',
  sourceTarget: { targetKind: 'github-issue-embedded-artifact', inputTarget: 'https://github.com/Tiinex/docs/issues/9' },
  snapshot: { embedded: true, sourceUrl: 'https://github.com/Tiinex/docs/issues/9' }
});
const siliconEmbedded = artifact({
  id: 'silicon-valley-embedded', title: 'Silicon Valley',
  path: '.topics/.github/tiinex/docs/.issues/9/comment-002-4881782365-recovered-silicon-valley.trace.md',
  trace: 'https://github.com/Tiinex/docs/issues/9', sourceMode: 'github-comment-embedded-artifact',
  sourceTarget: { targetKind: 'github-comment-embedded-artifact', inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365' },
  snapshot: { embedded: true, sourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365' }
});
const siliconShell = artifact({
  id: 'silicon-valley-shell', title: 'GitHub comment 4881782365',
  path: '.topics/.github/tiinex/docs/.issues/9/comment-002-4881782365.trace.md',
  sourceMode: 'github-comment-shell',
  sourceTarget: { targetKind: 'github-comment-shell', inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365' },
  snapshot: { sourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365' }
});
// Broad repo/source material can contain more than one weak path representation.
// These intentionally make the child's legacy relative Trace ambiguous.
const weakPath = '.topics/.github/tiinex/docs/.issues/9/comment-003-4881782365-recovered-continuity-context.trace.md';
const weakAliasA = artifact({ id: 'weak-relative-a', title: 'Broad repo continuity A', path: weakPath, sourceMode: 'github-tree-file' });
const weakAliasB = artifact({ id: 'weak-relative-b', title: 'Broad repo continuity B', path: weakPath, sourceMode: 'github-tree-file' });
const rewatch = artifact({
  id: 're-watch-silicon-valley', title: 'Re-watch Silicon Valley',
  path: '.topics/.github/tiinex/docs/.issues/9/comment-004-4930310346-recovered-re-watch-silicon-valley.trace.md',
  trace: 'comment-003-4881782365-recovered-continuity-context.trace.md',
  sourceMode: 'github-comment-embedded-artifact',
  sourceTarget: {
    targetKind: 'github-comment-embedded-artifact',
    inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4930310346',
    parentSourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365',
    parentRawUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365',
    parentArtifactPath: '.topics/.github/tiinex/docs/.issues/9/comment-002-4881782365-recovered-silicon-valley.trace.md'
  },
  snapshot: {
    embedded: true,
    sourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4930310346',
    parentSourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365',
    parentRawUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365',
    parentArtifactPath: '.topics/.github/tiinex/docs/.issues/9/comment-002-4881782365-recovered-silicon-valley.trace.md'
  }
});

const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Tiinex/docs lineage' });
let state = created.state;
let workspace = lifecycle.activeWorkspace(state);
workspace.sources = [docsSource];
workspace.records = [weakAliasA, weakAliasB, siliconShell, issueRoot, siliconEmbedded, rewatch];

const initialView = buildWorkspaceLineageView(workspace, { selectedRecordId: rewatch.id });
assert.deepEqual(initialView.selectedTraversal.nodes.map((node) => node.title), ['Re-watch Silicon Valley', 'Silicon Valley', 'Welcome to the Next Dimension'], 'strong declared comment/source binding must beat ambiguous weak relative candidates');
assert.equal(initialView.selectedTraversal.ambiguous, false);
assert.equal(initialView.selectedTraversal.rootReached, true);
assert.equal(initialView.selectedTraversal.terminalState, 'root-reached');
assert(initialView.edges.some((edge) => edge.from === siliconEmbedded.id && edge.to === rewatch.id), 'embedded Tiinex artifact must win over publication shell for exact comment identity');
assert(!initialView.edges.some((edge) => edge.from === siliconShell.id && edge.to === rewatch.id), 'publication shell must not become the semantic parent when embedded artifact is loaded');

const loaded = await loadFullLineageCommand({ lifecycle, state, workspace, selectedRecordId: rewatch.id, clock: () => '2026-08-13T20:00:00.000Z' });
assert.equal(loaded.ok, true, loaded.error);
assert.equal(loaded.recoveredParents, 0, 'already loaded strong parent chain should not trigger source recovery');
assert.equal(loaded.lineageLoadReport.nodes, 3, 'product Load full lineage path should expose the three-node published chain');
assert.equal(loaded.lineageLoadReport.rootReached, true, 'product Load full lineage path should prove terminal root');
assert.equal(loaded.lineageLoadReport.ambiguous, false);
assert.equal(loaded.lineageLoadReport.state, 'complete');
assert.equal(loaded.notice, 'Full loaded-workspace lineage index ready.');

// Without any stronger declaration, the same weak path ambiguity must remain ambiguous.
const weakOnlyChild = artifact({
  id: 'weak-only-child', title: 'Weak ambiguous child',
  path: '.topics/.github/tiinex/docs/.issues/9/comment-005-weak-child.trace.md',
  trace: 'comment-003-4881782365-recovered-continuity-context.trace.md', sourceMode: 'github-tree-file'
});
const ambiguousView = buildWorkspaceLineageView({ id: 'ambiguous', title: 'Ambiguous', records: [weakAliasA, weakAliasB, weakOnlyChild] }, { selectedRecordId: weakOnlyChild.id });
assert.equal(ambiguousView.selectedTraversal.ambiguous, true, 'genuinely ambiguous weak evidence must remain ambiguous');
assert.equal(ambiguousView.selectedTraversal.rootReached, false);
assert.equal(ambiguousView.selectedTraversal.terminalState, 'ambiguous-parent');

// Preserve the known-good FS25 issue chain demonstrated in the same Q run.
const fsRoot = artifact({ id: 'fs25-root', title: 'FS25 Markaryd', path: '.topics/.github/tiinusen/socials/.issues/3/issue-root-recovered-fs25-markaryd.workspace.md', source: Object.assign({}, docsSource, { id: 'github:tiinusen/socials', label: 'Tiinusen/socials', repo: 'Tiinusen/socials' }), sourceMode: 'github-issue-embedded-artifact', sourceTarget: { inputTarget: 'https://github.com/Tiinusen/socials/issues/3' }, snapshot: { embedded: true, sourceUrl: 'https://github.com/Tiinusen/socials/issues/3' } });
const klagomuren = artifact({ id: 'klagomuren', title: 'Klagomuren', path: '.topics/.github/tiinusen/socials/.issues/3/comment-002-5011116876-recovered-klagomuren.trace.md', trace: 'https://github.com/Tiinusen/socials/issues/3', source: fsRoot.source, sourceMode: 'github-comment-embedded-artifact', sourceTarget: { inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876' }, snapshot: { embedded: true, sourceUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876' } });
const farms = artifact({ id: 'fler-bondgardar', title: 'Fler bondgårdar', path: '.topics/.github/tiinusen/socials/.issues/3/comment-004-5011198457-recovered-fler-bondgardar.trace.md', trace: 'comment-002-5011116876-recovered-klagomuren.trace.md', source: fsRoot.source, sourceMode: 'github-comment-embedded-artifact', sourceTarget: { inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011198457', parentSourceUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876' }, snapshot: { embedded: true, sourceUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011198457', parentSourceUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876' } });
const fsView = buildWorkspaceLineageView({ id: 'fs25', title: 'FS25', records: [fsRoot, klagomuren, farms] }, { selectedRecordId: farms.id });
assert.deepEqual(fsView.selectedTraversal.nodes.map((node) => node.title), ['Fler bondgårdar', 'Klagomuren', 'FS25 Markaryd']);
assert.equal(fsView.selectedTraversal.rootReached, true, 'known-good FS25 chain must remain root-complete');

console.log('✓ M2 Q lineage parent-authority correction tests passed');
