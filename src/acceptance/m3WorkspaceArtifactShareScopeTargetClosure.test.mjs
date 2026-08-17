import assert from 'node:assert/strict';
import '../workspaces/workspace.config.js';
import '../workspaces/workspace.lifecycle.js';
import '../workspaces/workspace.route.js';
import '../workspaces/workspace.persistence.js';
import {
  artifactPublicTargetFromRecord,
  parsePublicTargetHash,
  publicTargetFromExternalUrl,
  publicTargetFromRecord
} from '../app/publicTarget.js';
import { runPublicTargetRestoreCommand } from '../app/publicTargetRestoreCommand.js';
import { projectShareTruth, ShareScope } from '../app/shareProjection.js';
import { workspaceEntrypointCapability } from '../workspaces/workspace.entrypointCapability.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const config = globalThis.TiinexWorkspaceConfig;
const route = globalThis.TiinexWorkspaceRoute;
const persistence = globalThis.TiinexWorkspacePersistence;
const runtimeApi = { lifecycle, config };
const publicViewerUrl = 'https://viewer.example/app';
const exactStateBaseUrl = 'https://sender.example/app';
const descriptorUrl = 'https://example.test/shared/viewer.workspace.md';
const descriptorBody = descriptorMarkdown();
const descriptorRecord = workspaceRecord('descriptor', descriptorUrl, descriptorBody);
const seedState = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'seed', name: 'Seed' }).state;

// Target intent is explicit: artifact transport target does not become workspace application merely because the file is a Workspace Artifact.
assert.equal(artifactPublicTargetFromRecord(descriptorRecord)?.targetKind, 'web.markdown');
assert.equal(publicTargetFromRecord(descriptorRecord)?.targetKind, 'workspace');
assert.equal(publicTargetFromExternalUrl(descriptorUrl, 'web.markdown')?.targetKind, 'web.markdown', 'explicit artifact-oriented web target hint is not upgraded by .workspace.md extension');
const githubWorkspaceUrl = 'https://raw.githubusercontent.com/Owner/Repo/Main/path/Viewer.workspace.md';
assert.equal(publicTargetFromExternalUrl(githubWorkspaceUrl, 'github.file')?.targetKind, 'github.file', 'explicit GitHub file intent is not upgraded by .workspace.md extension');
assert.equal(publicTargetFromExternalUrl(githubWorkspaceUrl, 'workspace')?.targetKind, 'workspace', 'explicit descriptor intent remains workspace application');

// ARTIFACT scope: reconstruct and present the Workspace Artifact itself; do not invoke Open/apply implicitly.
const artifactProjection = projectShareTruth({
  scope: ShareScope.artifact,
  state: seedState,
  record: descriptorRecord,
  publicViewerUrl,
  exactStateBaseUrl,
  routeCodec: route,
  persistenceCodec: persistence
});
assert.equal(artifactProjection.publicTarget?.targetKind, 'web.markdown');
const artifactReceiver = await restoreProjection(artifactProjection);
assert.equal(artifactReceiver.ok, true, artifactReceiver.error);
assert.equal(artifactReceiver.workspaceTarget, false, 'artifact-oriented target does not invoke Workspace Open/apply');
assert.equal(artifactReceiver.state.workspaces.length, 1, 'artifact target keeps one receiver workspace');
assert.equal(workspaceEntrypointCapability(artifactReceiver.record).open, true, 'Workspace Artifact Open capability remains available after artifact restore');
assert.equal(artifactReceiver.state.workspaces.some((workspace) => ['News', 'Documentation'].includes(workspace.name)), false, 'artifact share does not materialize descriptor members');
const artifactWorkspace = artifactReceiver.state.workspaces[0];
assert.equal(artifactReceiver.state.workspaceViews?.[artifactWorkspace.id]?.selectedRecordId, artifactReceiver.record.id, 'artifact target selects the descriptor artifact');

// WORKSPACE-SET scope: same descriptor location with explicit workspace intent applies the default Open-On-Apply set.
const workspaceSetProjection = projectShareTruth({
  scope: ShareScope.workspaceSet,
  state: seedState,
  record: descriptorRecord,
  publicViewerUrl,
  exactStateBaseUrl,
  routeCodec: route,
  persistenceCodec: persistence
});
assert.equal(workspaceSetProjection.publicTarget?.targetKind, 'workspace');
const workspaceSetReceiver = await restoreProjection(workspaceSetProjection);
assert.equal(workspaceSetReceiver.ok, true, workspaceSetReceiver.error);
assert.deepEqual(workspaceSetReceiver.state.workspaces.map((workspace) => workspace.name), ['News', 'Documentation'], 'workspace-set target applies descriptor defaults');

// WORKSPACE scope: B1 member authority emits an exact member target and reconstructs only that workspace.
const documentation = workspaceSetReceiver.state.workspaces.find((workspace) => workspace.name === 'Documentation');
assert(documentation, 'descriptor application creates Documentation workspace');
const workspaceProjection = projectShareTruth({
  scope: ShareScope.workspace,
  state: workspaceSetReceiver.state,
  workspace: documentation,
  publicViewerUrl,
  exactStateBaseUrl,
  routeCodec: route,
  persistenceCodec: persistence
});
assert.equal(workspaceProjection.publicTarget?.targetKind, 'workspace.member');
const workspaceReceiver = await restoreProjection(workspaceProjection);
assert.equal(workspaceReceiver.ok, true, workspaceReceiver.error);
assert.deepEqual(workspaceReceiver.state.workspaces.map((workspace) => workspace.name), ['Documentation'], 'workspace.member reconstructs exactly one member');

console.log('✓ M3-B2 Workspace Artifact share-scope target closure tests passed');

async function restoreProjection(projection) {
  return runPublicTargetRestoreCommand({
    target: targetFromProjection(projection),
    runtimeApi,
    fetchImpl: async (url) => responseText(String(url) === descriptorUrl ? descriptorBody : '', String(url) === descriptorUrl),
    runGithubOperation: async (context = {}) => ({ ok: true, state: context.state })
  });
}

function targetFromProjection(projection) {
  const url = new URL(projection.publicUrl);
  return parsePublicTargetHash(url.hash);
}

function descriptorMarkdown() {
  return `# Shared descriptor\n\n## Workspace Entrypoints\n\n### News\n- Source Kind: github-tree\n- Repository: Owner/News\n- Workspace Label: News\n- Open On Apply: true\n\n### Hidden\n- Source Kind: github-tree\n- Repository: Owner/Hidden\n- Workspace Label: Hidden\n- Open On Apply: false\n\n### Documentation\n- Source Kind: github-tree\n- Repository: Owner/Docs\n- Workspace Label: Documentation\n`;
}

function workspaceRecord(id, url, body) {
  return {
    id,
    title: 'Workspace descriptor',
    path: new URL(url).pathname.split('/').pop(),
    markdown: body,
    source: { adapterId: 'web', url },
    sourceTarget: { inputTarget: url, sourceArtifactPath: new URL(url).pathname.replace(/^\//, '') },
    workspaceArtifactRole: { openEligible: true }
  };
}

function responseText(text, ok = true) {
  return { ok, status: ok ? 200 : 404, statusText: ok ? 'OK' : 'Not Found', text: async () => text };
}
