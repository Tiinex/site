import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { resolveLineage } from './lineage.resolve.js';
import { resolveAuditLineage } from '../audit/lineage/auditLineage.resolve.js';

function leaf({ title, id, trace = '', origin = '', path = `${id}.md`, source = null }) {
  const markdown = [
    '# Continuity Context',
    '',
    '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
    trace || origin ? '- Parent' : '',
    trace || origin ? '  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)' : '',
    trace ? `  - Trace: ${trace}` : '',
    origin ? `  - Origin: ${origin}` : '',
    '- Current',
    '  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)',
    '  - Created At: 2026-07-21T00:00:00.000Z',
    `  - Summary: ${title}`,
    '',
    '---',
    '',
    `# ${title}`,
    '',
    '# Continuity Integrity',
    '',
    '- Test Integrity',
    '  - Method: fixture',
    '  - Value: ok'
  ].filter(Boolean).join('\n');
  const record = Object.assign(createRecordFromMarkdown(markdown, { path }), { id });
  if (source) record.source = Object.assign({}, source);
  return record;
}

const parent = leaf({ id: 'parent-1', title: 'Parent', path: 'topics/parent.md' });
const childByTrace = leaf({ id: 'child-1', title: 'Child Trace', trace: 'record:parent-1', origin: 'topics/parent.md', path: 'topics/child.md' });
const childByOrigin = leaf({ id: 'child-2', title: 'Child Origin', origin: 'topics/parent.md', path: 'topics/child-origin.md' });
const childMissing = leaf({ id: 'child-3', title: 'Child Missing', trace: 'record:missing-parent', origin: 'missing.md', path: 'topics/child-missing.md' });

const result = resolveLineage([parent, childByTrace, childByOrigin, childMissing]);
assert.equal(result.schema, 'tiinex.lineage.view.v1', 'lineage result declares view schema');
assert.equal(result.stats.nodes, 4, 'lineage should include all nodes');
assert(result.edges.some((edge) => edge.from === 'parent-1' && edge.to === 'child-1' && edge.kind === 'parent'), 'trace should resolve parent edge');
assert(result.edges.some((edge) => edge.from === 'parent-1' && edge.to === 'child-2' && edge.kind === 'origin'), 'origin-only recovery should resolve origin edge');
assert(result.edges.some((edge) => edge.to === 'child-3' && edge.status === 'missing'), 'missing trace should produce missing edge');
assert(result.findings.some((finding) => finding.code === 'lineage.parent.missing' && finding.nodeId === 'child-3'), 'missing parent finding should be emitted');
assert.equal(parent.trace, '', 'root record should expose empty trace');
assert.equal(childByTrace.trace, 'record:parent-1', 'record shaping should preserve parsed Trace');
assert.equal(childByTrace.origin, 'topics/parent.md', 'record shaping should preserve parsed Origin');


const nestedOriginMarkdown = [
  '# Continuity Context',
  '',
  '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
  '- Parent',
  '  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)',
  '  - Trace: record:missing-url-parent',
  '  - Origin:',
  '    - [browse + git](https://github.com/Tiinex/docs/blob/abcdef/topics/parent.md)',
  '- Current',
  '  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)',
  '  - Created At: 2026-07-21T00:00:00.000Z',
  '  - Summary: Child Origin URL',
  '',
  '---',
  '',
  '# Child Origin URL',
  '',
  '# Continuity Integrity',
  '',
  '- Test Integrity',
  '  - Method: fixture',
  '  - Value: ok'
].join('\n');
const childByNestedOriginUrl = Object.assign(createRecordFromMarkdown(nestedOriginMarkdown, { path: 'topics/child-url.md' }), { id: 'child-url' });
const urlResult = resolveLineage([parent, childByNestedOriginUrl]);
assert.equal(childByNestedOriginUrl.origin, 'https://github.com/Tiinex/docs/blob/abcdef/topics/parent.md', 'parser should preserve nested Origin link target');
assert(urlResult.edges.some((edge) => edge.from === 'parent-1' && edge.to === 'child-url' && edge.kind === 'origin' && edge.method === 'path'), 'origin URL should resolve loaded parent by explicit GitHub file path');



const sourceA = { id: 'github:tiinex-docs:master:.topics', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics' };
const sourceB = { id: 'github:tiinex-docs-other:master:.topics', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/other', repo: 'Tiinex/other', ref: 'master', rootPath: '.topics' };
const doomTrace = leaf({ id: 'doom-trace', title: 'Doom Trace', path: '.topics/educational/memes/doom/001.trace.md', source: sourceA });
const doomMeme = leaf({ id: 'doom-meme', title: 'World Wide Wave 3 Meme', path: '.topics/educational/memes/doom/world-wide-wave-3-meme.md', trace: '001.trace.md', source: sourceA });
const unrelatedTrace = leaf({ id: 'other-trace', title: 'Other Trace', path: '.topics/educational/memes/other/001.trace.md', source: sourceA });
const relative = resolveLineage([doomTrace, doomMeme, unrelatedTrace]);
assert(relative.edges.some((edge) => edge.from === 'doom-trace' && edge.to === 'doom-meme' && edge.method === 'relative-path'), 'filename-relative Parent Trace should resolve against declaring record directory');
assert(!relative.edges.some((edge) => edge.from === 'other-trace' && edge.to === 'doom-meme'), 'filename-relative Parent Trace must not fall back to a global basename match');
assert(!relative.findings.some((finding) => finding.nodeId === 'doom-meme' && finding.code === 'lineage.target.ambiguous'), 'sibling-relative target should not become ambiguous because another folder has the same basename');

const missingSiblingOnly = leaf({ id: 'missing-sibling-only', title: 'Missing Sibling Only', path: '.topics/educational/memes/none/meme.md', trace: '001.trace.md', source: sourceA });
const noGlobalBasename = resolveLineage([unrelatedTrace, missingSiblingOnly]);
assert(noGlobalBasename.findings.some((finding) => finding.nodeId === 'missing-sibling-only' && finding.code === 'lineage.parent.missing'), 'missing sibling-relative target should be missing, not guessed from another folder basename');
assert(!noGlobalBasename.edges.some((edge) => edge.from === 'other-trace' && edge.to === 'missing-sibling-only'), 'global basename fallback must never create a guessed edge');

const parentViaDotDot = leaf({ id: 'dotdot-parent', title: 'Dot Dot Parent', path: '.topics/lineage/parent.trace.md', source: sourceA });
const childViaDotDot = leaf({ id: 'dotdot-child', title: 'Dot Dot Child', path: '.topics/lineage/child/child.md', trace: '../parent.trace.md', source: sourceA });
const dotdot = resolveLineage([parentViaDotDot, childViaDotDot]);
assert(dotdot.edges.some((edge) => edge.from === 'dotdot-parent' && edge.to === 'dotdot-child' && edge.method === 'relative-path'), '../ Parent Trace should resolve within the declaring source root');

const narrowRoot = { id: 'github:tiinex-docs:master:.topics-area', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics/area' };
const outsideParent = leaf({ id: 'outside-parent', title: 'Outside Parent', path: '.topics/parent.trace.md', source: narrowRoot });
const boundaryChild = leaf({ id: 'boundary-child', title: 'Boundary Child', path: '.topics/area/child.md', trace: '../parent.trace.md', source: narrowRoot });
const boundary = resolveLineage([outsideParent, boundaryChild]);
assert(boundary.edges.some((edge) => edge.from === 'outside-parent' && edge.to === 'boundary-child' && edge.method === 'relative-path'), 'lineage should resolve exact relative Parent Trace inside the same source boundary even when it crosses the discovery root');
assert(!boundary.findings.some((finding) => finding.nodeId === 'boundary-child' && finding.code === 'lineage.target.outOfBoundary'), 'source root is discovery scope, not a lineage parent-file boundary');

const samePathA2 = leaf({ id: 'same-a2', title: 'Same A2', path: 'shared/topic.md', source: sourceA });
const samePathB2 = leaf({ id: 'same-b2', title: 'Same B2', path: 'shared/topic.md', source: sourceB });
const childFromA = leaf({ id: 'child-from-a', title: 'Child From A', path: 'children/child-from-a.md', origin: 'shared/topic.md', source: sourceA });
const sourceScoped = resolveLineage([samePathA2, samePathB2, childFromA]);
assert(sourceScoped.edges.some((edge) => edge.from === 'same-a2' && edge.to === 'child-from-a'), 'source-backed child should resolve repo-relative targets within its own source identity');
assert(!sourceScoped.edges.some((edge) => edge.from === 'same-b2' && edge.to === 'child-from-a'), 'source-backed child must not cross source identity for a repo-relative target');


const githubSource = { id: 'github:tiinex/docs', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinex/docs', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics' };
const issueRoot = Object.assign(leaf({ id: 'issue-root-9', title: 'Welcome to the Next Dimension', path: '.topics/.github/.issues/tiinex-docs-issue-9/issue-root-recovered-welcome-to-the-next-dimension.trace.md', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/9',
  sourceTarget: {
    inputTarget: 'https://github.com/Tiinex/docs/issues/9',
    sourceArtifactPath: '.topics/.github/.issues/tiinex-docs-issue-9/issue-root-recovered-welcome-to-the-next-dimension.trace.md'
  },
  snapshot: { sourceUrl: 'https://github.com/Tiinex/docs/issues/9', target: { canonicalUrl: 'https://github.com/Tiinex/docs/issues/9' } }
});
const commentArtifact = Object.assign(leaf({ id: 'comment-artifact-9-1', title: 'The American Experiment', path: '.topics/.github/.issues/tiinex-docs-issue-9/comment-001-4881780075-recovered-the-american-experiment.trace.md', trace: 'https://github.com/Tiinex/docs/issues/9', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881780075',
  sourceTarget: {
    inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881780075',
    sourceArtifactPath: '.topics/.github/.issues/tiinex-docs-issue-9/comment-001-4881780075-recovered-the-american-experiment.trace.md'
  },
  snapshot: { sourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881780075' }
});
const provenanceResolved = resolveLineage([issueRoot, commentArtifact]);
assert(provenanceResolved.edges.some((edge) => edge.from === 'issue-root-9' && edge.to === 'comment-artifact-9-1' && edge.method === 'provenance-target'), 'GitHub issue URL parent targets should resolve against loaded issue provenance, not become file recovery');

const commentParent = Object.assign(leaf({ id: 'comment-parent-9-1', title: 'The American Experiment', path: '.topics/.github/.issues/tiinex-docs-issue-9/comment-001-4881780075-recovered-the-american-experiment.trace.md', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881780075',
  sourceTarget: { inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881780075' },
  snapshot: { sourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881780075' }
});
const commentChild = leaf({ id: 'comment-child-url', title: 'Comment Child URL', path: '.topics/.github/.issues/tiinex-docs-issue-9/comment-child.trace.md', trace: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881780075', source: githubSource });
const commentProvenanceResolved = resolveLineage([commentParent, commentChild]);
assert(commentProvenanceResolved.edges.some((edge) => edge.from === 'comment-parent-9-1' && edge.to === 'comment-child-url' && edge.method === 'provenance-target'), 'GitHub issue comment URL parent targets should preserve hash identity and resolve to the loaded comment artifact');

const commentParentEmbedded = Object.assign(leaf({ id: 'comment-parent-4881782365-embedded', title: 'Silicon Valley', path: '.topics/.github/.issues/tiinex-docs-issue-9/comment-003-4881782365-recovered-silicon-valley.trace.md', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365',
  sourceMode: 'github-comment-embedded-artifact',
  recoveryKind: 'github-comment-embedded-tiinex-artifact',
  sourceTarget: { targetKind: 'github-comment-embedded-artifact', inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365' },
  snapshot: { embedded: true, sourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365' }
});
const commentParentShell = Object.assign(leaf({ id: 'comment-parent-4881782365-shell', title: 'GitHub Comment Shell', path: '.topics/.github/.issues/tiinex-docs-issue-9/comment-003-4881782365.trace.md', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365',
  sourceMode: 'github-comment-shell',
  sourceTarget: { targetKind: 'github-comment-shell', inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365' },
  snapshot: { sourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365' }
});
const commentChildByLegacyPath = Object.assign(leaf({ id: 'comment-child-4930310346', title: 'Re-watch Silicon Valley', path: '.topics/.github/.issues/tiinex-docs-issue-9/comment-004-4930310346-recovered-re-watch-silicon-valley.trace.md', trace: 'comment-003-4881782365-recovered-continuity-context.trace.md', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4930310346',
  sourceMode: 'github-comment-embedded-artifact',
  sourceTarget: { targetKind: 'github-comment-embedded-artifact', inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4930310346' },
  snapshot: { embedded: true, sourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4930310346' }
});
const commentIdAliasResolved = resolveLineage([commentParentShell, commentParentEmbedded, commentChildByLegacyPath]);
assert(commentIdAliasResolved.edges.some((edge) => edge.from === 'comment-parent-4881782365-embedded' && edge.to === 'comment-child-4930310346' && edge.kind === 'parent'), 'issue-comment parent paths carrying a comment id should bind to the embedded parent artifact even when old generated slugs differ');
assert(!commentIdAliasResolved.edges.some((edge) => edge.from === 'comment-parent-4881782365-shell' && edge.to === 'comment-child-4930310346'), 'comment-id parent binding should prefer embedded Tiinex artifact material over the publication shell');


const issueRootByPath = Object.assign(leaf({ id: 'issue-root-path-9', title: 'Welcome Root Path', path: '.topics/.github/.issues/tiinex-docs-issue-9/issue-root-recovered-welcome-to-the-next-dimension.trace.md', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/9',
  sourceTarget: { inputTarget: 'https://github.com/Tiinex/docs/issues/9' },
  snapshot: { sourceUrl: 'https://github.com/Tiinex/docs/issues/9' }
});
const commentWithContainerOnlyPath = Object.assign(leaf({ id: 'comment-container-path-9', title: 'Brazil', path: 'https://github.com/Tiinex/docs/issues/9', trace: 'issue-root-recovered-welcome-to-the-next-dimension.trace.md', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-1234',
  sourceTarget: { inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-1234' },
  snapshot: { sourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-1234' }
});
const issueLocalRelativeResolved = resolveLineage([issueRootByPath, commentWithContainerOnlyPath]);
assert(issueLocalRelativeResolved.edges.some((edge) => edge.from === 'issue-root-path-9' && edge.to === 'comment-container-path-9' && edge.method === 'issue-local-relative-path'), 'issue-local relative parent targets should resolve within the same GitHub issue container even when the declaring record path is only the publication URL');


const issueRootByTitleAlias = Object.assign(leaf({ id: 'issue-root-title-alias-9', title: 'Welcome to the Next Dimension', path: 'Tiinex/docs/issues/9', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/9',
  sourceTarget: { inputTarget: 'https://github.com/Tiinex/docs/issues/9' },
  snapshot: { sourceUrl: 'https://github.com/Tiinex/docs/issues/9' }
});
const brazilCommentAlias = Object.assign(leaf({ id: 'comment-container-alias-9', title: 'Brazil', path: 'Tiinex/docs/issues/9', trace: 'issue-root-recovered-welcome-to-the-next-dimension.trace.md', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-9999',
  sourceTarget: { inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-9999' },
  snapshot: { sourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-9999' }
});
const issueLocalTitleAliasResolved = resolveLineage([issueRootByTitleAlias, brazilCommentAlias]);
assert(issueLocalTitleAliasResolved.edges.some((edge) => edge.from === 'issue-root-title-alias-9' && edge.to === 'comment-container-alias-9' && edge.method === 'issue-local-relative-path'), 'issue-root-recovered title aliases should bind within the same GitHub issue even when the root record path is only the issue container');


const odysseusRoot = leaf({ id: 'odysseus-root', title: 'Odysseus / Provenance review', path: '.topics/odysseus/001.trace.md', source: sourceA });
const odysseusReduction = Object.assign(leaf({ id: 'odysseus-reduction', title: 'Odysseus / Context Reduction And Compaction Review', path: '.topics/odysseus/001-1.trace.md', trace: '001.trace.md', source: sourceA }), {
  sourceTarget: { surface: 'lineageRecovery', targetKind: 'lineage-parent', sourceArtifactPath: '.topics/educational/memes/magic-the-gathering/001-1.trace.md' }
});
const magicRootForRegression = leaf({ id: 'magic-regression-root', title: 'Magic: The Gathering Memes', path: '.topics/educational/memes/magic-the-gathering/001.trace.md', source: sourceA });
const odysseusOwnContext = resolveLineage([odysseusRoot, odysseusReduction, magicRootForRegression]);
assert(odysseusOwnContext.edges.some((edge) => edge.from === 'odysseus-root' && edge.to === 'odysseus-reduction' && edge.method === 'relative-path'), 'loaded source file lineage must resolve relative Parent Trace from the file path itself');
assert(!odysseusOwnContext.edges.some((edge) => edge.from === 'magic-regression-root' && edge.to === 'odysseus-reduction'), 'loaded source file lineage must not jump to another folder with the same basename via stale sourceArtifactPath');


const odysseusRootFromBlobUrl = leaf({ id: 'odysseus-root-blob', title: 'Odysseus / Provenance review', path: 'https://raw.githubusercontent.com/Tiinex/docs/6bbbeb9757a9d44d951877753b6f729ab3eb8f0b/.topics/odysseus/001.trace.md', source: sourceA });
const magicRootFromBlobUrl = leaf({ id: 'magic-root-blob', title: 'Magic: The Gathering Memes', path: 'https://raw.githubusercontent.com/Tiinex/docs/91006b375a6af721bf41e829773dd44378863e78/.topics/educational/memes/magic-the-gathering/001.trace.md', source: sourceA });
const odysseusChildFromBlobUrl = leaf({ id: 'odysseus-child-blob', title: 'Odysseus / Context Reduction', path: 'https://raw.githubusercontent.com/Tiinex/docs/25c3d5380e7fa98427dc4d0b128ccbeb5e46a72a/.topics/odysseus/001-1.trace.md', trace: '001.trace.md', origin: 'https://github.com/Tiinex/docs/blob/6bbbeb9757a9d44d951877753b6f729ab3eb8f0b/.topics/odysseus/001.trace.md', source: sourceA });
const blobPathContext = resolveLineage([odysseusRootFromBlobUrl, magicRootFromBlobUrl, odysseusChildFromBlobUrl]);
assert(blobPathContext.edges.some((edge) => edge.from === 'odysseus-root-blob' && edge.to === 'odysseus-child-blob' && edge.kind === 'parent'), 'raw/blob source file paths must resolve relative Parent Trace from the repo file path, not the raw URL commit prefix');
assert(!blobPathContext.edges.some((edge) => edge.from === 'magic-root-blob' && edge.to === 'odysseus-child-blob'), 'raw/blob source file paths must not jump to another lineage with the same basename');


const issueRootNewLogicalPath = Object.assign(leaf({ id: 'issue-root-logical-9', title: 'Welcome to the Next Dimension', path: '.topics/.github/tiinex/docs/.issues/9/issue-root-recovered-welcome-to-the-next-dimension.trace.md', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/9',
  sourceTarget: { inputTarget: 'https://github.com/Tiinex/docs/issues/9' },
  snapshot: { sourceUrl: 'https://github.com/Tiinex/docs/issues/9' }
});
const brazilLogicalIssuePath = Object.assign(leaf({ id: 'comment-logical-alias-9', title: 'Brazil', path: '.topics/.github/tiinex/docs/.issues/9/comment-002-4881782365-recovered-brazil.trace.md', trace: 'issue-root-recovered-welcome-to-the-next-dimension.trace.md', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365',
  sourceTarget: { inputTarget: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365' },
  snapshot: { sourceUrl: 'https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365' }
});
const issueLocalLogicalPathResolved = resolveLineage([issueRootNewLogicalPath, brazilLogicalIssuePath]);
assert(issueLocalLogicalPathResolved.edges.some((edge) => edge.from === 'issue-root-logical-9' && edge.to === 'comment-logical-alias-9' ), 'logical .topics/.github issue sidecar paths should preserve issue-local parent binding');

const gamingSource = { id: 'github:tiinusen/socials', adapterId: 'github', sourceKind: 'github.repo', label: 'Tiinusen/socials', repo: 'Tiinusen/socials', ref: 'personal', rootPath: '.topics' };
const issueCommentParentLogical = Object.assign(leaf({ id: 'issue-comment-parent-logical-3', title: 'Lagar och regler', path: '.topics/.github/tiinusen/socials/.issues/3/comment-001-5008615398-recovered-lagar-och-regler.trace.md', source: gamingSource }), {
  recoveredFromUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5008615398',
  sourceMode: 'github-comment-embedded-artifact',
  sourceTarget: { targetKind: 'github-comment-embedded-artifact', inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5008615398' },
  snapshot: { embedded: true, sourceUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5008615398' }
});
const sameLegacyBasenameOtherIssue = Object.assign(leaf({ id: 'issue-comment-parent-other-4', title: 'Lagar och regler other issue', path: '.topics/.github/tiinusen/socials/.issues/4/comment-001-5008615398-recovered-lagar-och-regler.trace.md', source: gamingSource }), {
  recoveredFromUrl: 'https://github.com/Tiinusen/socials/issues/4#issuecomment-5008615398',
  sourceMode: 'github-comment-embedded-artifact',
  sourceTarget: { targetKind: 'github-comment-embedded-artifact', inputTarget: 'https://github.com/Tiinusen/socials/issues/4#issuecomment-5008615398' },
  snapshot: { embedded: true, sourceUrl: 'https://github.com/Tiinusen/socials/issues/4#issuecomment-5008615398' }
});
const issueCommentChildLegacyDotGithubPath = Object.assign(leaf({
  id: 'issue-comment-child-legacy-dot-github-3',
  title: '§1 Ängkvistlagen',
  path: '.topics/.github/tiinusen/socials/.issues/3/comment-002-5011140374-recovered-1-ngkvistlagen.trace.md',
  trace: '.topics/.github/.issues/Tiinusen-socials-3-fs25-markaryd/comment-001-5008615398-recovered-lagar-och-regler.trace.md',
  source: gamingSource
}), {
  recoveredFromUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011140374',
  sourceMode: 'github-comment-embedded-artifact',
  sourceTarget: { targetKind: 'github-comment-embedded-artifact', inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011140374' },
  snapshot: { embedded: true, sourceUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011140374' }
});
const legacyDotGithubIssuePathResolved = resolveLineage([issueCommentParentLogical, sameLegacyBasenameOtherIssue, issueCommentChildLegacyDotGithubPath]);
assert(legacyDotGithubIssuePathResolved.edges.some((edge) => edge.from === 'issue-comment-parent-logical-3' && edge.to === 'issue-comment-child-legacy-dot-github-3' && edge.method === 'issue-local-path'), 'proxy-loaded issue artifacts must resolve legacy .topics/.github/.issues parent paths against current logical issue paths inside the same issue');
assert(!legacyDotGithubIssuePathResolved.edges.some((edge) => edge.from === 'issue-comment-parent-other-4' && edge.to === 'issue-comment-child-legacy-dot-github-3'), 'legacy issue basename fallback must remain scoped to the declaring GitHub issue container');

const issueCommentParentUrlOnly = Object.assign(leaf({ id: 'issue-comment-parent-url-only-3', title: 'Klagomuren', path: '.topics/.github/tiinusen/socials/.issues/3/comment-recovered-klagomuren.trace.md', source: gamingSource }), {
  sourceMode: 'github-comment-embedded-artifact',
  sourceTarget: { targetKind: 'github-comment-embedded-artifact', inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876' },
  snapshot: { embedded: true, sourceUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876' }
});
const issueCommentChildParentSourceArtifactUrl = Object.assign(leaf({
  id: 'issue-comment-child-source-artifact-url-3',
  title: 'Fler bondgårdar',
  path: '.topics/.github/tiinusen/socials/.issues/3/comment-004-5011198457-recovered-fler-bondgardar.trace.md',
  trace: 'comment-002-5011116876-recovered-klagomuren.trace.md',
  source: gamingSource
}), {
  recoveredFromUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011198457',
  sourceMode: 'github-comment-embedded-artifact',
  sourceTarget: {
    targetKind: 'github-comment-embedded-artifact',
    inputTarget: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011198457',
    parentArtifactPath: 'comment-002-5011116876-recovered-klagomuren.trace.md',
    parentSourceUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876'
  },
  snapshot: {
    embedded: true,
    sourceUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011198457',
    parentArtifactPath: 'comment-002-5011116876-recovered-klagomuren.trace.md',
    parentSourceUrl: 'https://github.com/Tiinusen/socials/issues/3#issuecomment-5011116876'
  }
});
const sourceArtifactUrlParentResolved = resolveLineage([issueCommentParentUrlOnly, issueCommentChildParentSourceArtifactUrl]);
assert(sourceArtifactUrlParentResolved.edges.some((edge) => edge.from === 'issue-comment-parent-url-only-3' && edge.to === 'issue-comment-child-source-artifact-url-3' ), 'issue-comment children resolve by stable comment id even when the loaded parent material path lacks the generated ordinal/id basename');
assert(!sourceArtifactUrlParentResolved.findings.some((finding) => finding.nodeId === 'issue-comment-child-source-artifact-url-3' && finding.code === 'lineage.parent.missing'), 'issue-local comment-id parent binding should avoid false missing lineage on loaded issue-comment parents');

const legacyFolderIssueParent = Object.assign(leaf({ id: 'legacy-folder-klagomuren-3', title: 'Klagomuren', path: '.topics/.github/.issues/Tiinusen-socials-3-fs25-markaryd/comment-002-5011116876-recovered-klagomuren.trace.md', source: gamingSource }), {
  sourceMode: 'github-comment-embedded-artifact',
  sourceTarget: { targetKind: 'github-comment-embedded-artifact', sourceArtifactPath: '.topics/.github/.issues/Tiinusen-socials-3-fs25-markaryd/comment-002-5011116876-recovered-klagomuren.trace.md' },
  snapshot: { embedded: true, sourceArtifactPath: '.topics/.github/.issues/Tiinusen-socials-3-fs25-markaryd/comment-002-5011116876-recovered-klagomuren.trace.md' }
});
const legacyFolderIssueChild = Object.assign(leaf({
  id: 'legacy-folder-fler-bondgardar-3',
  title: 'Fler bondgårdar',
  path: '.topics/.github/.issues/Tiinusen-socials-3-fs25-markaryd/comment-004-5011198457-recovered-fler-bondgardar.trace.md',
  trace: 'comment-002-5011116876-recovered-klagomuren.trace.md',
  source: gamingSource
}), {
  sourceMode: 'github-comment-embedded-artifact',
  sourceTarget: { targetKind: 'github-comment-embedded-artifact', sourceArtifactPath: '.topics/.github/.issues/Tiinusen-socials-3-fs25-markaryd/comment-004-5011198457-recovered-fler-bondgardar.trace.md' },
  snapshot: { embedded: true, sourceArtifactPath: '.topics/.github/.issues/Tiinusen-socials-3-fs25-markaryd/comment-004-5011198457-recovered-fler-bondgardar.trace.md' }
});
const legacyFolderIssueParentResolved = resolveLineage([legacyFolderIssueParent, legacyFolderIssueChild]);
assert(legacyFolderIssueParentResolved.edges.some((edge) => edge.from === 'legacy-folder-klagomuren-3' && edge.to === 'legacy-folder-fler-bondgardar-3'), 'legacy .topics/.github/.issues folder paths should still form issue-local lineage when no URL provenance survived route/cache');

const odysseusExactParent = leaf({ id: 'odysseus-exact-parent-10', title: 'Odysseus / Awaiting Parent', path: '.topics/odysseus/001-1-1.trace.md', source: githubSource });
const awaitingSyntheticIssue = Object.assign(leaf({ id: 'awaiting-synthetic-issue-10', title: 'Awaiting response', path: '.topics/.github/tiinex/docs/.issues/10/issue-root-recovered-awaiting-response.trace.md', trace: '../../../odysseus/001-1-1.trace.md', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/10',
  sourceMode: 'github-issue-embedded-artifact',
  sourceTarget: {
    targetKind: 'github-issue-embedded-artifact',
    inputTarget: 'https://github.com/Tiinex/docs/issues/10',
    parentArtifactPath: '.topics/odysseus/001-1-1.trace.md'
  },
  snapshot: {
    embedded: true,
    sourceUrl: 'https://github.com/Tiinex/docs/issues/10',
    parentArtifactPath: '.topics/odysseus/001-1-1.trace.md'
  }
});
const syntheticDeclaredParentResolved = resolveLineage([odysseusExactParent, awaitingSyntheticIssue]);
assert(syntheticDeclaredParentResolved.edges.some((edge) => edge.from === 'odysseus-exact-parent-10' && edge.to === 'awaiting-synthetic-issue-10' && edge.method === 'declared-parent-path'), 'synthetic issue artifacts must bind recovered exact Parent Artifact Path after cwd-relative lookup fails');
assert(!syntheticDeclaredParentResolved.findings.some((finding) => finding.nodeId === 'awaiting-synthetic-issue-10' && finding.code === 'lineage.parent.missing'), 'synthetic issue exact parent binding should not remain target unavailable after recovery');

const awaitingSyntheticIssueWithoutExplicitParent = Object.assign(leaf({ id: 'awaiting-synthetic-issue-10-suffix', title: 'Awaiting response', path: '.topics/.github/tiinex/docs/.issues/10/issue-root-recovered-awaiting-response.trace.md', trace: '../../../odysseus/001-1-1.trace.md', source: githubSource }), {
  recoveredFromUrl: 'https://github.com/Tiinex/docs/issues/10',
  sourceMode: 'github-issue-embedded-artifact',
  sourceTarget: { targetKind: 'github-issue-embedded-artifact', inputTarget: 'https://github.com/Tiinex/docs/issues/10' },
  snapshot: { embedded: true, sourceUrl: 'https://github.com/Tiinex/docs/issues/10' }
});
const syntheticSuffixParentResolved = resolveLineage([odysseusExactParent, awaitingSyntheticIssueWithoutExplicitParent]);
assert(syntheticSuffixParentResolved.edges.some((edge) => edge.from === 'odysseus-exact-parent-10' && edge.to === 'awaiting-synthetic-issue-10-suffix' && edge.method === 'synthetic-parent-path-suffix'), 'multi-segment synthetic issue Parent Trace should use safe suffix recovery after synthetic cwd fails');


const odysseusRootRecoveredWithGenericInput = Object.assign(leaf({ id: 'odysseus-root-generic-input', title: 'Odysseus / Provenance review', path: '.topics/odysseus/001.trace.md', source: sourceA }), {
  sourceTarget: { surface: 'lineageRecovery', targetKind: 'lineage-parent', inputTarget: '001.trace.md' }
});
const magicRootRecoveredWithGenericInput = Object.assign(leaf({ id: 'magic-root-generic-input', title: 'Magic: The Gathering Memes', path: '.topics/educational/memes/magic-the-gathering/001.trace.md', source: sourceA }), {
  sourceTarget: { surface: 'lineageRecovery', targetKind: 'lineage-parent', inputTarget: '001.trace.md' }
});
const stackEvidenceRelativeParent = leaf({ id: 'stack-evidence-relative-parent', title: 'Evidence: The Stack Remembers', path: '.topics/educational/memes/magic-the-gathering/001-2-the-stack-remembers.trace.md', trace: '001.trace.md', source: sourceA });
const genericInputTargetResolved = resolveLineage([odysseusRootRecoveredWithGenericInput, magicRootRecoveredWithGenericInput, stackEvidenceRelativeParent]);
assert(genericInputTargetResolved.edges.some((edge) => edge.from === 'magic-root-generic-input' && edge.to === 'stack-evidence-relative-parent' && edge.method === 'relative-path'), 'simple Parent Trace must resolve relative to the declaring file path before any generic sourceTarget.inputTarget provenance');
assert(!genericInputTargetResolved.edges.some((edge) => edge.from === 'odysseus-root-generic-input' && edge.to === 'stack-evidence-relative-parent'), 'generic lineage recovery inputTarget values such as 001.trace.md must not cross-bind unrelated folders');


function integrityLeaf({ id, title, path, trace = '', parentHash = '', selfHash = '', source = sourceA }) {
  const markdown = [
    '# Continuity Context',
    '',
    '- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)',
    trace ? '- Parent' : '',
    trace ? '  - Parent Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)' : '',
    trace ? `  - Trace: [${trace}](${trace})` : '',
    '- Current',
    '  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)',
    '  - Created At: 2026-07-26T00:00:00.000Z',
    `  - Summary: ${title}`,
    '',
    '---',
    '',
    `# ${title}`,
    '',
    '# Continuity Integrity',
    '',
    parentHash ? '- [sha256-base64url-c14n-v2](validator.md)' : '',
    parentHash ? `  - Towards: [${trace}](${trace})` : '',
    parentHash ? `  - Value: ${parentHash}` : '',
    parentHash ? '' : '',
    selfHash ? '- [sha256-base64url-c14n-v2](validator.md)' : '',
    selfHash ? '  - Towards: self' : '',
    selfHash ? `  - Value: ${selfHash}` : ''
  ].filter(Boolean).join('\n');
  return Object.assign(createRecordFromMarkdown(markdown, { path }), { id, source });
}

const checksumParentA = integrityLeaf({ id: 'checksum-parent-a', title: 'Checksum Parent A', path: '.topics/a/001.trace.md', selfHash: 'hash-parent-a' });
const checksumParentB = integrityLeaf({ id: 'checksum-parent-b', title: 'Checksum Parent B', path: '.topics/b/001.trace.md', selfHash: 'hash-parent-b' });
const checksumChild = integrityLeaf({ id: 'checksum-child', title: 'Checksum Child', path: '.topics/b/child.trace.md', trace: '001.trace.md', parentHash: 'hash-parent-a', selfHash: 'hash-child' });
const checksumFirst = resolveLineage([checksumParentA, checksumParentB, checksumChild]);
assert(checksumFirst.edges.some((edge) => edge.from === 'checksum-parent-a' && edge.to === 'checksum-child' && edge.status === 'verified' && edge.method === 'integrity-self-hash'), 'matching parent integrity must bind before path aliases when available');
assert(!checksumFirst.edges.some((edge) => edge.from === 'checksum-parent-b' && edge.to === 'checksum-child'), 'path candidate must not override a matching parent checksum');

const changedParent = integrityLeaf({ id: 'changed-parent', title: 'Changed Parent', path: '.topics/changed/001.trace.md', selfHash: 'new-parent-hash' });
const staleChild = integrityLeaf({ id: 'stale-child', title: 'Stale Child', path: '.topics/changed/child.trace.md', trace: '001.trace.md', parentHash: 'old-parent-hash', selfHash: 'stale-child-hash' });
const mismatchFallback = resolveLineage([changedParent, staleChild]);
assert(mismatchFallback.edges.some((edge) => edge.from === 'changed-parent' && edge.to === 'stale-child' && edge.status === 'mismatch' && edge.method === 'relative-path'), 'checksum mismatch should still bind by stable relative parent path but mark the edge mismatch');
assert(mismatchFallback.findings.some((finding) => finding.code === 'lineage.parent.integrityMismatch' && finding.severity === 'error'), 'checksum mismatch must be surfaced as a strong lineage finding');

const unsealedParent = integrityLeaf({ id: 'unsealed-parent', title: 'Unsealed Parent', path: '.topics/unsealed/001.trace.md' });
const proofSeekingChild = integrityLeaf({ id: 'proof-seeking-child', title: 'Proof Seeking Child', path: '.topics/unsealed/child.trace.md', trace: '001.trace.md', parentHash: 'expected-parent-hash', selfHash: 'proof-child-hash' });
const probableFallback = resolveLineage([unsealedParent, proofSeekingChild]);
assert(probableFallback.edges.some((edge) => edge.from === 'unsealed-parent' && edge.to === 'proof-seeking-child' && edge.status === 'probable' && edge.method === 'relative-path'), 'missing parent self-integrity should keep the stable path edge navigable as probable');

const audit = resolveAuditLineage([parent, childByTrace]);
assert.equal(audit.schema, 'tiinex.audit.lineage.resolve.v1', 'audit lineage result declares schema');
assert(audit.edges.length >= 1, 'audit lineage should reuse resolver edges');

const samePathA = leaf({ id: 'a', title: 'A', path: 'shared/topic.md' });
samePathA.source = { adapterId: 'github', repo: 'owner/a', ref: 'main' };
const samePathB = leaf({ id: 'b', title: 'B', path: 'shared/topic.md' });
samePathB.source = { adapterId: 'github', repo: 'owner/b', ref: 'main' };
const ambiguousChild = leaf({ id: 'ambiguous-child', title: 'Ambiguous Child', path: 'children/child.md', origin: 'shared/topic.md' });
const ambiguous = resolveLineage([samePathA, samePathB, ambiguousChild]);
assert(ambiguous.findings.some((finding) => finding.code === 'lineage.target.ambiguous'), 'same path in multiple sources must create ambiguity finding');
assert(!ambiguous.edges.some((edge) => edge.to === 'ambiguous-child' && edge.from), 'ambiguous origin must not create a guessed edge');

const sourceAwareChild = leaf({ id: 'source-aware-child', title: 'Source A Child', path: 'children/child-a.md', origin: 'https://github.com/owner/a/blob/main/shared/topic.md' });
const sourceAware = resolveLineage([samePathA, samePathB, sourceAwareChild]);
assert(sourceAware.edges.some((edge) => edge.from === 'a' && edge.to === 'source-aware-child'), 'GitHub origin URL should disambiguate same path by repo when possible');
assert(!sourceAware.findings.some((finding) => finding.nodeId === 'source-aware-child' && finding.code === 'lineage.target.ambiguous'), 'source-aware target must not be marked ambiguous');


const educationalRoot = leaf({ id: 'educational-root', title: 'Educational Root', path: '.topics/educational/001.trace.md', source: sourceA });
const slidesChildWithLinkTrace = leaf({ id: 'slides-child-link', title: 'Slides Child Link', path: '.topics/educational/slides/001.trace.md', trace: '[001.trace.md](../001.trace.md)', source: sourceA });
const linkedTrace = resolveLineage([educationalRoot, slidesChildWithLinkTrace]);
assert.equal(slidesChildWithLinkTrace.trace, '../001.trace.md', 'record shaping should use Parent Trace href, not the visible label');
assert.equal(slidesChildWithLinkTrace.traceLabel, '001.trace.md', 'record shaping should preserve Parent Trace label separately');
assert(linkedTrace.edges.some((edge) => edge.from === 'educational-root' && edge.to === 'slides-child-link' && edge.method === 'relative-path'), 'Parent Trace href should resolve to the real parent path');
assert(!linkedTrace.edges.some((edge) => edge.from === 'slides-child-link' && edge.to === 'slides-child-link'), 'Parent Trace label must not create a self-edge');

const explicitSelf = leaf({ id: 'explicit-self', title: 'Explicit Self', path: '.topics/self/001.trace.md', trace: 'record:explicit-self', source: sourceA });
const selfResolved = resolveLineage([explicitSelf]);
assert(selfResolved.findings.some((finding) => finding.code === 'lineage.parent.selfReference' && finding.nodeId === 'explicit-self'), 'self Parent Trace should become a finding');
assert(!selfResolved.edges.some((edge) => edge.kind === 'parent' && edge.from === 'explicit-self' && edge.to === 'explicit-self'), 'self Parent Trace must not create a parent edge');

console.log('✓ lineage.resolve tests passed');
