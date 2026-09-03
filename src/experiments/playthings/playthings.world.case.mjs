import assert from 'node:assert/strict';
import { generatePlaythingsWorld, playthingsVisibleRoads } from './playthings.world.js';

function artifact(key, overrides = {}) {
  return {
    key,
    title: key,
    schemaId: 'tiinex.task.v1',
    presentationSchemaId: 'tiinex.task.v1',
    verseId: 'repo:tiinex/site',
    repo: 'Tiinex/site',
    createdAt: '2026-09-01 10:00:00',
    visualKind: 'workbench',
    interactionKind: 'work',
    persistenceKind: 'none',
    arrivalKind: '',
    ...overrides
  };
}

const root = artifact('root', { createdAt: '2026-09-01 10:00:00' });
const child = artifact('child', { verseId: 'repo:tiinex/business', repo: 'Tiinex/business', createdAt: '2026-09-01 10:01:00' });
const sibling = artifact('sibling', { createdAt: '2026-09-01 10:02:00' });
const baseModel = {
  fingerprint: 'world-a',
  verses: [{ id: 'repo:tiinex/site' }, { id: 'repo:tiinex/business' }],
  artifacts: [root, child, sibling],
  edges: [
    { key: 'parent:root->child', kind: 'parent', from: 'root', to: 'child', crossVerse: true },
    { key: 'parent:root->sibling', kind: 'parent', from: 'root', to: 'sibling', crossVerse: false }
  ],
  portals: []
};

const worldA = generatePlaythingsWorld(baseModel);
const worldB = generatePlaythingsWorld(baseModel);
assert.deepEqual(worldA.scenePositions.get('root'), worldB.scenePositions.get('root'), 'same history must generate the same root scene');
assert.deepEqual(worldA.scenePositions.get('child'), worldB.scenePositions.get('child'), 'same history must generate the same cross-origin child scene');
assert.notDeepEqual(worldA.scenePositions.get('child'), worldA.scenePositions.get('root'), 'an advancing scene must find nearby free space rather than pop onto its parent');
assert.equal(worldA.structures.length, 0, 'ordinary Tasks must not become permanent world objects');
const splitProjection = worldA.eventProjection.get('artifact:sibling');
assert.equal(splitProjection.motionPoints.length >= 2, true, 'a sibling split has a real movement path');
assert.deepEqual(splitProjection.branchPoint, worldA.actorPositions.get('root'), 'sibling placement is generated from the actual branch point');
assert.equal(splitProjection.fork?.arms?.length, 3, 'a sibling fork produces one synchronized three-arm presentation: sleep return, continuation return, and new sibling');
assert.deepEqual(splitProjection.fork.arms.map((arm) => arm.kind), ['sleep-return', 'continuation', 'sibling']);
assert.ok(splitProjection.fork.arms.every((arm) => arm.points.length >= 1 && JSON.stringify(arm.points[0]) === JSON.stringify(splitProjection.branchPoint)), 'all three fork actors depart from the same actual branch point');

const prefixModel = { ...baseModel, fingerprint: 'prefix', artifacts: [root, child], edges: baseModel.edges.slice(0, 1) };
const prefix = generatePlaythingsWorld(prefixModel);
assert.deepEqual(prefix.scenePositions.get('root'), worldA.scenePositions.get('root'), 'later suffix history must not move an existing root');
assert.deepEqual(prefix.scenePositions.get('child'), worldA.scenePositions.get('child'), 'later suffix history must not move an existing child');

const org = artifact('org', {
  schemaId: 'tiinex.party.organization.v1',
  presentationSchemaId: 'tiinex.party.organization.v1',
  visualKind: 'organization-place',
  interactionKind: 'build',
  persistenceKind: 'structure',
  spawnCapability: 'organization',
  createdAt: '2026-09-01 09:00:00'
});
const nestedOrg = artifact('org-child', {
  schemaId: 'tiinex.party.organization.v1',
  presentationSchemaId: 'tiinex.party.organization.v1',
  visualKind: 'organization-place',
  interactionKind: 'build',
  persistenceKind: 'structure',
  spawnCapability: 'organization',
  createdAt: '2026-09-01 09:01:00'
});
const handoff = artifact('handoff', {
  schemaId: 'tiinex.handoff.v1',
  presentationSchemaId: 'tiinex.handoff.v1',
  visualKind: 'handoff-scene',
  interactionKind: 'receive',
  arrivalKind: 'organization-receiver',
  createdAt: '2026-09-01 09:02:00'
});
const handoffModel = {
  fingerprint: 'handoff', verses: [{ id: 'repo:tiinex/site' }], artifacts: [org, nestedOrg, handoff],
  edges: [
    { key: 'parent:org->org-child', kind: 'parent', from: 'org', to: 'org-child' },
    { key: 'parent:org-child->handoff', kind: 'parent', from: 'org-child', to: 'handoff' }
  ], portals: []
};
const handoffWorld = generatePlaythingsWorld(handoffModel);
assert.equal(handoffWorld.structures.length, 2, 'organization history builds persistent places instead of pre-seeding scenery');
assert.equal(handoffWorld.structuresByArtifact.get('org').organizationDepth, 0, 'root organization uses depth-zero settlement morphology');
assert.ok(handoffWorld.structuresByArtifact.get('org').footprint.radius > 50, 'castle-scale organization reserves substantially more physical world area than a Plaything');
assert.equal(handoffWorld.structuresByArtifact.get('org-child').organizationDepth, 1, 'nested organization changes morphology by consecutive organization depth');
assert.equal(handoffWorld.eventProjection.get('artifact:handoff').arrivalReason, 'organization-receiver', 'handoff receiving movement can originate from an already-built organization spawn place');
assert.notDeepEqual(handoffWorld.eventProjection.get('artifact:handoff').sourcePoint, handoffWorld.actorPositions.get('org-child'), 'handoff receiver source is generated from the organization place rather than pretending the parent walked the route');


const workspacePlace = artifact('workspace-place', {
  schemaId: 'tiinex.workspace.v1', presentationSchemaId: 'tiinex.workspace.v1', visualKind: 'workspace-place', interactionKind: 'build-workspace',
  persistenceKind: 'structure', spawnCapability: 'habitat', isWorkspaceArtifact: true, workspaceClusterSize: 3, createdAt: '2026-09-01 08:00:00'
});
const workspaceChild = artifact('workspace-child', { createdAt: '2026-09-01 08:01:00' });
const workspaceWorld = generatePlaythingsWorld({ fingerprint: 'workspace', verses: [{ id: 'repo:tiinex/site' }], artifacts: [workspacePlace, workspaceChild], edges: [{ key: 'parent:workspace-place->workspace-child', kind: 'parent', from: 'workspace-place', to: 'workspace-child' }], portals: [] });
const workshop = workspaceWorld.structuresByArtifact.get('workspace-place');
assert.equal(workshop.kind, 'workspace');
assert.equal(workshop.clusterSize, 3, 'workspace cluster size drives workshop/hamlet presentation only');
assert.equal(workshop.habitat, true, 'workspace place may shelter resting Playthings');
assert.equal(workspaceWorld.eventProjection.get('artifact:workspace-child').placementReason, 'near-place:workspace-place', 'children receive a soft placement incentive from an explicit place ancestor');
const organicPoint = workspaceWorld.scenePositions.get('workspace-child');
assert.equal(organicPoint.x % 42 === 0 && organicPoint.y % 42 === 0, false, 'organic placement is not projected onto the previous 42px grid');


const schemaOnly = artifact('schema-only', { schemaId: 'tiinex.schema.module.v1', presentationSchemaId: 'tiinex.schema.module.v1', visualKind: 'blueprint-scene', interactionKind: 'blueprint', isSchemaArtifact: true, createdAt: '2026-09-01 09:00:00' });
const schemaOnlyWorld = generatePlaythingsWorld({ fingerprint: 'schema-only', verses: [{ id: 'repo:tiinex/site' }], artifacts: [schemaOnly], edges: [], portals: [] });
assert.equal(schemaOnlyWorld.livingLeafKeys.length, 0, 'schema blueprint leaves must not occupy the earth as living Playthings');


const deceptiveSchema = artifact('organization-schema-doc', {
  schemaId: 'tiinex.party.organization.v1', presentationSchemaId: 'tiinex.party.organization.v1', visualKind: 'blueprint-scene', interactionKind: 'blueprint',
  persistenceKind: 'structure', spawnCapability: 'organization', isSchemaArtifact: true, createdAt: '2026-09-01 09:00:00'
});
const deceptiveSchemaWorld = generatePlaythingsWorld({ fingerprint: 'deceptive-schema', verses: [{ id: 'repo:tiinex/site' }], artifacts: [deceptiveSchema], edges: [], portals: [] });
assert.equal(deceptiveSchemaWorld.structures.length, 0, 'world generation defensively refuses persistent structures for .schema.md artifacts even if upstream metadata leaks place semantics');

const restHabitat = artifact('rest-habitat', {
  schemaId: 'tiinex.party.organization.v1', presentationSchemaId: 'tiinex.party.organization.v1', visualKind: 'organization-place', interactionKind: 'build',
  persistenceKind: 'structure', spawnCapability: 'organization', createdAt: '2026-09-01 00:00:00'
});
const oldLeaf = artifact('old-leaf', { createdAt: '2026-09-01 00:01:00' });
const oldLeafTwo = artifact('old-leaf-two', { createdAt: '2026-09-01 00:02:00' });
const oldLeafThree = artifact('old-leaf-three', { createdAt: '2026-09-01 00:03:00' });
const clockAdvance = artifact('clock-advance', { createdAt: '2026-09-09 00:00:00' });
const restingWorld = generatePlaythingsWorld({ fingerprint: 'resting-migration', verses: [{ id: 'repo:tiinex/site' }], artifacts: [restHabitat, oldLeaf, oldLeafTwo, oldLeafThree, clockAdvance], edges: [], portals: [] });
const migrations = restingWorld.restingMigrationsByEvent.get('artifact:clock-advance') || [];
assert.ok(migrations.some((migration) => migration.headKey === 'old-leaf'), 'a leaf crossing the >7 day idle threshold migrates toward an already-built habitat instead of vanishing');
assert.ok(migrations.find((migration) => migration.headKey === 'old-leaf').durationMs >= 520, 'resting migration has visible bounded travel time rather than zero-duration disappearance');
assert.ok(['old-leaf','old-leaf-two','old-leaf-three'].every((key) => migrations.some((migration) => migration.headKey === key)), 'all leaves crossing the same relative-time threshold migrate in one concurrent lifecycle batch');
const wornRoads = playthingsVisibleRoads(restingWorld, new Set(['rest-habitat','old-leaf','old-leaf-two','old-leaf-three','clock-advance']));
assert.ok(wornRoads.some((road) => ['wear','trail','path','road'].includes(road.kind)), 'repeated completed traffic through the shared habitat approach deterministically wears visible ground; isolated fragments remain wear rather than fake road sticks');

console.log('✓ Playthings deterministic shared-earth growth projection passed');
