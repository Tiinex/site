import assert from 'node:assert/strict';
import { createRecordFromMarkdown } from '../artifacts/artifact.record.js';
import { tiinexAppConfigSourceToStartupPlan } from '../app/tiinexAppConfigPlan.js';
import { mergeWorkspaceRecordAction, openWorkspaceRecordAction } from '../app/workspaceRecordActions.js';
import { workspaceEntrypointApplies, workspaceSourceInputsFromMarkdown } from '../workspaces/workspace.entrypoints.js';

await import('../workspaces/workspace.config.js');
await import('../workspaces/workspace.lifecycle.js');
const lifecycle = globalThis.TiinexWorkspaceLifecycle;
const parseWorkspaceConfig = globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig;

assert.equal(workspaceEntrypointApplies({}), true, 'omitted Open On Apply defaults true like PoC');
for (const value of [true, 'true', 'yes', 'enabled', 'enable', 'on', '1', 'unknown-value']) {
  assert.equal(workspaceEntrypointApplies({ openOnApply: value }), true, `${String(value)} remains affirmative/default-true`);
}
for (const value of [false, 'false', 'no', 'disabled', 'disable', 'off', '0']) {
  assert.equal(workspaceEntrypointApplies({ openOnApply: value }), false, `${String(value)} disables apply`);
}

const markdown = workspaceSetMarkdown();
const parsedInputs = workspaceSourceInputsFromMarkdown(markdown, parseWorkspaceConfig);
assert.deepEqual(parsedInputs.map((input) => input.label), ['A', 'C'], 'canonical workspace input derivation includes true + omitted and excludes false');
assert.deepEqual(parsedInputs.map((input) => input.repository), ['Owner/A', 'Owner/C']);

const config = parseWorkspaceConfig(markdown);
const startupPlan = tiinexAppConfigSourceToStartupPlan({ config, configUrl: 'embedded-test' });
assert.equal(startupPlan.ok, true);
assert.deepEqual(startupPlan.inputs.map((input) => input.label), ['A', 'C'], 'app-config startup plan reuses canonical Open On Apply predicate');
assert.deepEqual(startupPlan.inputs.map((input) => input.repository), ['Owner/A', 'Owner/C']);

const origin = lifecycle.createWorkspace(lifecycle.makeEmptyAppState(), { name: 'Origin' });
origin.workspace.sources = [{ id: 'source:origin', adapterId: 'github', kind: 'github-tree', repo: 'Owner/origin', discoveryState: 'loaded' }];
const record = Object.assign(createRecordFromMarkdown(markdown, { path: '.topics/app.workspace.md', sourceMode: 'source-backed-workspace-file' }), {
  id: 'workspace-record:apply-contract', title: 'Apply contract', path: '.topics/app.workspace.md',
  source: { id: 'github:owner/config', adapterId: 'github', sourceKind: 'github.repo', repo: 'Owner/config', sourceBacked: true },
  workspaceArtifactRole: { schema: 'tiinex.workspace.artifact.role.v1', openEligible: true, mergeEligible: true }
});

const opened = openWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig, state: origin.state, record });
assert.equal(opened.ok, true, opened.error);
assert.deepEqual(opened.state.workspaces.map((workspace) => workspace.name), ['A', 'C'], 'Workspace Artifact Open applies only true/omitted entrypoints in declared order');
assert.deepEqual(opened.sourceInputs.map((input) => input.label), ['A', 'C'], 'disabled entrypoint is never prepared for Open materialization');
assert.equal(opened.state.workspaces.some((workspace) => workspace.name === 'B'), false);

const merged = mergeWorkspaceRecordAction({ lifecycle, parseWorkspaceConfig, state: origin.state, workspaceId: origin.workspace.id, record });
assert.equal(merged.ok, true, merged.error);
assert.deepEqual(merged.sourceInputs.map((input) => input.label), ['A', 'C'], 'Workspace Artifact Merge uses the same applicability owner');
assert.equal(merged.state.workspaces.some((workspace) => workspace.name === 'B'), false, 'disabled entrypoint is never created by Merge');

console.log('✓ PoC Open On Apply semantic closure tests passed');

function workspaceSetMarkdown() {
  return `# Apply contract\n\n## Workspace Entrypoints\n\n### A\n- Source Kind: github-tree\n- Repository: Owner/A\n- Workspace Label: A\n- Open On Apply: true\n\n### B\n- Source Kind: github-tree\n- Repository: Owner/B\n- Workspace Label: B\n- Open On Apply: false\n\n### C\n- Source Kind: github-tree\n- Repository: Owner/C\n- Workspace Label: C\n`;
}
