import assert from 'node:assert/strict';
import '../workspaces/workspace.config.js';
import '../workspaces/workspace.lifecycle.js';
import '../workspaces/workspace.route.js';
import '../workspaces/workspace.persistence.js';
import { workspaceDeclaredSourceInputsFromMarkdown } from '../workspaces/workspace.entrypoints.js';
import {
  normalizeWorkspaceMemberBindings,
  workspaceEntrypointMemberIdentity,
  workspaceMemberBindingFromApply
} from '../workspaces/workspace.memberIdentity.js';
import {
  buildPublicTargetHash,
  parsePublicTargetHash,
  publicTargetFromExternalUrl,
  publicTargetFromWorkspace,
  publicTargetFromWorkspaceMemberBinding
} from '../app/publicTarget.js';
import { mergeWorkspaceRecordAction, openWorkspaceRecordAction } from '../app/workspaceRecordActions.js';
import { runPublicTargetRestoreCommand } from '../app/publicTargetRestoreCommand.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const config = globalThis.TiinexWorkspaceConfig;
const route = globalThis.TiinexWorkspaceRoute;
const persistence = globalThis.TiinexWorkspacePersistence;
const runtimeApi = { lifecycle, config };
const descriptorUrl = 'https://example.test/shared/viewer.workspace.md';
const descriptorTarget = publicTargetFromExternalUrl(descriptorUrl, 'workspace');
const markdown = descriptorMarkdown();
const declaredInputs = workspaceDeclaredSourceInputsFromMarkdown(markdown, config.parseWorkspaceConfig);
assert.deepEqual(declaredInputs.map((input) => input.label), ['News', 'Hidden', 'Documentation'], 'member identity discovery inspects all declared entrypoints before Open-On-Apply filtering');

const identities = Object.fromEntries(declaredInputs.map((input) => [input.label, workspaceEntrypointMemberIdentity(input.workspaceEntrypoint, input)]));
assert(identities.News?.key && identities.Hidden?.key && identities.Documentation?.key, 'each declared member receives a semantic key');
assert.equal(identities.News.kind, 'semantic', 'current workspace schema has no explicit member id, so v390 uses semantic fallback identity');

const reordered = workspaceDeclaredSourceInputsFromMarkdown(reorderedDescriptorMarkdown(), config.parseWorkspaceConfig);
const reorderedIdentities = Object.fromEntries(reordered.map((input) => [input.label, workspaceEntrypointMemberIdentity(input.workspaceEntrypoint, input)]));
assert.equal(reorderedIdentities.Documentation.key, identities.Documentation.key, 'descriptor reordering does not change semantic member identity');
assert.equal(reorderedIdentities.News.key, identities.News.key, 'entrypoint ordering is not part of member identity');

const exactBase = declaredInputs.find((input) => input.label === 'Documentation');
const exactTargetsA = Object.assign({}, exactBase, { explicitFileRefs: ['b.md', 'a.md', 'a.md'], fileRefs: ['b.md', 'a.md', 'a.md'] });
const exactTargetsB = Object.assign({}, exactBase, { explicitFileRefs: ['a.md', 'b.md'], fileRefs: ['a.md', 'b.md'] });
assert.equal(
  workspaceEntrypointMemberIdentity(exactBase.workspaceEntrypoint, exactTargetsA).key,
  workspaceEntrypointMemberIdentity(exactBase.workspaceEntrypoint, exactTargetsB).key,
  'set-like exact target ordering/dedup normalization does not change semantic member identity'
);

const changed = workspaceDeclaredSourceInputsFromMarkdown(changedDocumentationMarkdown(), config.parseWorkspaceConfig).find((input) => input.label === 'Documentation');
assert.notEqual(workspaceEntrypointMemberIdentity(changed.workspaceEntrypoint, changed).key, identities.Documentation.key, 'material source-plan change creates a new semantic member identity');

// Descriptor target keeps existing meaning: default application respects Open On Apply.
const fullCalls = [];
const full = await restore(descriptorTarget, markdown, fullCalls);
assert.equal(full.ok, true, full.error);
assert.deepEqual(full.state.workspaces.map((workspace) => workspace.name), ['News', 'Documentation'], 'workspace descriptor target still means default descriptor-set application');
assert.deepEqual(fullCalls.map((call) => call.input.label), ['News', 'Documentation'], 'Open-On-Apply false remains excluded from descriptor-set application');
for (const workspace of full.state.workspaces) {
  assert.equal(normalizeWorkspaceMemberBindings(workspace.workspaceMemberBindings).length, 1, 'each opened descriptor member retains one exact reconstructive binding');
  assert.equal(workspace.workspaceMemberBindings[0].descriptorTarget.externalTarget, descriptorUrl);
}

const documentationWorkspace = full.state.workspaces.find((workspace) => workspace.name === 'Documentation');
const documentationTarget = publicTargetFromWorkspace(documentationWorkspace);
assert.equal(documentationTarget?.targetKind, 'workspace.member', 'one reconstructive binding yields an exact single-workspace target');
assert.equal(documentationTarget.memberIdentity.key, identities.Documentation.key);
const documentationHash = buildPublicTargetHash(documentationTarget);
const parsedDocumentationTarget = parsePublicTargetHash(documentationHash);
assert.equal(parsedDocumentationTarget?.targetKind, 'workspace.member', 'workspace.member route encoding round-trips through canonical target codec');
assert.equal(parsedDocumentationTarget?.memberIdentity?.key, identities.Documentation.key);

// Fresh receiver applies exactly Documentation, not sibling members.
const documentationCalls = [];
const documentation = await restore(parsedDocumentationTarget, markdown, documentationCalls);
assert.equal(documentation.ok, true, documentation.error);
assert.deepEqual(documentation.state.workspaces.map((workspace) => workspace.name), ['Documentation'], 'workspace.member restores exactly one descriptor member');
assert.deepEqual(documentationCalls.map((call) => call.input.label), ['Documentation']);
assert.equal(publicTargetFromWorkspace(documentation.state.workspaces[0])?.memberIdentity?.key, identities.Documentation.key, 'fresh member restore preserves the same member authority');

// Explicit member selection is not Open-On-Apply filtering.
const hiddenBinding = workspaceMemberBindingFromApply({ descriptorTarget, sourceInput: declaredInputs.find((input) => input.label === 'Hidden') });
const hiddenTarget = publicTargetFromWorkspaceMemberBinding(hiddenBinding);
const hiddenCalls = [];
const hidden = await restore(hiddenTarget, markdown, hiddenCalls);
assert.equal(hidden.ok, true, hidden.error);
assert.deepEqual(hidden.state.workspaces.map((workspace) => workspace.name), ['Hidden'], 'explicit member target can open a member whose Open On Apply is false');
assert.deepEqual(hiddenCalls.map((call) => call.input.label), ['Hidden']);

// Semantic route/session retain compact authority without full descriptor markdown.
const semanticRoute = route.makeRouteState(documentation.state);
assert.equal(semanticRoute.workspaces[0].workspaceMemberBindings?.[0]?.memberIdentity?.key, identities.Documentation.key, '#state semantic route preserves compact member identity');
assert.equal(semanticRoute.workspaces[0].workspaceMemberBindings?.[0]?.descriptorTarget?.externalTarget, descriptorUrl, '#state preserves exact descriptor target');
assert.equal(Object.prototype.hasOwnProperty.call(semanticRoute.workspaces[0], 'workspaceMarkdown'), false, '#state does not serialize full workspace markdown for member authority');
const sessionState = persistence.createSessionCacheState(documentation.state);
assert.equal(sessionState.workspaces[0].workspaceMemberBindings?.[0]?.memberIdentity?.key, identities.Documentation.key, 'session/F5 cache preserves member binding');
const oldRoute = route.normalizeRouteState({ v: 2, activeWorkspaceId: 'legacy', view: {}, workspaces: [{ id: 'legacy', name: 'Legacy', title: 'Legacy', sources: [], records: [], assets: [] }] }, lifecycle);
assert.equal(oldRoute.workspaces[0].workspaceMemberBindings?.length || 0, 0, 'older state without member provenance stays unknown; no backfill guess is invented');

// Stale and ambiguous identities fail truthfully.
const staleTarget = Object.assign({}, documentationTarget, { memberIdentity: Object.assign({}, documentationTarget.memberIdentity, { key: `${documentationTarget.memberIdentity.key}:stale` }) });
const stale = await restore(staleTarget, markdown, []);
assert.equal(stale.ok, false);
assert.equal(stale.error, 'workspace.member.unavailable');
const duplicateMarkdown = duplicateMemberMarkdown();
const duplicateInput = workspaceDeclaredSourceInputsFromMarkdown(duplicateMarkdown, config.parseWorkspaceConfig)[0];
const duplicateBinding = workspaceMemberBindingFromApply({ descriptorTarget, sourceInput: duplicateInput });
const ambiguous = await restore(publicTargetFromWorkspaceMemberBinding(duplicateBinding), duplicateMarkdown, []);
assert.equal(ambiguous.ok, false);
assert.equal(ambiguous.error, 'workspace.member.ambiguous', 'duplicate canonical member match stays ambiguous; no positional fallback');

// Provenance is a set: same binding dedupes, distinct origin makes workspace composite.
const origin = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'origin', name: 'Origin' });
const recordD = workspaceRecord('descriptor-d', descriptorUrl, markdown);
const openedD = openWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig: config.parseWorkspaceConfig, state: origin.state, record: recordD });
assert.equal(openedD.ok, true);
let compositeState = openedD.state;
const docD = compositeState.workspaces.find((workspace) => workspace.name === 'Documentation');
assert.equal(docD.workspaceMemberBindings.length, 1);
const repeatD = mergeWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig: config.parseWorkspaceConfig, state: compositeState, workspaceId: docD.id, record: recordD });
assert.equal(repeatD.ok, true);
compositeState = repeatD.state;
assert.equal(compositeState.workspaces.find((workspace) => workspace.name === 'Documentation').workspaceMemberBindings.length, 1, 'same descriptor/member binding dedupes');
const recordE = workspaceRecord('descriptor-e', 'https://example.test/shared/alternate.workspace.md', alternateDocumentationMarkdown());
const mergeE = mergeWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig: config.parseWorkspaceConfig, state: compositeState, workspaceId: docD.id, record: recordE });
assert.equal(mergeE.ok, true);
const compositeDoc = mergeE.state.workspaces.find((workspace) => workspace.name === 'Documentation');
assert.equal(compositeDoc.workspaceMemberBindings.length, 2, 'different descriptor/member origins remain a provenance set instead of latest-wins');
assert.equal(publicTargetFromWorkspace(compositeDoc), null, 'composite workspace cannot claim one single-workspace public target');

// Manual/unknown workspace and contained public artifacts never substitute for missing workspace authority.
const manual = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { id: 'manual', name: 'Manual' });
assert.equal(publicTargetFromWorkspace(manual.workspace), null, 'manual workspace has no guessed public target');
manual.workspace.records.push({ id: 'topic', title: 'Public Topic', path: 'topic.trace.md', sourceTarget: { inputTarget: 'https://example.test/topic.trace.md' } });
assert.equal(publicTargetFromWorkspace(manual.workspace), null, 'contained public artifact never masquerades as workspace-member target');

console.log('✓ M3-B1 Workspace Member Target Authority tests passed');

async function restore(target, body, calls) {
  return runPublicTargetRestoreCommand({
    target,
    runtimeApi,
    fetchImpl: async (url) => responseText(url === descriptorUrl || /\.workspace\.md$/i.test(String(url)) ? body : '', /\.workspace\.md$/i.test(String(url))),
    runGithubOperation: async (context = {}) => {
      calls.push({ workspaceId: context.options?.workspaceId, input: context.input });
      return { ok: true, state: context.state };
    }
  });
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

function descriptorMarkdown() {
  return `# Shared descriptor\n\n## Workspace Entrypoints\n\n### News\n- Source Kind: github-tree\n- Repository: Owner/News\n- Workspace Label: News\n- Open On Apply: true\n\n### Hidden\n- Source Kind: github-tree\n- Repository: Owner/Hidden\n- Workspace Label: Hidden\n- Open On Apply: false\n\n### Documentation\n- Source Kind: github-tree\n- Repository: Owner/Docs\n- Workspace Label: Documentation\n`;
}

function reorderedDescriptorMarkdown() {
  return `# Shared descriptor\n\n## Workspace Entrypoints\n\n### Documentation\n- Workspace Label: Documentation\n- Repository: Owner/Docs\n- Source Kind: github-tree\n\n### News\n- Workspace Label: News\n- Open On Apply: true\n- Repository: Owner/News\n- Source Kind: github-tree\n\n### Hidden\n- Open On Apply: false\n- Repository: Owner/Hidden\n- Workspace Label: Hidden\n- Source Kind: github-tree\n`;
}

function changedDocumentationMarkdown() {
  return descriptorMarkdown().replace('Repository: Owner/Docs', 'Repository: Owner/Docs-v2');
}

function duplicateMemberMarkdown() {
  return `# Duplicate descriptor\n\n## Workspace Entrypoints\n\n### Duplicate\n- Repository: Owner/Duplicate\n- Workspace Label: Duplicate\n\n### Duplicate\n- Repository: Owner/Duplicate\n- Workspace Label: Duplicate\n`;
}

function alternateDocumentationMarkdown() {
  return `# Alternate descriptor\n\n## Workspace Entrypoints\n\n### Documentation\n- Repository: Owner/Docs-Alternate\n- Workspace Label: Documentation\n`;
}

function responseText(text, ok = true) {
  return { ok, status: ok ? 200 : 404, statusText: ok ? 'OK' : 'Not Found', text: async () => text };
}
