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
assert(urlResult.edges.some((edge) => edge.from === 'parent-1' && edge.to === 'child-url' && edge.kind === 'origin' && edge.method === 'path-suffix'), 'origin URL should resolve loaded parent by explicit path suffix');



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
