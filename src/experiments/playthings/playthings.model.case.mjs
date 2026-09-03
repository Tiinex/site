import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../../artifacts/artifact.record.js';
import { planPlaythingsDelta, playthingsArtifactPosition, projectPlaythingsMultiverse, visualKindForSchema } from './playthings.model.js';

function record({ title, path, schema = 'tiinex.task.v1', createdAt = '2026-09-01 10:00:00', parent = '', parentSchema = 'tiinex.task.v1', sourceId = 'site-src', repo = 'Tiinex/site', ref = 'site-ref', authors = '' }) {
  const parentBlock = parent ? `- Parent\n  - Parent Schema: ${parentSchema}\n  - Trace: [Parent](${parent})\n  - Origin:\n    - [browse + git](${parent})\n` : '';
  const markdown = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n${parentBlock}- Current\n  - Current Schema: ${schema}\n  - Created At: ${createdAt}\n${authors ? `  - Authors: ${authors}\n` : ''}  - Summary: ${title}\n\n---\n\n# ${title}\n\n# Continuity Integrity\n\n- sha256-base64url-c14n-v2\n  - Towards: self\n  - Value: demo-${title.replace(/[^a-z0-9]/gi, '-').toLowerCase()}\n`;
  const out = createRecordFromMarkdown(markdown, { path, name: path, sourceMode: 'source' });
  out.source = { id: sourceId, adapterId: 'github', repository: repo, repo, ref };
  out.sourceTarget = { inputTarget: `https://github.com/${repo}/blob/${ref}/${path}`, browseUrl: `https://github.com/${repo}/blob/${ref}/${path}`, sourceArtifactPath: path, repository: repo };
  return out;
}

const businessProjectUrl = 'https://github.com/Tiinex/business/blob/business-ref/.topics/initiatives/viewer.trace.md';
const businessProject = record({ title: 'Viewer', path: '.topics/initiatives/viewer.trace.md', schema: 'tiinex.project.v1', sourceId: 'business-src', repo: 'Tiinex/business', ref: 'business-ref' });
const siteTask = record({ title: 'Playthings', path: '.topics/playthings.task.trace.md', schema: 'tiinex.task.v1', parent: businessProjectUrl, parentSchema: 'tiinex.project.v1' });

const baseline = projectPlaythingsMultiverse([
  { id: 'business-workspace', sources: [{ id: 'business-src', adapterId: 'github', repository: 'Tiinex/business', repo: 'Tiinex/business', ref: 'business-ref', repoDiscovery: true }], records: [businessProject] },
  { id: 'site-workspace', sources: [{ id: 'site-src', adapterId: 'github', repository: 'Tiinex/site', repo: 'Tiinex/site', ref: 'site-ref', repoDiscovery: true }], records: [siteTask] }
]);

assert.equal(baseline.verses.length, 2, 'one repository should project to one Verse');
assert.deepEqual(baseline.verses.map((verse) => verse.repo), ['Tiinex/business', 'Tiinex/site']);
assert.equal(baseline.portals.length, 1, 'a resolved cross-repository Parent should become one portal projection');
assert.equal(baseline.portals[0].crossVerse, true);
assert.equal(baseline.verses.find((verse) => verse.repo === 'Tiinex/business')?.artifacts[0]?.visualKind, 'project-scene', 'project artifacts are scenes rather than pre-existing castle structures');
assert.equal(baseline.verses.find((verse) => verse.repo === 'Tiinex/site')?.artifacts[0]?.visualKind, 'workbench', 'task artifacts should project as workbench stations while lineage leaves remain Playthings');
assert.equal(visualKindForSchema('tiinex.handoff.v1'), 'handoff-scene');
assert.deepEqual(playthingsArtifactPosition(baseline.artifacts[0]), playthingsArtifactPosition(baseline.artifacts[0]), 'artifact positions must be stable from identity alone');

const unchanged = planPlaythingsDelta(baseline, projectPlaythingsMultiverse([
  { id: 'business-workspace', sources: [{ id: 'business-src', adapterId: 'github', repository: 'Tiinex/business', repo: 'Tiinex/business', ref: 'business-ref', repoDiscovery: true }], records: [businessProject] },
  { id: 'site-workspace', sources: [{ id: 'site-src', adapterId: 'github', repository: 'Tiinex/site', repo: 'Tiinex/site', ref: 'site-ref', repoDiscovery: true }], records: [siteTask] }
]));
assert.equal(unchanged.changed, false, 'refresh with no new resolved material must not produce playback');
assert.equal(unchanged.events.length, 0);

const childOne = record({ title: 'Renderer slice', path: '.topics/playthings-renderer.task.trace.md', parent: 'playthings.task.trace.md', createdAt: '2026-09-01 11:00:00' });
const advancedModel = projectPlaythingsMultiverse([
  { id: 'business-workspace', sources: [{ id: 'business-src', adapterId: 'github', repository: 'Tiinex/business', repo: 'Tiinex/business', ref: 'business-ref', repoDiscovery: true }], records: [businessProject] },
  { id: 'site-workspace', sources: [{ id: 'site-src', adapterId: 'github', repository: 'Tiinex/site', repo: 'Tiinex/site', ref: 'site-ref', repoDiscovery: true }], records: [siteTask, childOne] }
]);
const advancedDelta = planPlaythingsDelta(baseline, advancedModel);
assert.equal(advancedDelta.events.filter((event) => event.kind === 'advance').length, 1, 'linear lineage continuation should advance the existing lineage actor');
const baselineSiteActorId = baseline.verses.find((verse) => verse.repo === 'Tiinex/site')?.actors[0]?.id;
const advancedSiteActorId = advancedModel.verses.find((verse) => verse.repo === 'Tiinex/site')?.actors[0]?.id;
assert.equal(advancedSiteActorId, baselineSiteActorId, 'linear lineage continuation must preserve the rendered Plaything identity instead of remounting a new actor');

const childTwo = record({ title: 'Alternative projection', path: '.topics/playthings-alternative.task.trace.md', parent: 'playthings.task.trace.md', createdAt: '2026-09-01 11:05:00' });
const branchedModel = projectPlaythingsMultiverse([
  { id: 'business-workspace', sources: [{ id: 'business-src', adapterId: 'github', repository: 'Tiinex/business', repo: 'Tiinex/business', ref: 'business-ref', repoDiscovery: true }], records: [businessProject] },
  { id: 'site-workspace', sources: [{ id: 'site-src', adapterId: 'github', repository: 'Tiinex/site', repo: 'Tiinex/site', ref: 'site-ref', repoDiscovery: true }], records: [siteTask, childOne, childTwo] }
]);
const branchDelta = planPlaythingsDelta(advancedModel, branchedModel);
assert.equal(branchDelta.events.length, 1, 'only newly observed material should be replayed');
assert.equal(branchDelta.events[0].kind, 'split', 'a newly observed sibling branch should be projected as a split');
assert.equal(branchDelta.events[0].artifactKey.includes('playthings-alternative.task.trace.md'), true);
const branchActors = branchedModel.verses.find((verse) => verse.repo === 'Tiinex/site')?.actors || [];
assert.ok(branchActors.some((actor) => actor.id === baselineSiteActorId), 'the first living branch preserves the original Plaything identity when a sibling branch appears');
assert.ok(branchActors.some((actor) => actor.id !== baselineSiteActorId), 'a sibling branch receives a distinct Plaything identity');

const firstObservation = planPlaythingsDelta(null, baseline);
assert.equal(firstObservation.firstObservation, true);
assert.equal(firstObservation.events.length, 0, 'initial load establishes baseline without pretending old history just happened');

const unresolvedChild = record({ title: 'Unknown parent', path: '.topics/unknown.task.trace.md', parent: 'https://github.com/Tiinex/docs/blob/missing/.topics/not-loaded.trace.md' });
const unresolvedModel = projectPlaythingsMultiverse([{ id: 'site-workspace', sources: [{ id: 'site-src', adapterId: 'github', repository: 'Tiinex/site', repo: 'Tiinex/site', ref: 'site-ref', repoDiscovery: true }], records: [unresolvedChild] }]);
assert.equal(unresolvedModel.edges.length, 0, 'missing Parent must not be guessed into an edge');
assert.ok(unresolvedModel.unresolved.some((finding) => finding.code === 'lineage.parent.exactTargetNotLoaded'), 'missing Parent remains explicit unknown state');


const authoredTask = record({ title: 'Authored task', path: '.topics/authored.task.trace.md', authors: 'Anchor' });
const authoredModel = projectPlaythingsMultiverse([{ id: 'site-workspace', sources: [{ id: 'site-src', adapterId: 'github', repository: 'Tiinex/site', repo: 'Tiinex/site', ref: 'site-ref', repoDiscovery: true }], records: [authoredTask] }]);
assert.equal(authoredModel.verses[0].actors[0].roleIdentity, 'anchor', 'explicit artifact Authors may provide presentation-only role livery identity');

const schemaLeaf = record({ title: 'Task schema', path: 'src/schemas/core/task/tiinex.task.v1.schema.md', schema: 'tiinex.schema.module.v1', authors: 'Anchor' });
const schemaModel = projectPlaythingsMultiverse([{ id: 'site-workspace', sources: [{ id: 'site-src', adapterId: 'github', repository: 'Tiinex/site', repo: 'Tiinex/site', ref: 'site-ref', repoDiscovery: true }], records: [schemaLeaf] }]);
assert.equal(schemaModel.artifacts[0].isSchemaArtifact, true);
assert.equal(schemaModel.verses[0].actors.length, 0, 'schema leaf artifacts belong to blueprint/Tech Tree presentation and must not leave living Plaything actors on earth');
assert.equal(schemaModel.artifacts[0].persistenceKind, 'none', 'schema documents must not inherit persistent world semantics from the schema they describe');
assert.equal(schemaModel.artifacts[0].spawnCapability, '', 'schema documents must not become habitats/spawn places even when their described schema is a place type');


const organizationSchemaDoc = record({ title: 'Party Organization', path: 'src/schemas/party/tiinex.party.organization.v1.schema.md', schema: 'tiinex.party.organization.v1' });
const organizationSchemaModel = projectPlaythingsMultiverse([{ id: 'site-workspace', sources: [{ id: 'site-src', adapterId: 'github', repository: 'Tiinex/site', repo: 'Tiinex/site', ref: 'site-ref', repoDiscovery: true }], records: [organizationSchemaDoc] }]);
assert.equal(organizationSchemaModel.artifacts[0].isSchemaArtifact, true);
assert.equal(organizationSchemaModel.artifacts[0].visualKind, 'blueprint-scene');
assert.equal(organizationSchemaModel.artifacts[0].persistenceKind, 'none', 'a party.organization .schema.md stays a blueprint and must never project a castle');
assert.equal(organizationSchemaModel.verses[0].actors.length, 0);

console.log('✓ Playthings multiverse projection and delta playback model passed');

function localize(input, sourceId = 'local') {
  input.source = { id: sourceId, adapterId: 'local', kind: 'local' };
  delete input.sourceTarget;
  return input;
}

const localDocsProject = localize(record({ title: 'Docs Root', path: '.topics/docs-root.trace.md', schema: 'tiinex.project.v1', repo: 'Tiinex/docs', sourceId: 'docs-src' }));
const localBusinessProject = localize(record({ title: 'Business Root', path: '.topics/business-root.trace.md', schema: 'tiinex.project.v1', repo: 'Tiinex/business', sourceId: 'business-src' }));
const localSiteTask = localize(record({ title: 'Site Child', path: '.topics/site-child.trace.md', parent: 'https://github.com/Tiinex/business/blob/business-ref/.topics/business-root.trace.md', repo: 'Tiinex/site', sourceId: 'site-src' }));
const zipProjection = projectPlaythingsMultiverse([
  { id: 'docs-workspace', name: 'Docs', title: 'Docs', sources: [{ id: 'local', adapterId: 'local', kind: 'local' }, { id: 'docs-origin', adapterId: 'github', repo: 'Tiinex/docs', ref: 'docs-ref' }, { id: 'business-recovery', adapterId: 'github', repo: 'Tiinex/business', ref: 'business-ref' }], records: [localDocsProject] },
  { id: 'business-workspace', name: 'Business', title: 'Business', sources: [{ id: 'local', adapterId: 'local', kind: 'local' }, { id: 'business-origin', adapterId: 'github', repo: 'Tiinex/business', ref: 'business-ref' }], records: [localBusinessProject] },
  { id: 'site-workspace', name: 'Site', title: 'Site', sources: [{ id: 'local', adapterId: 'local', kind: 'local' }, { id: 'site-origin', adapterId: 'github', repo: 'Tiinex/site', ref: 'site-ref' }, { id: 'docs-recovery', adapterId: 'github', repo: 'Tiinex/docs', ref: 'docs-ref' }, { id: 'business-recovery', adapterId: 'github', repo: 'Tiinex/business', ref: 'business-ref' }], records: [localSiteTask] }
]);
assert.deepEqual(zipProjection.verses.map((verse) => verse.repo), ['Tiinex/business', 'Tiinex/docs', 'Tiinex/site'], 'ZIP/local records should project through the workspace primary repository when the configured repository is unambiguous by workspace identity');
assert.equal(zipProjection.inferredArtifactCount, 3, 'projection-only workspace repository binding should remain counted and explicit');
assert.equal(zipProjection.unboundArtifacts.length, 0, 'workspace-bound ZIP material should no longer be discarded');
assert.equal(zipProjection.portals.length, 1, 'cross-repository Parent URLs should resolve across projection-bound ZIP material');
assert.equal(zipProjection.verses.find((verse) => verse.repo === 'Tiinex/docs')?.realm?.id, 'archive');
assert.equal(zipProjection.verses.find((verse) => verse.repo === 'Tiinex/business')?.realm?.id, 'citadel');
assert.equal(zipProjection.verses.find((verse) => verse.repo === 'Tiinex/site')?.realm?.id, 'signal-city');

const ambiguousLocal = localize(record({ title: 'Ambiguous', path: '.topics/ambiguous.trace.md' }));
const ambiguousProjection = projectPlaythingsMultiverse([{ id: 'research-workspace', name: 'Research', sources: [{ id: 'local', adapterId: 'local', kind: 'local' }, { id: 'docs-origin', adapterId: 'github', repo: 'Tiinex/docs' }, { id: 'business-origin', adapterId: 'github', repo: 'Tiinex/business' }], records: [ambiguousLocal] }]);
assert.equal(ambiguousProjection.verses.length, 0, 'ambiguous workspace repository affinity must remain unknown rather than guessed');
assert.equal(ambiguousProjection.unboundArtifacts.length, 1);

const configuredEmptyDocs = projectPlaythingsMultiverse([{ id: 'docs-workspace', name: 'Docs', title: 'Docs', sources: [{ id: 'local', adapterId: 'local', kind: 'local' }, { id: 'docs-origin', adapterId: 'github', repo: 'Tiinex/docs', ref: 'docs-ref' }], records: [] }]);
assert.equal(configuredEmptyDocs.verses.length, 1, 'an unambiguously configured repository remains a realm even when no lineage-readable record is currently resolved');
assert.equal(configuredEmptyDocs.verses[0].repo, 'Tiinex/docs');
assert.equal(configuredEmptyDocs.verses[0].observedCount, 0);
assert.equal(configuredEmptyDocs.verses[0].actors.length, 0);

const realmAdded = planPlaythingsDelta(baseline, projectPlaythingsMultiverse([
  { id: 'business-workspace', title: 'Business', sources: [{ id: 'business-src', adapterId: 'github', repository: 'Tiinex/business', repo: 'Tiinex/business', ref: 'business-ref', repoDiscovery: true }], records: [businessProject] },
  { id: 'site-workspace', title: 'Site', sources: [{ id: 'site-src', adapterId: 'github', repository: 'Tiinex/site', repo: 'Tiinex/site', ref: 'site-ref', repoDiscovery: true }], records: [siteTask] },
  { id: 'docs-workspace', title: 'Docs', sources: [{ id: 'local', adapterId: 'local', kind: 'local' }, { id: 'docs-origin', adapterId: 'github', repo: 'Tiinex/docs', ref: 'docs-ref' }], records: [] }
]));
assert.ok(realmAdded.events.some((event) => event.kind === 'realm' && event.verseId === 'repo:tiinex/docs'), 'a newly configured Verse should enter delta playback before the world settles at Now');
