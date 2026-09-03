import assert from 'node:assert/strict';
import { generatePlaythingsWorld } from './playthings.world.js';

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

console.log('✓ Playthings deterministic shared-earth growth projection passed');
