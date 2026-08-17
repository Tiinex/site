import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import '../workspaces/workspace.config.js';
import '../workspaces/workspace.lifecycle.js';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { buildPublicTargetHash, buildPublicViewerTargetUrl, classifyRouteLocation, parsePublicTargetHash, publicTargetFromExternalUrl } from '../app/publicTarget.js';
import { runPublicTargetRestoreCommand } from '../app/publicTargetRestoreCommand.js';

const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const config = globalThis.TiinexWorkspaceConfig;
const runtimeApi = { lifecycle, config };

const issueTarget = publicTargetFromExternalUrl('https://github.com/Tiinex/docs/issues/9#issuecomment-4881782365');
assert.equal(issueTarget.targetKind, 'github.issue.comment');
assert.equal(issueTarget.repository, 'Tiinex/docs');
assert.equal(issueTarget.commentId, '4881782365');
const fileTarget = publicTargetFromExternalUrl('https://github.com/Tiinex/docs/blob/main/.topics/odysseus/001.trace.md');
assert.equal(fileTarget.targetKind, 'github.file');
assert.equal(fileTarget.path, '.topics/odysseus/001.trace.md');
const workspaceTarget = publicTargetFromExternalUrl('https://raw.githubusercontent.com/Tiinex/docs/main/.topics/viewer.workspace.md');
assert.equal(workspaceTarget.targetKind, 'workspace');
const exactHash = '#state=abc';
assert.equal(classifyRouteLocation({ hash: exactHash }).kind, 'semantic-state', '#state stays owned by existing semantic persistence route');
const publicHash = buildPublicTargetHash(issueTarget);
assert.equal(classifyRouteLocation({ hash: publicHash }).kind, 'public-target');
assert.equal(parsePublicTargetHash(publicHash)?.commentId, '4881782365');
assert.equal(classifyRouteLocation({ hash: '' }).kind, 'clean');
assert.equal(buildPublicViewerTargetUrl(issueTarget, 'https://tiinex.dev/').startsWith('https://tiinex.dev/#'), true, 'public viewer link is derived from canonical target and route codec');

// Fresh receiver, ordinary external artifact: no pre-existing/local state is accepted by the command.
const ordinaryUrl = 'https://example.test/shared/topic.trace.md';
const ordinary = await runPublicTargetRestoreCommand({
  target: publicTargetFromExternalUrl(ordinaryUrl, 'web.markdown'),
  runtimeApi,
  fetchImpl: async (url) => responseText(url === ordinaryUrl ? topicMarkdown('Shared topic') : '', url === ordinaryUrl)
});
assert.equal(ordinary.ok, true, ordinary.error);
assert.deepEqual(ordinary.state.workspaces.map((workspace) => workspace.name), ['Shared example.test'], 'fresh receiver is built from target, not unrelated local workspace state');
assert.equal(ordinary.record.title, 'Shared topic');
assert.equal(ordinary.state.view.workspaceVerse, 'lineage');
assert.equal(ordinary.state.view.selectedRecordId, ordinary.record.id, 'ordinary artifact is selected without mutating workspace set');

// Fresh receiver, workspace target: materialize descriptor, then use canonical Workspace Artifact Open/apply.
const workspaceUrl = 'https://example.test/shared/app.workspace.md';
const githubCalls = [];
const workspace = await runPublicTargetRestoreCommand({
  target: publicTargetFromExternalUrl(workspaceUrl, 'workspace'),
  runtimeApi,
  fetchImpl: async (url) => responseText(url === workspaceUrl ? workspaceMarkdown() : '', url === workspaceUrl),
  runGithubOperation: async (context = {}) => {
    githubCalls.push({ workspaceId: context.options?.workspaceId, input: context.input });
    return { ok: true, state: context.state };
  }
});
assert.equal(workspace.ok, true, workspace.error);
assert.equal(workspace.workspaceTarget, true);
assert.deepEqual(workspace.state.workspaces.map((item) => item.name), ['A', 'C'], 'workspace public target applies canonical Open-On-Apply workspace set and consumes discovery shell');
assert.deepEqual(githubCalls.map((call) => call.input.label), ['A', 'C'], 'public restore materializes only applicable workspace entrypoints through existing source owner');
assert.equal(githubCalls.some((call) => call.input.label === 'B'), false, 'disabled entrypoint is not materialized');

// Route integration is explicit in product owner and async restore stays outside persistence.resolveInitialState.
const appSource = readFileSync(new URL('../app/TiinexApp.jsx', import.meta.url), 'utf8');
const runtimeSource = readFileSync(new URL('../app/runtimeState.js', import.meta.url), 'utf8');
const persistenceSource = readFileSync(new URL('../workspaces/workspace.persistence.js', import.meta.url), 'utf8');
assert(appSource.includes("routeOwner.kind === 'public-target'"), 'browser navigation classifies public target before persistence/startup owners');
assert(appSource.includes('runPublicTargetRestoreCommand'), 'TiinexApp routes public target to bounded async restore command');
assert(runtimeSource.includes('classifyRouteLocation(window.location)'), 'initial runtime classifies route kind centrally');
assert.equal(persistenceSource.includes('runPublicTargetRestoreCommand'), false, 'async public restore must not enter synchronous persistence owner');
assert(persistenceSource.includes('if (!env.preserveUrl) writeUrlHash'), 'public restore can persist/cache state without rewriting its readable target URL immediately');

const unsupported = await runPublicTargetRestoreCommand({ target: publicTargetFromExternalUrl('https://example.test/page.html'), runtimeApi });
assert.equal(unsupported.ok, false);
assert.equal(unsupported.error, 'public-target.unsupported', 'unsupported target fails truthfully rather than guessing material semantics');

console.log('✓ M3-A public target route / restore spine tests passed');

function topicMarkdown(title) {
  return `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)\n  - Created At: 2026-08-14\n  - Summary: Public target topic.\n\n---\n\n# ${title}\n\nPublic target material.\n`;
}

function workspaceMarkdown() {
  return `# Public workspace\n\n## Workspace Entrypoints\n\n### A\n- Source Kind: github-tree\n- Repository: Owner/A\n- Workspace Label: A\n- Open On Apply: true\n\n### B\n- Source Kind: github-tree\n- Repository: Owner/B\n- Workspace Label: B\n- Open On Apply: false\n\n### C\n- Source Kind: github-tree\n- Repository: Owner/C\n- Workspace Label: C\n`;
}

function responseText(text, ok = true) {
  return { ok, status: ok ? 200 : 404, statusText: ok ? 'OK' : 'Not Found', text: async () => text };
}
