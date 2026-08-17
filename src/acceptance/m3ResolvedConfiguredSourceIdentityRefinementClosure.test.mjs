import assert from 'node:assert/strict';
import '../sources/source.identity.js';
import '../workspaces/workspace.lifecycle.js';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { applyGithubSourceMaterializationCommand } from '../app/githubSourceMaterializationCommand.js';
import { runGithubSourceOperation } from '../app/githubSourceOperation.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const unresolvedId = 'github:owner-repo:unresolved:topics';
const sourceInput = {
  id: unresolvedId,
  label: 'Owner/Repo',
  repository: 'Owner/Repo',
  ref: '',
  rootPath: '.topics',
  explicitFileRefs: ['.topics/a.md'],
  requestedSurfaces: { repoFiles: { requested: false }, explicitFiles: { requested: true, requestedCount: 1 }, issueSnapshots: { requested: false } }
};

function seedUnresolvedWorkspace(name = 'Resolved-ref fixture') {
  const created = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name });
  assert.equal(created.ok, true);
  const registered = lifecycle.addWorkspaceSource(created.state, created.workspace.id, sourceInput);
  assert.equal(registered.ok, true);
  assert.equal(registered.source.id, unresolvedId);
  return { state: registered.state, workspaceId: created.workspace.id, source: registered.source };
}

// Merely supplying an existing id is not authoritative update intent.
{
  const seeded = seedUnresolvedWorkspace('Registration intent');
  const distinctRegistration = lifecycle.addWorkspaceSource(seeded.state, seeded.workspaceId, {
    ...sourceInput,
    ref: 'main'
  });
  assert.equal(distinctRegistration.ok, true);
  const sources = distinctRegistration.workspace.sources.filter((source) => source.id !== 'local');
  assert.equal(sources.length, 2, 'plain registration with a changed boundary must not overwrite the source merely because input.id matches');
  assert.notEqual(distinctRegistration.source.id, unresolvedId, 'plain registration keeps v392 collision-safe identity allocation');
}

// The materialization command is an authoritative refinement of the exact attachment.
{
  const seeded = seedUnresolvedWorkspace('Materialization refinement');
  const record = createRecordFromMarkdown('# A\n\nResolved source material.', { path: '.topics/a.md', sourceMode: 'source' });
  const applied = applyGithubSourceMaterializationCommand({
    lifecycle,
    state: seeded.state,
    workspaceId: seeded.workspaceId,
    source: seeded.source,
    sourceId: unresolvedId,
    sourceLabel: seeded.source.label,
    adapterResult: {
      okCount: 1,
      failCount: 0,
      records: [record],
      errors: [],
      warnings: [],
      diagnostics: {
        resolvedRef: 'main',
        surfaces: { explicitFiles: { attempted: true, requested: true, requestedCount: 1, loaded: 1 } },
        sourcePlan: { surfaces: { explicitFiles: { attempted: true, requested: true, requestedCount: 1, loaded: 1 } } }
      }
    },
    repository: 'Owner/Repo',
    rootPath: '.topics',
    explicitFileRefs: ['.topics/a.md'],
    requestedSurfaces: seeded.source.requestedSurfaces,
    selectedTransportSurfaces: ['explicitFiles']
  });
  assert.equal(applied.ok, true, applied.error);
  const workspace = applied.state.workspaces.find((item) => item.id === seeded.workspaceId);
  const sources = workspace.sources.filter((source) => source.id !== 'local');
  assert.equal(sources.length, 1, 'resolved-ref materialization must refine one configured source rather than split it');
  assert.equal(sources[0].id, unresolvedId, 'resolved-ref refinement preserves configured-source attachment identity');
  assert.equal(sources[0].ref, 'main', 'resolved ref is written onto the existing configured source');
  assert.equal(sources[0].discoveryState, 'loaded');
  assert.equal(sources[0].count, 1);
  assert.equal(workspace.records.filter((item) => item.source?.id === unresolvedId).length, 1, 'materialized records remain bound to the surviving source id');
}

// The full GitHub operation includes an earlier pin step; observe every source-registration result.
{
  const seeded = seedUnresolvedWorkspace('Operation refinement');
  const registrationSnapshots = [];
  const observedLifecycle = Object.assign({}, lifecycle, {
    addWorkspaceSource(state, workspaceId, input, options) {
      const result = lifecycle.addWorkspaceSource(state, workspaceId, input, options);
      if (result?.ok) {
        const workspace = result.state.workspaces.find((item) => item.id === workspaceId);
        registrationSnapshots.push((workspace?.sources || []).filter((source) => source.id !== 'local').map((source) => ({ id: source.id, ref: source.ref, rootPath: source.rootPath })));
      }
      return result;
    }
  });
  const commits = [];
  const result = await runGithubSourceOperation({
    input: {
      sourceId: unresolvedId,
      repository: 'Owner/Repo',
      rootPath: '.topics',
      label: 'Owner/Repo',
      explicitFileRefs: ['.topics/a.md'],
      resetSourceCache: false
    },
    state: seeded.state,
    active: seeded.state.workspaces.find((item) => item.id === seeded.workspaceId),
    runtimeApi: { lifecycle: observedLifecycle },
    githubRequestPending: false,
    operationRef: { current: { token: null, controller: null } },
    setNotice: () => {},
    setDialog: () => {},
    setGithubRequestPending: () => {},
    commit: (state, mode) => commits.push({ state, mode }),
    getLatestState: () => seeded.state,
    fetchImpl: async (url) => responseFor(url),
    AbortControllerImpl: undefined
  });
  assert.equal(result.ok, true, result.error);
  assert(registrationSnapshots.length >= 3, 'operation should exercise initial registration, resolved-ref pin and final materialization update');
  assert(registrationSnapshots.every((snapshot) => snapshot.length === 1), 'no intermediate source registration may split unresolved and resolved refs');
  const workspace = result.state.workspaces.find((item) => item.id === seeded.workspaceId);
  const sources = workspace.sources.filter((source) => source.id !== 'local');
  assert.equal(sources.length, 1);
  assert.equal(sources[0].id, unresolvedId);
  assert.equal(sources[0].ref, 'main');
  assert.equal(workspace.records.filter((item) => item.source?.id === unresolvedId).length, 1);
  assert(commits.every(({ state }) => (state.workspaces.find((item) => item.id === seeded.workspaceId)?.sources || []).filter((source) => source.id !== 'local').length === 1), 'visible commits must never expose an intermediate duplicate source');
}

function responseFor(url = '') {
  if (url === 'https://api.github.com/repos/Owner/Repo' || url === 'https://api.github.com/repos/owner/repo') {
    return responseJson({ default_branch: 'main' });
  }
  if (url === 'https://raw.githubusercontent.com/Owner/Repo/main/.topics/a.md' || url === 'https://raw.githubusercontent.com/owner/repo/main/.topics/a.md') {
    return responseText('# A\n\nResolved source material.');
  }
  return { ok: false, status: 404, statusText: 'Not Found', json: async () => ({}), text: async () => '' };
}
function responseJson(json) { return { ok: true, status: 200, statusText: 'OK', json: async () => json, text: async () => JSON.stringify(json) }; }
function responseText(text) { return { ok: true, status: 200, statusText: 'OK', json: async () => ({}), text: async () => text }; }

console.log('✓ M3 resolved configured-source identity refinement closure tests passed');
