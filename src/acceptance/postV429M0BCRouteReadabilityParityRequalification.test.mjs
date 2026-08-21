import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { validateArtifact } from '../validation/validateArtifact.js';
import { runAudit } from '../audit/audit.run.js';
import { recordMatchesQuery } from '../workspaces/workspace.displayFilters.js';
import { buildWorkspaceLineageView } from '../workspaces/workspace.lineageView.js';

const workspaceMarkdown = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.workspace.v1](tiinex.workspace.v1.schema.md)\n  - Created At: 2026-08-18T00:00:00Z\n  - Summary: Workspace validation fixture.\n\n---\n\n# Validation Workspace\n\n## Workspace Entrypoints\n\n### Docs\n\n- Source Kind: github-tree\n- Repository: Tiinex/docs\n- Ref: master\n- Root Path: .topics\n`;

const validation = validateArtifact({ markdown: workspaceMarkdown });
assert.equal(validation.schemaId, 'tiinex.workspace.v1');
assert.equal(validation.validation.childValidator, 'run', 'exact Workspace artifact validator must run against parsed Tiinex artifact shape');
assert.equal(validation.validation.state, 'exact-schema-validated');
assert.equal(validation.findings.some((finding) => finding.code === 'workspace.id.missing' || finding.code === 'workspace.name.required' || finding.code === 'workspace.source.boundary.unclear'), false, 'runtime Workspace-shape findings must not leak into artifact validation');
assert.equal(validation.findings.filter((finding) => finding.qualification === 'schema-specific').length, 0, 'valid exact Workspace artifact intentionally exercises zero-finding child validation');

const audited = runAudit({ markdown: workspaceMarkdown, record: { id: 'workspace-artifact', path: '.topics/.workspaces/viewer.workspace.md', schemaId: 'tiinex.workspace.v1', markdown: workspaceMarkdown } });
assert.equal(audited.validation.childValidator, 'run', 'Audit must preserve explicit child-validator execution truth even when exact child validator emits zero findings');
assert.equal(audited.validation.state, 'exact-schema-validated');
assert.equal(audited.findings.some((finding) => finding.code === 'audit.validator.unavailable'), false, 'zero-finding exact validation must not be reconstructed as validator unavailable');

const record = {
  id: 'schema-dogfood',
  title: 'Workspace Schema Notes',
  summary: 'Catalog fixture',
  path: '.topics/.schemas/workspace/tiinex.workspace.v1.schema.md',
  schemaId: 'tiinex.schema.v1',
  markdown: '# Workspace Schema Notes\n\nBody-only dogfood needle.\n'
};
assert.equal(recordMatchesQuery(record, 'tiinex.schema.v1'), true, 'Discovery search covers qualified schema identity');
assert.equal(recordMatchesQuery(record, 'body-only dogfood needle'), true, 'Discovery search covers already-loaded Markdown body without network search');
assert.equal(recordMatchesQuery({ ...record, kind: 'markdown', schemaId: '' }, 'markdown'), true, 'kind remains a searchable material descriptor without becoming Schema-filter identity');

const lineage = buildWorkspaceLineageView({ id: 'w', title: 'Schemas', records: [record] }, { records: [record], query: 'body-only dogfood needle' });
assert.equal(lineage.nodes.length, 1, 'Lineage overview search consumes the same loaded body readability value');

const viewSource = fs.readFileSync('src/schemas/workspace/workspace.views.jsx', 'utf8');
assert.ok(viewSource.includes("const transitionProductActionsVisible = !selectionActive && !readOnlyHistorical && (verse === 'feed' || verse === 'lineage')"), 'Transition shared context is scoped to live action-card surfaces and historical review remains read-only');
assert.ok(viewSource.includes(': null), [transitionProductActionsVisible, allRecords, referenceRecords])'), 'Tree/Audit avoid unrelated transition preparation');

const chrome = fs.readFileSync('src/schemas/workspace/workspace.chrome.views.jsx', 'utf8');
assert.ok(chrome.includes('Search title/body/schema/path…'), 'search product copy matches bounded current loaded-material coverage');

console.log('post-v429 M0-B/C route/readability parity requalification: PASS');
