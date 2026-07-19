(() => {
  'use strict';

  const schemaModules = [
    { id: 'tiinex.root.v1', label: 'Root', kind: 'abstract', summary: 'Envelope and fallback contract. Root can be a parent and fallback, but is not a createable artifact type.' },
    { id: 'tiinex.topic.v1', label: 'Topic', kind: 'concrete', summary: 'Concrete bounded topic-oriented lineage artifact.' },
    { id: 'tiinex.preservation.v1', label: 'Preservation', kind: 'concrete', summary: 'Concrete preservation boundary for material made available for later judgment.' },
    { id: 'tiinex.evidence.v1', label: 'Evidence', kind: 'concrete', summary: 'Concrete claim-bearing evidence specialization that depends on preservation semantics.' },
    { id: 'tiinex.schema.module.v1', label: 'Schema Module', kind: 'concrete', summary: 'Capability bundle declaration around schemas, surfaces, validators, forms, and fallbacks.' },
    { id: 'tiinex.presentation.surface.v1', label: 'Presentation Surface', kind: 'concrete', summary: 'Implementation-neutral bounded presentation or interaction surface.' }
  ];

  const demoArtifacts = {
    documentation: `# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](../../.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-07-18 00:00:00
  - Summary: The heart of Tiinex

---

# Documentation

The heart of Tiinex

## Workspace Entry

This entry mirrors the old Tiinex.dev starting rhythm: badges first, title second, actions close to the card.

## Reference Material

- Tiinex docs workspaces
- checkpoint continuity
- source boundary visible

`,
    start: `# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](../../.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-07-18 00:00:00
  - Summary: This is the first workspace loaded when the web viewer starts

---

# Start

This is the first workspace loaded when the web viewer starts

## Workspace Entry

Start keeps a compact continuity card available below Documentation in the default focused window.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: demo-start-v100-not-authoritative
`,
    topic: `# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](../../.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-07-19 00:00:00
  - Summary: Demo topic artifact for parser/root fallback validation.

---

# Parser Grounding Topic

This topic captures the current direction for artifact parsing and root fallback in the fresh Tiinex Site shell.

## Current Read

The app should parse continuity envelope fields before child schema-specific presentation is trusted.

## Design Direction

Keep root fallback visible when a child schema module is unavailable.

## Next Artifacts

- Add feed/detail cards from parsed artifact view models.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: demo-topic-v100-not-authoritative
`,
    evidence: `# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.preservation.v1](../../.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-07-19 00:00:00
  - Trace: [demo-preservation.trace.md](demo-preservation.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](../../.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-07-19 00:00:00
  - Summary: Demo evidence artifact for parser/root fallback validation.

---

# Local Startup Evidence

## Supported Claim Or Question

- Supported Claim Or Question: whether the fresh shell can start through local index.html
- Evidence Role: supports that the file-local startup path is visible

## Provenance

- Known Source: Q manual screenshot feedback
- Preservation Basis: summarized observation in this demo artifact
- Provenance Limits: exact browser console details are outside this sample

## Evidence Material

- Material Kind: screenshot observation
- Material: v82 shell rendered locally without loading app.js

## Preservation And Fidelity

- Preservation State: readable summary preserved in markdown
- Fidelity Notes: summarized by reviewer from screenshot
- Known Losses: exact pixel state and full devtools console not embedded

## Interpretation Limits

- Does Not Prove: full UX correctness or schema validation completeness
- Must Not Be Treated As: deployment proof, source authority, or user acceptance

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: demo-evidence-v100-not-authoritative
`,
    unknown: `# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.experimental.unknown.v1](../../.topics/.schemas/experimental/unknown.schema.md)
  - Created At: 2026-07-19 00:00:00
  - Summary: Demo unknown child schema artifact for root fallback.

---

# Unknown Schema Demo

This artifact intentionally names a schema module the app does not know yet.

## Local Material

The shell should not pretend child-specific validation passed. It should use root fallback and disclose that child validation was skipped.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: demo-unknown-v100-not-authoritative
`
  };

  const schemaIds = new Set(schemaModules.map((schema) => schema.id));
  const moduleById = new Map(schemaModules.map((schema) => [schema.id, schema]));
  const workspace = {
    id: 'local-workspace-v100',
    name: 'Local parser workspace',
    mode: 'file-local',
    records: [],
    activeId: ''
  };
  const state = {
    reader: 'scan',
    verse: 'feed',
    markdown: demoArtifacts.documentation,
    label: 'Documentation',
    source: sourceForSample('documentation'),
    auditReport: null,
    searchQuery: '',
    sourceFilter: 'all',
    activeTask: 'read',
    activePane: 'site',
    columnModes: { site: 'feed', docs: 'feed' },
    workspace
  };

  const surfaces = [
    ['feed', 'card', 'Scan current artifact set'],
    ['tree', 'tree', 'Navigate parent/child structure'],
    ['detail', 'detail', 'Read one artifact deeply'],
    ['lineage', 'graph', 'Trace lineage edges'],
    ['audit', 'audit-report', 'Show traversal, validation, integrity, and source-boundary findings'],
    ['preview', 'detail', 'Preview material or assets'],
    ['share', 'card', 'Summarize for sharing/export'],
    ['create', 'form', 'Create artifacts through schema forms'],
    ['edit', 'form', 'Edit draft artifacts'],
    ['display-options', 'checklist', 'Control filters and reader density'],
    ['source-settings', 'checklist', 'Control source mode and boundaries']
  ].map(([id, kind, purpose]) => ({ id, kind, label: titleCase(id), purpose }));

  const readers = [
    ['scan', 'fast human overview'],
    ['power', 'dense Tiinex-native controls'],
    ['audit', 'lineage, validation, source, and checksum focus'],
    ['handover', 'LLM/human continuation'],
    ['mobile', 'value first, controls second'],
    ['print', 'portable static reading']
  ];

  const verses = [
    { id: 'universe', label: 'Universe', context: 'root entry', kind: 'entry', purpose: 'Root entry verse that presents the first Multiverse to the reader without changing source truth.' },
    { id: 'column', label: 'Column Verse', context: 'universe', kind: 'multiverse', purpose: 'Implemented universe-level multiverse: workspace panes side by side with each pane keeping its own source boundary and mode state.' },
    { id: 'feed', label: 'Feed Verse', context: 'workspace', kind: 'scan', purpose: 'Implemented workspace-level verse: arrange the current artifact set for quick human scanning without changing source truth.' },
    { id: 'tree', label: 'Tree Verse', context: 'workspace', kind: 'continuity', purpose: 'Implemented workspace-level verse: arrange the same artifact set by declared parent/child continuity without claiming missing parents are absent.' }
  ];

  const plannedVerseContexts = [
    { id: 'map', label: 'Map', context: 'workspace', purpose: 'Planned workspace-level spatial verse; frozen until Column happy path is stable and tested.' },
    { id: 'atlas', label: 'Atlas', context: 'universe', purpose: 'Planned universe-level arrangement of one or more Maps; not shown as a ready primary action yet.' },
    { id: 'desktop', label: 'Desktop', context: 'workspace or universe', purpose: 'Future familiar desktop metaphor verse: folders/files/windows over Tiinex material; not implemented yet.' },
    { id: 'gallery', label: 'Gallery', context: 'workspace or artifact-set', purpose: 'Future media-focused verse after a concrete evidence/gallery use-case exists.' },
    { id: 'game-engine-renderer', label: 'Game engine renderer', context: 'renderer', purpose: 'Future renderer possibility for a Verse; not Verse semantics.' }
  ];

  const sourceModes = [
    { id: 'static-fixture', label: 'Static fixture', icon: '●', boundary: 'repo-bundled demo material', github: 'not guessed', write: 'none' },
    { id: 'local-file', label: 'Local file', icon: '◇', boundary: 'user-selected browser File object', github: 'not guessed', write: 'none' },
    { id: 'draft', label: 'Draft / pasted', icon: '✎', boundary: 'in-memory local draft text', github: 'not guessed', write: 'draft-only' },
    { id: 'github-source-backed', label: 'GitHub source-backed', icon: '◆', boundary: 'explicit source descriptor only', github: 'allowed only when declared', write: 'none in v100' }
  ];

  const sourceFilters = [
    { id: 'all', label: 'All', title: 'Show all loaded source boundaries' },
    { id: 'static-fixture', label: 'Static', title: 'Show repo-bundled fixtures' },
    { id: 'local-file', label: 'Local', title: 'Show user-selected local files' },
    { id: 'draft', label: 'Draft', title: 'Show draft/pasted material' },
    { id: 'github-source-backed', label: 'GitHub', title: 'Show explicit source-backed material only' }
  ];

  const discoveryActions = [
    { id: 'display', icon: '☷', label: 'Display', title: 'Display and density controls' },
    { id: 'source', icon: '◈', label: 'Source', title: 'Source boundary settings' },
    { id: 'cache', icon: '↻', label: 'Cache', title: 'Cache is none in local scaffold' },
    { id: 'audit', icon: '✓', label: 'Audit', title: 'Run loaded workspace audit' }
  ];

  const legacyTopCounters = [
    { id: 'sources', icon: '▣', value: '1', title: 'Loaded source groups' },
    { id: 'artifacts', icon: '▤', value: '2', title: 'Visible artifacts in active workspace' },
    { id: 'lineage', icon: '⚚', value: '2', title: 'Known lineage hints' },
    { id: 'drafts', icon: '✒', value: '0', title: 'Open local drafts' }
  ];

  const taskSpine = [
    { id: 'load', icon: '↓', label: 'Load', title: 'Choose sample, file, or draft material' },
    { id: 'read', icon: '◉', label: 'Read', title: 'Read the active artifact in the current workspace' },
    { id: 'trace', icon: '⛓', label: 'Trace', title: 'Switch to Tree and inspect declared continuity' },
    { id: 'audit', icon: '✓', label: 'Audit', title: 'Audit the loaded workspace without hidden source fetches' },
    { id: 'act', icon: '↗', label: 'Act', title: 'Create/share/source actions; scaffolded until form/source parity exists', scaffold: true }
  ];

  const taskStatus = {
    load: 'material ready',
    read: 'read active artifact',
    trace: 'tree arrangement',
    audit: 'loaded audit',
    act: 'scaffolded'
  };

  const ergonomicRule = 'UX should clarify through layout, placement, color, affordance, and consistent behavior before prose.';

  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = renderShell();
  bindDemo();
  loadArtifact(state.markdown, state.label, state.source);
  seedLegacyContinuityRecords();
  renderCurrentArtifact();

  function bindDemo() {
    const textarea = document.getElementById('artifact-input');
    root.addEventListener('click', (event) => {
      const taskButton = event.target.closest('[data-task]');
      if (taskButton) {
        if (taskButton.getAttribute('aria-disabled') === 'true') return;
        const task = taskButton.getAttribute('data-task') || 'read';
        runTask(task);
        return;
      }
      const auditButton = event.target.closest('[data-run-audit]');
      if (auditButton) {
        runTask('audit');
      }
    });
    document.querySelectorAll('[data-sample]').forEach((button) => {
      button.addEventListener('click', () => runDemo(button.getAttribute('data-sample')));
    });
    document.querySelectorAll('[data-reader]').forEach((button) => {
      button.addEventListener('click', () => {
        state.reader = button.getAttribute('data-reader') || 'scan';
        state.activeTask = state.reader === 'audit' ? 'audit' : 'read';
        syncReaderButtons();
        syncTaskSpineButtons();
        renderCurrentArtifact();
      });
    });
    root.addEventListener('click', (event) => {
      const verseButton = event.target.closest('[data-pane-verse]');
      if (!verseButton) return;
      const pane = verseButton.getAttribute('data-pane') || 'site';
      const verse = verseButton.getAttribute('data-pane-verse') || 'feed';
      state.columnModes[pane] = verse;
      if (pane === 'site') state.verse = verse;
      state.activePane = pane;
      state.activeTask = verse === 'tree' ? 'trace' : 'read';
      syncVerseButtons();
      syncTaskSpineButtons();
      renderCurrentArtifact();
    });
    document.getElementById('workspace-search')?.addEventListener('input', (event) => {
      state.searchQuery = event.target.value || '';
      state.activeTask = 'read';
      syncTaskSpineButtons();
      renderVerseParity();
    });
    document.querySelectorAll('[data-source-filter]').forEach((button) => {
      button.addEventListener('click', () => {
        state.sourceFilter = button.getAttribute('data-source-filter') || 'all';
        state.activeTask = 'read';
        syncSourceFilterButtons();
        syncTaskSpineButtons();
        renderVerseParity();
      });
    });
    document.getElementById('parse-artifact')?.addEventListener('click', () => {
      loadArtifact(textarea.value, 'pasted/local input', sourceForPastedInput());
    });
    document.getElementById('artifact-file')?.addEventListener('change', async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const markdown = await file.text();
      textarea.value = markdown;
      loadArtifact(markdown, file.name, sourceForLocalFile(file));
    });
    textarea.value = state.markdown;
    syncReaderButtons();
    syncVerseButtons();
    syncSourceFilterButtons();
    syncTaskSpineButtons();
  }

  function runDemo(name) {
    const textarea = document.getElementById('artifact-input');
    const markdown = demoArtifacts[name] || demoArtifacts.topic;
    const label = `${name} demo fixture`;
    textarea.value = markdown;
    loadArtifact(markdown, label, sourceForSample(name));
  }

  function syncReaderButtons() {
    document.querySelectorAll('[data-reader]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-reader') === state.reader));
    });
  }

  function syncVerseButtons() {
    document.querySelectorAll('[data-pane-verse]').forEach((button) => {
      const pane = button.getAttribute('data-pane') || 'site';
      const mode = state.columnModes[pane] || 'feed';
      button.setAttribute('aria-pressed', String(button.getAttribute('data-pane-verse') === mode));
    });
    const siteMode = state.columnModes.site || state.verse || 'feed';
    const modeName = document.getElementById('main-mode-name');
    const search = document.getElementById('workspace-search');
    if (modeName) modeName.textContent = siteMode === 'tree' ? 'LINEAGE MODE' : 'DISCOVERY MODE';
    if (search) search.placeholder = siteMode === 'tree' ? 'Search lineage title/body/schema…' : 'Search title/schema/source…';
  }

  function syncSourceFilterButtons() {
    document.querySelectorAll('[data-source-filter]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-source-filter') === state.sourceFilter));
    });
  }

  function syncTaskSpineButtons() {
    document.querySelectorAll('[data-task]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-task') === state.activeTask));
    });
    const label = document.getElementById('current-task-label');
    const status = document.getElementById('current-task-status');
    const task = taskSpine.find((item) => item.id === state.activeTask) || taskSpine[1];
    if (label) label.textContent = task.label;
    if (status) status.textContent = taskStatus[task.id] || '';
  }

  function runTask(task) {
    if (task === 'load') {
      document.getElementById('artifact-file')?.click();
      state.activeTask = 'load';
    } else if (task === 'read') {
      state.verse = 'feed';
      state.columnModes.site = 'feed';
      state.reader = state.reader === 'audit' ? 'scan' : state.reader;
      state.activeTask = 'read';
    } else if (task === 'trace') {
      state.verse = 'tree';
      state.columnModes.site = 'tree';
      state.activeTask = 'trace';
    } else if (task === 'audit') {
      state.reader = 'audit';
      state.activeTask = 'audit';
      state.auditReport = runWorkspaceAudit();
    } else if (task === 'act') {
      state.activeTask = 'act';
    }
    syncReaderButtons();
    syncVerseButtons();
    syncTaskSpineButtons();
    renderCurrentArtifact();
  }

  function loadArtifact(markdown, label, source) {
    state.auditReport = null;
    state.activeTask = 'read';
    state.markdown = markdown;
    state.label = label;
    state.source = source || sourceForPastedInput();
    state.workspace.activeId = artifactRecordId(markdown, label, state.source);
    upsertWorkspaceRecord(state.workspace, {
      id: state.workspace.activeId,
      label,
      source: state.source,
      loadedAt: new Date().toISOString(),
      markdown
    });
    renderCurrentArtifact();
  }

  function renderUniverseSurface() {
    const target = document.getElementById('universe-root');
    if (!target) return;
    target.innerHTML = renderUniverse();
    syncVerseButtons();
  }

  function renderCurrentArtifact() {
    renderUniverseSurface();
    renderArtifactResult(state.markdown, state.label, state.reader, state.source);
    renderWorkspaceState();
    renderVerseParity();
    renderAuditReport();
  }

  function seedLegacyContinuityRecords() {
    const startSource = sourceForSample('start');
    const startId = artifactRecordId(demoArtifacts.start, 'Start', startSource);
    if (!state.workspace.records.some((item) => item.id === startId)) {
      state.workspace.records.push({
        id: startId,
        label: 'Start',
        source: startSource,
        loadedAt: new Date().toISOString(),
        markdown: demoArtifacts.start
      });
    }
  }



  function runWorkspaceAudit() {
    const startedAt = new Date().toISOString();
    const projections = state.workspace.records.map(viewModelFromRecord);
    const findings = projections.flatMap((projection) => projection.findings.map((item) => Object.assign({ artifactTitle: projection.viewModel.title }, item)));
    const findingSummary = summarizeFindings(findings);
    const lineage = summarizeAuditLineage(projections);
    const integrity = summarizeAuditIntegrity(projections);
    const status = findingSummary.error > 0
      ? 'attention-required'
      : (findingSummary.warning > 0 || lineage.open > 0 || integrity.open > 0)
        ? 'degraded-review'
        : 'scaffold-complete';
    return {
      type: 'tiinex.web.audit.report.v100',
      status,
      startedAt,
      completedAt: new Date().toISOString(),
      selectedWorkspace: state.workspace.id,
      recordsScanned: projections.length,
      loadedBoundaries: 0,
      networkFetches: 0,
      sourceBoundary: 'no hidden source traversal; local/static/draft remain local/static/draft',
      legacyLesson: 'old lineage audit loaded open parent boundaries, then counted OK/mismatch/open/pending; v100 preserves that shape while keeping verse scope context-bound',
      lineage,
      integrity,
      findings,
      findingSummary,
      steps: [
        'scan loaded workspace records',
        'resolve current schema module for each loaded artifact',
        're-run available load-time validators',
        'identify declared parent edges whose target is not loaded',
        'summarize integrity footer state without claiming byte verification',
        'report missing lineage as open/pending, not absent'
      ]
    };
  }

  function summarizeAuditLineage(projections) {
    let declaredParents = 0;
    let localRoots = 0;
    let resolvedLoaded = 0;
    let open = 0;
    const boundaries = [];
    const byTraceOrSchema = new Map();
    for (const projection of projections) {
      const artifact = projection.artifact;
      if (artifact.envelope.current.schema.id) byTraceOrSchema.set(artifact.envelope.current.schema.id, projection);
      if (artifact.envelope.parent.trace) byTraceOrSchema.set(artifact.envelope.parent.trace, projection);
    }
    for (const projection of projections) {
      const artifact = projection.artifact;
      const model = projection.viewModel;
      const parentSchema = artifact.envelope.parent.schema.id;
      const parentTrace = artifact.envelope.parent.trace;
      if (!parentSchema && !parentTrace) {
        localRoots += 1;
        continue;
      }
      declaredParents += 1;
      const resolved = (parentTrace && byTraceOrSchema.has(parentTrace)) || (parentSchema && byTraceOrSchema.has(parentSchema));
      if (resolved) resolvedLoaded += 1;
      else {
        open += 1;
        boundaries.push({
          artifact: model.title,
          parentSchema: parentSchema || 'unknown parent schema',
          parentTrace: parentTrace || 'no trace declared',
          state: 'open-parent-boundary',
          disclosure: 'Parent edge is declared but the parent artifact is not loaded in this workspace audit skeleton.'
        });
      }
    }
    return { declaredParents, localRoots, resolvedLoaded, open, pending: open, boundaries };
  }

  function summarizeAuditIntegrity(projections) {
    const counts = { total: projections.length, verified: 0, mismatch: 0, open: 0, pending: 0 };
    const entries = [];
    for (const projection of projections) {
      const artifact = projection.artifact;
      const title = projection.viewModel.title;
      if (!artifact.hasIntegrity) {
        counts.open += 1;
        entries.push({ title, status: 'open', detail: 'Continuity Integrity footer missing.' });
      } else {
        counts.pending += 1;
        entries.push({ title, status: 'pending', detail: 'Integrity footer present, but byte/c14n verification is not implemented in this v100 skeleton.' });
      }
    }
    return counts.total ? Object.assign(counts, { entries }) : Object.assign(counts, { entries: [] });
  }

  function renderAuditReport() {
    const target = document.getElementById('audit-report');
    if (!target) return;
    const report = state.auditReport;
    if (!report) {
      target.innerHTML = '<p class="tx-muted">Not run · loaded set only · no hidden fetches</p>';
      return;
    }
    const boundaryRows = report.lineage.boundaries.map((boundary) => `
      <div class="tx-audit-boundary">
        <strong>${escapeHtml(boundary.artifact)}</strong>
        <div class="tx-muted">${escapeHtml(boundary.parentSchema)} · ${escapeHtml(boundary.parentTrace)}</div>
        <p>${escapeHtml(boundary.disclosure)}</p>
      </div>
    `).join('') || '<p class="tx-muted">No open parent boundaries in the currently loaded workspace records.</p>';
    const integrityRows = report.integrity.entries.map((entry) => row(entry.title, entry.detail, [entry.status])).join('');
    target.innerHTML = `
      <div class="tx-audit-head">
        <div>
          <div class="tx-eyebrow">Audit report</div>
          <h3>Loaded workspace audit</h3>
          <p class="tx-muted">Loaded artifacts only · 0 network fetches</p>
        </div>
        <div class="tx-badges">${badge(report.status)}${badge(`${report.recordsScanned} scanned`)}${badge(`${report.networkFetches} network fetches`)}</div>
      </div>
      <div class="tx-audit-counts">
        <div><span>Findings</span><strong>${escapeHtml(formatFindingSummary(report.findingSummary))}</strong></div>
        <div><span>Lineage</span><strong>${escapeHtml(`${report.lineage.resolvedLoaded} resolved · ${report.lineage.open} open`)}</strong></div>
        <div><span>Integrity</span><strong>${escapeHtml(`${report.integrity.verified} verified · ${report.integrity.mismatch} mismatch · ${report.integrity.pending} pending · ${report.integrity.open} open`)}</strong></div>
        <div><span>Loaded parents</span><strong>${escapeHtml(String(report.loadedBoundaries))}</strong></div>
      </div>
      <details class="tx-details" open>
        <summary>Open lineage boundaries</summary>
        <div class="tx-list">${boundaryRows}</div>
      </details>
      <details class="tx-details">
        <summary>Integrity status</summary>
        <div class="tx-list">${integrityRows}</div>
      </details>
      <details class="tx-details">
        <summary>Audit steps</summary>
        <ol class="tx-steps">${report.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join('')}</ol>
      </details>
      <details class="tx-details"><summary>Legacy lesson</summary><p class="tx-muted">${escapeHtml(report.legacyLesson)}</p></details>
    `;
  }

  function renderWorkspaceState() {
    const target = document.getElementById('workspace-state');
    if (!target) return;
    const active = state.workspace.records.find((record) => record.id === state.workspace.activeId) || state.workspace.records[0];
    const rows = state.workspace.records.slice(0, 5).map((record) => row(record.label, `${record.source.kind} · ${record.source.boundary}`, [record.id === state.workspace.activeId ? 'active' : 'loaded', record.source.githubPolicy])).join('');
    target.innerHTML = `
      <div class="tx-workspace-head">
        <div><strong>${escapeHtml(state.workspace.name)}</strong><div class="tx-muted">${escapeHtml(state.workspace.mode)} · ${state.workspace.records.length} loaded artifact${state.workspace.records.length === 1 ? '' : 's'}</div></div>
        <div class="tx-badges">${badge('no local→github guess')}${badge('source rows kept')}</div>
      </div>
      <div class="tx-kv"><span>Active source</span><strong>${escapeHtml(active?.source.label || 'none')}</strong></div>
      <div class="tx-kv"><span>Boundary</span><strong>${escapeHtml(active?.source.boundary || 'none')}</strong></div>
      <div class="tx-kv"><span>GitHub source</span><strong>${escapeHtml(active?.source.githubPolicy || 'not guessed')}</strong></div>
      <div class="tx-list tx-workspace-list">${rows || '<p class="tx-muted">No artifacts loaded.</p>'}</div>
    `;
  }

  function renderSourceModes() {
    return sourceModes.map((mode) => row(mode.label, `${mode.boundary}; GitHub: ${mode.github}; write: ${mode.write}`, [mode.id])).join('');
  }

  function sourceForSample(name) {
    return {
      kind: 'static-fixture',
      label: `${titleCase(name || 'topic')} fixture`,
      boundary: 'repo-bundled demo fixture, not external source material',
      githubPolicy: 'not guessed',
      sourceBacked: false,
      writeCapability: 'none'
    };
  }

  function sourceForLocalFile(file) {
    return {
      kind: 'local-file',
      label: file?.name || 'local file',
      boundary: 'explicit user-selected browser File object; path is not available to runtime',
      githubPolicy: 'not guessed',
      sourceBacked: false,
      writeCapability: 'none',
      size: file?.size || 0
    };
  }

  function sourceForPastedInput() {
    return {
      kind: 'draft',
      label: 'pasted/local input',
      boundary: 'in-memory draft text supplied through the browser UI',
      githubPolicy: 'not guessed',
      sourceBacked: false,
      writeCapability: 'draft-only'
    };
  }

  function resolveSourceBoundary(source, artifact) {
    const activeSource = source || sourceForPastedInput();
    const declaredOrigin = artifact?.envelope?.current?.origin || '';
    const githubAllowed = activeSource.kind === 'github-source-backed' && Boolean(activeSource.permalink);
    return {
      kind: activeSource.kind,
      label: activeSource.label,
      boundary: activeSource.boundary,
      sourceBacked: Boolean(activeSource.sourceBacked),
      githubAllowed,
      githubPolicy: activeSource.githubPolicy || 'not guessed',
      disclosure: githubAllowed
        ? `Explicit source-backed material: ${activeSource.permalink}`
        : `No GitHub source is inferred from local/draft/static material. Declared origin is preserved when present, but this runtime does not promote it into source authority.${declaredOrigin ? ` Declared origin: ${declaredOrigin}` : ''}`
    };
  }

  function upsertWorkspaceRecord(workspaceState, record) {
    workspaceState.records = [record].concat(workspaceState.records.filter((item) => item.id !== record.id)).slice(0, 8);
  }

  function artifactRecordId(markdown, label, source) {
    return `${source?.kind || 'unknown'}:${label}:${simpleHash(markdown)}`;
  }

  function simpleHash(value) {
    let hash = 0;
    for (const char of String(value || '')) hash = ((hash << 5) - hash + char.charCodeAt(0)) | 0;
    return Math.abs(hash).toString(36);
  }

  function parseArtifactMarkdown(markdown = '') {
    const text = normalizeLineEndings(markdown);
    const boundary = findFirstHorizontalRule(text);
    const envelopeText = boundary === -1 ? text : text.slice(0, boundary).trimEnd();
    const remainder = boundary === -1 ? '' : text.slice(boundary).replace(/^---\s*\n?/, '');
    const integrityIndex = remainder.search(/^# Continuity Integrity\s*$/m);
    const bodyText = integrityIndex === -1 ? remainder.trim() : remainder.slice(0, integrityIndex).trim();
    const integrityText = integrityIndex === -1 ? '' : remainder.slice(integrityIndex).trim();
    const envelope = parseContinuityEnvelope(envelopeText);
    const body = parseBody(bodyText);
    const integrity = parseIntegrity(integrityText);
    return {
      markdown: text,
      title: body.title || envelope.current.summary || 'Untitled artifact',
      envelope,
      body,
      integrity,
      hasContinuityContext: /^# Continuity Context\s*$/m.test(envelopeText),
      hasIntegrity: integrity.methods.length > 0
    };
  }

  function parseContinuityEnvelope(envelopeText = '') {
    const parentBlock = blockAfterTopLevelList(envelopeText, 'Parent');
    const currentBlock = blockAfterTopLevelList(envelopeText, 'Current');
    return {
      envelopeSchema: extractSchemaLine(envelopeText, /^-\s*Envelope Schema:\s*(.+)$/m),
      parent: {
        schema: extractSchemaLine(parentBlock, /^\s*-\s*Parent Schema:\s*(.+)$/m),
        createdAt: extractPlainLine(parentBlock, /^\s*-\s*Created At:\s*(.+)$/m),
        trace: extractPlainLine(parentBlock, /^\s*-\s*Trace:\s*(.+)$/m)
      },
      current: {
        schema: extractSchemaLine(currentBlock, /^\s*-\s*Current Schema:\s*(.+)$/m),
        createdAt: extractPlainLine(currentBlock, /^\s*-\s*Created At:\s*(.+)$/m),
        summary: extractPlainLine(currentBlock, /^\s*-\s*Summary:\s*(.+)$/m),
        status: extractPlainLine(currentBlock, /^\s*-\s*Status:\s*(.+)$/m),
        why: extractPlainLine(currentBlock, /^\s*-\s*Why:\s*(.+)$/m)
      },
      repairsDeclared: /^\s*-\s*Repairs:/m.test(envelopeText)
    };
  }

  function parseBody(bodyText = '') {
    const headings = [...bodyText.matchAll(/^(#{1,6})\s+(.+)\s*$/gm)].map((match) => ({ level: match[1].length, text: match[2].trim() }));
    const firstHeading = headings.find((heading) => heading.level === 1 && heading.text !== 'Continuity Context' && heading.text !== 'Continuity Integrity');
    const sections = headings.filter((heading) => heading.level === 2).map((heading) => heading.text);
    return { title: firstHeading?.text || '', headings, sections, text: bodyText, sectionText: mapSectionText(bodyText, sections) };
  }

  function mapSectionText(bodyText, sections) {
    const out = {};
    for (const section of sections) out[section] = extractSectionText(bodyText, section);
    return out;
  }

  function parseIntegrity(integrityText = '') {
    const methods = [...integrityText.matchAll(/^-\s+([^\n]+)\n(?:\s+-\s+[^\n]+\n?)*/gm)].map((match) => match[1].trim());
    const values = [...integrityText.matchAll(/^\s*-\s*Value:\s*(.+)$/gm)].map((match) => match[1].trim());
    return { methods, values, text: integrityText };
  }

  function resolveSchemaModule(schemaId) {
    if (schemaId && schemaIds.has(schemaId)) return { module: moduleById.get(schemaId), status: 'schema-id-match', fallbackUsed: false };
    return { module: moduleById.get('tiinex.root.v1'), status: 'root-fallback', fallbackUsed: true, unresolvedSchemaId: schemaId || 'missing' };
  }

  function validateArtifact(artifact, resolution) {
    const findings = validateRoot(artifact);
    const schemaId = artifact.envelope.current.schema.id;
    if (resolution.fallbackUsed) {
      findings.push(finding('warning', 'root.fallback.used', `Schema module unavailable for ${schemaId || 'missing schema'}; child-specific validation skipped.`, 'tiinex.root.v1'));
      return findings;
    }
    if (schemaId === 'tiinex.topic.v1') validateTopic(artifact, findings);
    if (schemaId === 'tiinex.preservation.v1') validateRequiredSections(artifact, findings, 'tiinex.preservation.v1', ['Preserved Material', 'Preservation Act', 'Provenance', 'Fidelity And Loss', 'Custody Or Storage Boundary', 'Interpretation Limits']);
    if (schemaId === 'tiinex.evidence.v1') validateEvidence(artifact, findings);
    return findings;
  }

  function validateRoot(artifact) {
    const findings = [];
    if (!artifact.hasContinuityContext) findings.push(finding('error', 'root.continuity.missing', 'Missing # Continuity Context.', 'tiinex.root.v1'));
    if (!artifact.envelope.envelopeSchema.id) findings.push(finding('error', 'root.envelopeSchema.missing', 'Missing Envelope Schema.', 'tiinex.root.v1'));
    if (!artifact.envelope.current.schema.id) findings.push(finding('error', 'root.currentSchema.missing', 'Missing Current -> Current Schema.', 'tiinex.root.v1'));
    if (!artifact.envelope.current.createdAt) findings.push(finding('error', 'root.createdAt.missing', 'Missing Current -> Created At.', 'tiinex.root.v1'));
    if (!artifact.hasIntegrity) findings.push(finding('warning', 'root.integrity.missing', 'Missing Continuity Integrity footer.', 'tiinex.root.v1'));
    if (!artifact.envelope.parent.schema.id) findings.push(finding('info', 'root.parent.absent', 'No parent edge declared; artifact is local lineage root unless another relation says otherwise.', 'tiinex.root.v1'));
    if (!findings.some((item) => item.severity === 'error')) findings.push(finding('info', 'root.envelope.readable', 'Root envelope is readable at scaffold validation depth.', 'tiinex.root.v1'));
    return findings;
  }

  function validateTopic(artifact, findings) {
    if (!artifact.body.title) findings.push(finding('error', 'topic.title.missing', 'Topic artifact should begin with a human-readable title.', 'tiinex.topic.v1'));
    if (!artifact.body.text || artifact.body.text.length < 40) findings.push(finding('warning', 'topic.body.thin', 'Topic body is thin; reader may not understand the active topic thread.', 'tiinex.topic.v1'));
    if (!findings.some((item) => item.severity === 'error')) findings.push(finding('info', 'topic.body.readable', 'Topic body is readable at scaffold validation depth.', 'tiinex.topic.v1'));
  }

  function validateEvidence(artifact, findings) {
    validateRequiredSections(artifact, findings, 'tiinex.evidence.v1', ['Supported Claim Or Question', 'Provenance', 'Evidence Material', 'Preservation And Fidelity', 'Interpretation Limits']);
    if (!artifact.envelope.parent.schema.id) findings.push(finding('warning', 'evidence.preservation.parent.unresolved', 'Evidence is preservation-specialized; no parent preservation edge is declared in the envelope.', 'tiinex.evidence.v1'));
  }

  function validateRequiredSections(artifact, findings, source, sections) {
    for (const section of sections) {
      if (!artifact.body.sections.includes(section)) findings.push(finding('error', `${source}.section.missing`, `Missing required section: ${section}.`, source));
    }
    if (!findings.some((item) => item.severity === 'error')) findings.push(finding('info', `${source}.sections.present`, 'Required sections are present at scaffold validation depth.', source));
  }

  function buildArtifactViewModel(artifact, resolution, findings, summary, status, sourceBoundary) {
    const schemaId = artifact.envelope.current.schema.id || 'missing';
    const kind = resolution.fallbackUsed ? 'root fallback' : resolution.module.label.toLowerCase();
    const base = {
      title: artifact.title,
      subtitle: artifact.envelope.current.summary || `${resolution.module.label} artifact`,
      schemaId,
      schemaKind: resolution.module.kind,
      status,
      kind,
      resolution,
      findings,
      findingSummary: summary,
      parentLabel: artifact.envelope.parent.schema.id || 'local lineage root',
      createdAt: artifact.envelope.current.createdAt || 'missing',
      sourceBoundary,
      sections: artifact.body.sections,
      primary: artifact.envelope.current.summary || summarizeText(artifact.body.text, 180),
      fields: [],
      actions: ['collapse', 'preview', 'markdown', 'github', 'share', 'edit', 'open', 'merge']
    };

    if (schemaId === 'tiinex.topic.v1') {
      base.kind = 'topic';
      base.primary = artifact.envelope.current.summary || summarizeText(extractSectionText(artifact.body.text, 'Current Read') || artifact.body.text, 180);
      base.fields = [
        ['Current read', summarizeText(extractSectionText(artifact.body.text, 'Current Read'), 120)],
        ['Design direction', summarizeText(extractSectionText(artifact.body.text, 'Design Direction'), 120)],
        ['Next artifacts', summarizeText(extractSectionText(artifact.body.text, 'Next Artifacts'), 120)]
      ];
    } else if (schemaId === 'tiinex.evidence.v1') {
      base.kind = 'evidence';
      base.primary = extractListField(artifact.body.sectionText['Supported Claim Or Question'], 'Supported Claim Or Question') || base.primary;
      base.fields = [
        ['Evidence role', extractListField(artifact.body.sectionText['Supported Claim Or Question'], 'Evidence Role')],
        ['Known source', extractListField(artifact.body.sectionText.Provenance, 'Known Source')],
        ['Material kind', extractListField(artifact.body.sectionText['Evidence Material'], 'Material Kind')],
        ['Does not prove', extractListField(artifact.body.sectionText['Interpretation Limits'], 'Does Not Prove')]
      ];
      base.actions = ['collapse', 'preview', 'markdown', 'github', 'share', 'edit', 'open', 'merge'];
    } else if (resolution.fallbackUsed) {
      base.kind = 'fallback';
      base.primary = `Unknown child schema: ${resolution.unresolvedSchemaId}. Root envelope can be read, but child-specific validity is not claimed.`;
      base.fields = [
        ['Fallback owner', 'tiinex.root.v1'],
        ['Skipped', 'child-schema-specific validation'],
        ['Disclosure', 'degraded but readable']
      ];
      base.actions = ['collapse', 'preview', 'markdown', 'github', 'share', 'edit', 'open'];
    }
    return base;
  }

  function viewModelFromRecord(record) {
    const artifact = parseArtifactMarkdown(record.markdown);
    const resolution = resolveSchemaModule(artifact.envelope.current.schema.id);
    const findings = validateArtifact(artifact, resolution);
    const summary = summarizeFindings(findings);
    const status = findings.some((item) => item.severity === 'error') ? 'invalid-or-incomplete' : resolution.fallbackUsed ? 'degraded' : 'readable';
    const sourceBoundary = resolveSourceBoundary(record.source, artifact);
    const viewModel = buildArtifactViewModel(artifact, resolution, findings, summary, status, sourceBoundary);
    return { record, artifact, resolution, findings, summary, status, sourceBoundary, viewModel };
  }

  function renderArtifactResult(markdown, label, readerMode, source) {
    const projection = viewModelFromRecord({ markdown, label, source });
    const { artifact, findings, summary, status, viewModel } = projection;
    const target = document.getElementById('artifact-result');
    if (!target) return;
    target.innerHTML = `
      <div class="tx-reader-state">${badge(`reader: ${readerMode}`)}${badge(`surface: card`)}${badge(status)}</div>
      ${renderArtifactCard(viewModel, readerMode)}
      <details class="tx-details" ${readerMode === 'audit' ? 'open' : ''}>
        <summary>Parsed artifact state</summary>
        <div class="tx-kv"><span>Input</span><strong>${escapeHtml(label)}</strong></div>
        <div class="tx-kv"><span>Current schema</span><strong>${escapeHtml(artifact.envelope.current.schema.id || 'missing')}</strong></div>
        <div class="tx-kv"><span>Envelope schema</span><strong>${escapeHtml(artifact.envelope.envelopeSchema.id || 'missing')}</strong></div>
        <div class="tx-kv"><span>Created at</span><strong>${escapeHtml(artifact.envelope.current.createdAt || 'missing')}</strong></div>
        <div class="tx-kv"><span>Parent schema</span><strong>${escapeHtml(artifact.envelope.parent.schema.id || 'none declared')}</strong></div>
        <div class="tx-kv"><span>Body sections</span><strong>${escapeHtml(artifact.body.sections.join(', ') || 'none')}</strong></div>
      </details>
      <div class="tx-finding-summary">${Object.entries(summary).map(([key, value]) => badge(`${key}: ${value}`)).join('')}</div>
      <div class="tx-list">${findings.map(renderFinding).join('')}</div>
    `;
  }

  function renderArtifactCard(model, readerMode) {
    const compactBadges = [statusLabel(model), model.kind === 'fallback' ? 'root fallback' : model.kind, compactDate(model.createdAt), compactSource(model.sourceBoundary.kind)];
    const hiddenCount = Math.max(0, model.fields.filter((field) => field[1]).length - 2);
    const visibleFields = readerMode === 'scan' ? model.fields.slice(0, 1) : model.fields.filter((field) => field[1]).slice(0, 3);
    return `
      <article class="tx-artifact-card tx-legacy-artifact-card tx-reader-${escapeHtml(readerMode)} tx-artifact-${escapeHtml(model.kind)}">
        <div class="tx-legacy-card-badges">${compactBadges.map(badge).join('')}${hiddenCount ? badge(`+${hiddenCount}`) : ''}</div>
        <header class="tx-legacy-card-body">
          <h3>${escapeHtml(model.title)}</h3>
          <p>${escapeHtml(model.primary || model.subtitle)}</p>
        </header>
        <div class="tx-legacy-field-strip tx-power-only">${visibleFields.map(([name, value]) => `<div><span>${escapeHtml(name)}</span><strong>${escapeHtml(value || 'not declared')}</strong></div>`).join('')}</div>
        <footer class="tx-artifact-actions tx-legacy-action-row">${model.actions.map(renderArtifactAction).join('')}</footer>
      </article>
    `;
  }

  function statusLabel(model) {
    if (model.status === 'readable') return model.findingSummary.warning ? 'mismatch' : 'byte ok';
    if (model.status === 'degraded') return 'mismatch';
    if (model.status === 'invalid-or-incomplete') return 'open';
    return model.status;
  }

  function compactDate(value) {
    const text = String(value || 'missing');
    const match = text.match(/\d{4}-\d{2}-\d{2}/);
    return match ? match[0] : text;
  }

  function compactSource(kind) {
    if (kind === 'static-fixture') return 'fixture';
    if (kind === 'local-file') return 'local';
    if (kind === 'github-source-backed') return 'source';
    return kind || 'draft';
  }

  function renderArtifactAction(action) {
    const map = {
      collapse: { icon: '⌄', label: 'Collapse', task: 'read', group: 'left', title: 'Collapse / expand card' },
      preview: { icon: '▰', label: 'Preview', task: 'read', group: 'left', title: 'Preview card material' },
      markdown: { icon: 'M↔', label: 'Markdown', group: 'left', scaffold: true, title: 'Markdown/source preview scaffold' },
      github: { icon: '◖', label: 'GitHub', group: 'left', scaffold: true, title: 'GitHub source link scaffold' },
      share: { icon: '↗', label: 'Share', group: 'middle', scaffold: true, title: 'Share scaffold' },
      edit: { icon: '✎', label: 'Edit', group: 'middle', scaffold: true, title: 'Edit scaffold' },
      continue: { icon: '⛓', label: 'Continue', task: 'act', group: 'right', scaffold: true, labeled: true, title: 'Continue/create child scaffold' },
      reference: { icon: '🔗', label: 'Reference', task: 'act', group: 'right', scaffold: true, labeled: true, title: 'Reference scaffold' },
      open: { icon: '▰', label: 'Open', task: 'read', group: 'right', labeled: true, title: 'Open workspace/detail' },
      merge: { icon: '⛓', label: 'Merge', task: 'act', group: 'right', scaffold: true, labeled: true, title: 'Merge scaffold' }
    };
    const cfg = map[action] || { icon: '⋯', label: action, group: 'middle', scaffold: true, title: action };
    const attrs = cfg.task ? ` data-task="${escapeHtml(cfg.task)}"` : ' aria-disabled="true"';
    const classes = ['tx-action-chip', 'tx-legacy-action', `tx-action-${cfg.group || 'middle'}`, cfg.scaffold ? 'tx-scaffold-action' : '', cfg.labeled ? 'tx-labeled-action' : ''].filter(Boolean).join(' ');
    return `<button class="${classes}" type="button" title="${escapeHtml(cfg.title)}"${attrs}><span>${escapeHtml(cfg.icon)}</span><strong>${escapeHtml(cfg.label)}</strong></button>`;
  }

  function getVisibleProjections() {
    const query = state.searchQuery.trim().toLowerCase();
    return state.workspace.records
      .map(viewModelFromRecord)
      .filter((projection) => state.sourceFilter === 'all' || projection.sourceBoundary.kind === state.sourceFilter)
      .filter((projection) => {
        if (!query) return true;
        const model = projection.viewModel;
        const haystack = [model.title, model.subtitle, model.schemaId, model.parentLabel, model.sourceBoundary.label, model.sections.join(' '), projection.record.label].join(' ').toLowerCase();
        return haystack.includes(query);
      });
  }


  function buildSampleProjection(sample, label, sourceLabel) {
    return viewModelFromRecord({
      markdown: demoArtifacts[sample],
      label: label || `${sample} fixture`,
      source: Object.assign({}, sourceForSample(sample), { label: sourceLabel || sourceForSample(sample).label })
    });
  }

  function getColumnPaneProjections(paneId) {
    if (paneId === 'site') return getVisibleProjections();
    const docs = [
      buildSampleProjection('topic', 'docs topic fixture', 'Docs fixture'),
      buildSampleProjection('evidence', 'docs evidence fixture', 'Docs fixture'),
      buildSampleProjection('unknown', 'docs unknown fixture', 'Docs fixture')
    ];
    const query = state.searchQuery.trim().toLowerCase();
    return docs
      .filter((projection) => state.sourceFilter === 'all' || projection.sourceBoundary.kind === state.sourceFilter)
      .filter((projection) => {
        if (!query) return true;
        const model = projection.viewModel;
        const haystack = [model.title, model.subtitle, model.schemaId, model.parentLabel, model.sourceBoundary.label, model.sections.join(' '), projection.record.label].join(' ').toLowerCase();
        return haystack.includes(query);
      });
  }

  function renderUniverseColumn(pane) {
    const projections = getColumnPaneProjections(pane.id);
    const mode = state.columnModes[pane.id] || 'feed';
    const body = mode === 'tree' ? renderTreeVerse(projections) : renderFeedVerse(projections);
    const isSite = pane.id === 'site';
    const auditBlock = isSite ? `
      <section class="tx-audit-surface tx-column-audit tx-legacy-inline-status" aria-label="Audit report surface">
        <div class="tx-stage-subhead">
          <div><strong>Audit</strong><div class="tx-muted">loaded · open stays open</div></div>
          <button class="tx-icon-button" data-run-audit type="button" title="Run loaded workspace audit"><span>✓</span><small>Audit</small></button>
        </div>
        <div id="audit-report" class="tx-result tx-muted">Not run · loaded set only</div>
      </section>` : '';
    const parserBlock = isSite ? `<details class="tx-column-drawer tx-legacy-drawer"><summary>Load / draft</summary>${renderQuickControls()}${renderParserControls()}</details>` : '';
    return `
      <section class="tx-universe-column tx-legacy-workspace-pane ${pane.active ? 'tx-active-column' : ''}" aria-label="${escapeHtml(pane.title)} workspace pane">
        <header class="tx-column-header tx-legacy-pane-header">
          <div>
            <strong>${escapeHtml(pane.title)}</strong>
            <div class="tx-muted">${escapeHtml(pane.subtitle)}</div>
          </div>
          <div class="tx-window-stats tx-badges">${badge(`${projections.length}`)}${badge(pane.source)}<button class="tx-icon-button" type="button" title="Pin workspace"><span>◆</span><small>Pin</small></button><button class="tx-icon-button" type="button" title="Close workspace"><span>×</span><small>Close</small></button></div>
        </header>
        <div class="tx-column-tabs tx-legacy-source-tabs">
          <button class="tx-chip" type="button">${escapeHtml(pane.repo)}</button>
          <button class="tx-chip" type="button">${escapeHtml(pane.mode)}</button>
          <span class="tx-chip tx-badge-soft">${escapeHtml(pane.boundary)}</span>
        </div>
        <div class="tx-column-mode tx-legacy-mode-row">
          <div class="tx-mode-name">${mode === 'tree' ? 'LINEAGE MODE' : 'DISCOVERY MODE'}</div>
          <div class="tx-segment" aria-label="${escapeHtml(pane.title)} workspace verse">
            <button class="tx-button" data-pane="${escapeHtml(pane.id)}" data-pane-verse="feed" type="button">Feed</button>
            <button class="tx-button" data-pane="${escapeHtml(pane.id)}" data-pane-verse="tree" type="button">Tree</button>
          </div>
        </div>
        <div class="tx-column-feed tx-legacy-card-feed">${body}</div>
        ${auditBlock}
        ${parserBlock}
      </section>`;
  }

  function renderUniverse() {
    const panes = [
      { id: 'site', title: 'Tiinex/site', subtitle: 'local parser workspace', repo: 'Tiinex/site', mode: 'mirror', boundary: 'no local→github guess', source: 'local/static', active: true },
      { id: 'docs', title: 'Documentation', subtitle: 'docs fixture workspace', repo: 'Tiinex/docs', mode: 'cache', boundary: 'fixture source only', source: 'static-fixture', active: false }
    ];
    const activePane = panes.find((pane) => pane.id === state.activePane) || panes[0];
    return `
      <section class="tx-universe tx-primary-stage tx-focused-universe" aria-label="Universe entry verse">
        <div class="tx-focus-switcher" aria-label="Workspace switcher">
          ${panes.map((pane) => `<button class="tx-chip ${pane.id === activePane.id ? 'tx-primary' : ''}" type="button" title="${escapeHtml(pane.subtitle)}">${escapeHtml(pane.title)}</button>`).join('')}
          <span class="tx-muted">Column Verse · focused pane · first multiverse</span>
        </div>
        <div class="tx-universe-grid tx-focused-grid">
          ${renderUniverseColumn(activePane)}
        </div>
      </section>`;
  }

  function renderVerseParity() {
    const target = document.getElementById('verse-surface');
    if (!target) return;
    const title = document.getElementById('verse-title');
    if (title) title.textContent = state.verse === 'tree' ? 'Tree' : 'Feed';
    const projections = getVisibleProjections();
    target.innerHTML = state.verse === 'tree' ? renderTreeVerse(projections) : renderFeedVerse(projections);
  }

  function renderFeedVerse(projections) {
    const cards = projections.map((projection) => renderArtifactCard(projection.viewModel, state.reader)).join('');
    return `
      <div class="tx-reader-state tx-compact-state tx-legacy-feed-state">${badge('feed')}${badge(`${projections.length} shown`)}${state.searchQuery ? badge(`search`) : ''}${state.sourceFilter !== 'all' ? badge(state.sourceFilter) : ''}</div>
      <div class="tx-verse-stack tx-legacy-stack">${cards || '<p class="tx-empty">No matching artifacts.</p>'}</div>
    `;
  }

  function renderTreeVerse(projections) {
    const rows = projections.map((projection) => {
      const model = projection.viewModel;
      return `<article class="tx-artifact-card tx-legacy-artifact-card tx-tree-artifact"><div class="tx-legacy-card-badges">${badge(model.status)}${badge(model.kind)}${badge(compactDate(model.createdAt))}${badge(model.sourceBoundary.kind)}</div><header class="tx-legacy-card-body"><h3>${escapeHtml(model.title)}</h3><p>${escapeHtml(model.parentLabel)} → ${escapeHtml(model.schemaId)}</p></header><footer class="tx-artifact-actions tx-legacy-action-row"><button class="tx-action-chip tx-legacy-action tx-action-left" data-task="read" type="button" title="Open detail"><span>▰</span><strong>Detail</strong></button><button class="tx-action-chip tx-legacy-action tx-action-left" data-task="trace" type="button" title="Open lineage"><span>⛓</span><strong>Lineage</strong></button><button class="tx-action-chip tx-legacy-action tx-labeled-action tx-action-right" data-task="read" type="button" title="Open workspace"><span>▰</span><strong>Open</strong></button><button class="tx-action-chip tx-legacy-action tx-labeled-action tx-action-right tx-scaffold-action" data-task="act" type="button" title="Merge scaffold"><span>⛓</span><strong>Merge</strong></button></footer></article>`;
    }).join('');
    return `
      <div class="tx-reader-state tx-compact-state tx-legacy-feed-state">${badge('tree')}${badge(`${projections.length} shown`)}${badge('declared edges')}</div>
      <div class="tx-verse-stack tx-legacy-stack">${rows || '<p class="tx-empty">No matching artifacts.</p>'}</div>
    `;
  }

  function renderVerseConcept() {
    const verseRows = verses.map((verse) => row(verse.label, verse.purpose, [verse.context, verse.kind])).join('');
    const plannedRows = plannedVerseContexts.map((verse) => row(verse.label, verse.purpose, [verse.context, 'planned'])).join('');
    return `<details open><summary>Verse contract</summary><p class="tx-muted"><strong>Universe:</strong> root entry. <strong>Column:</strong> implemented universe-level Multiverse. <strong>Feed/Tree:</strong> implemented workspace-level views inside Column. Map/Atlas/Desktop/Gallery stay planned until Column happy path is stable and tested.</p><div class="tx-list">${verseRows}</div></details><details class="tx-secondary-details"><summary>Planned contexts</summary><div class="tx-list">${plannedRows}</div></details>`;
  }

  function summarizeFindings(findings) {
    return findings.reduce((acc, item) => { acc[item.severity] = (acc[item.severity] || 0) + 1; return acc; }, { error: 0, warning: 0, info: 0, preserve: 0 });
  }

  function renderShell() {
    const schemaRows = schemaModules.map((schema) => row(schema.label, schema.summary, [schema.kind, schema.id])).join('');
    const surfaceRows = surfaces.map((surface) => row(surface.label, surface.purpose, [surface.kind])).join('');
    const readerRows = readers.map(([name, purpose]) => row(titleCase(name), purpose, ['reader'])).join('');
    const auditPlan = [
      'Audit remains a domain operation in src/audit/.',
      'This v100 pass keeps Column as the only runtime verse and restores old Tiinex.dev height behavior so the focused window stretches vertically before adding feature breadth.',
      'Validation still runs on artifact load; audit rechecks loaded records and marks missing lineage as open.',
      'Root fallback cards disclose degraded state instead of claiming child-schema validity.',
      'Legacy lesson kept: old UI is pattern baseline; adapters are source/transport boundaries, renderers are UI/library choices, and Column happy path must be stable before sibling verses are built.'
    ].join('\n');

    return `
      <main class="tx-shell tx-shell-workspace tx-shell-universe tx-shell-visual-continuity tx-shell-focused-window tx-shell-pattern-parity tx-shell-legibility-corrected tx-shell-column-action-parity tx-shell-lineage-discovery-parity tx-shell-height-continuity">
        <header class="tx-global-dock tx-legacy-global-dock" aria-label="Global Tiinex controls">
          <button class="tx-round-nav" type="button" title="Previous workspace">‹</button>
          <nav class="tx-toolbar tx-dock-actions tx-legacy-top-actions">
            <button class="tx-button tx-icon-plus" type="button" title="Create">+</button>
            <img class="tx-logo tx-logo-center" src="./public/assets/tiinex-logo-white-transparent.png" alt="Tiinex">
            <button class="tx-button" type="button" title="Share">↗</button>
            <button class="tx-button" type="button" title="Help">?</button>
          </nav>
          <button class="tx-round-nav" type="button" title="Next workspace">›</button>
        </header>

        <section class="tx-workspace-window tx-universe-window tx-legacy-main-window tx-focused-main-window" aria-label="Tiinex Universe">
          <div class="tx-window-titlebar tx-legacy-titlebar">
            <div class="tx-window-title"><strong>Tiinex</strong><span class="tx-badge tx-badge-soft">v100 height continuity</span></div>
            <div class="tx-window-stats tx-badges">
              ${badge('file-local')}${badge('column')}${badge('source kept')}
              <button class="tx-icon-button" type="button" title="Display"><span>☷</span><small>Display</small></button>
              <button class="tx-icon-button" data-run-audit type="button" title="Audit"><span>✓</span><small>Audit</small></button>
              <button class="tx-icon-button" type="button" title="Expand"><span>↗</span><small>Expand</small></button>
              <button class="tx-icon-button" type="button" title="Close"><span>×</span><small>Close</small></button>
            </div>
          </div>

          <div class="tx-source-strip tx-legacy-source-strip" aria-label="Source row">
            <div class="tx-source-primary"><span class="tx-source-dot"></span><button class="tx-chip" type="button">Tiinex/site</button><button class="tx-chip" type="button">mirror</button><span class="tx-muted">mirror</span></div>
            <div class="tx-source-tools">${renderDiscoveryIconBar()}</div>
          </div>

          <div class="tx-mode-strip tx-legacy-main-mode" aria-label="Mode controls">
            <div id="main-mode-name" class="tx-mode-name">DISCOVERY MODE</div>
            <div class="tx-segment" aria-label="Workspace verse">
              <button class="tx-button" data-pane="site" data-pane-verse="feed" type="button">Feed</button>
              <button class="tx-button" data-pane="site" data-pane-verse="tree" type="button">Tree</button>
            </div>
            <div class="tx-segment" aria-label="Reader density"><button class="tx-button" data-reader="scan" type="button">Scan</button><button class="tx-button" data-reader="power" type="button">Power</button><button class="tx-button" data-reader="audit" type="button">Audit</button></div>
            <input id="workspace-search" class="tx-search-input" type="search" placeholder="Search title/schema/source…" aria-label="Search loaded artifacts">
          </div>

          <div id="universe-root">${renderUniverse()}</div>
        </section>

        <details class="tx-legacy-secondary-drawer" aria-label="Secondary diagnostics">
          <summary>Diagnostics / concepts</summary>
          <section class="tx-after-universe tx-secondary-basement" aria-label="Secondary controls and grounding">
            <article class="tx-card tx-compact-card"><h2>Workspace state</h2><div id="workspace-state" class="tx-result tx-muted">Workspace state will render after artifact load.</div></article>
            <article class="tx-card tx-compact-card"><h2>Source filters</h2>${renderDiscoveryControls()}</article>
            <article class="tx-card tx-compact-card tx-inspector-card"><h2>Artifact inspector</h2><div id="artifact-result" class="tx-result tx-muted">Select or load artifact.</div></article>
            <article class="tx-card"><h2>Verse concept</h2>${renderVerseConcept()}</article>
            <article class="tx-card"><h2>Schema module projection</h2><div class="tx-list">${schemaRows}</div></article>
            <article class="tx-card tx-collapsible-card"><details><summary>Presentation surfaces</summary><div class="tx-list">${surfaceRows}</div></details></article>
            <article class="tx-card tx-collapsible-card"><details><summary>Reader modes</summary><div class="tx-list">${readerRows}</div></details></article>
            <article class="tx-card"><h2>Audit ownership</h2><pre>${escapeHtml(auditPlan)}</pre></article>
            <article class="tx-card tx-warning"><h2>Boundary</h2><p class="tx-muted">The v79 app is archived in <code>.old/</code> for UX and behavior reference. It is ignored by git and not imported by this runtime.</p></article>
          </section>
        </details>
        <footer class="tx-footer">Powered by <strong>Tiinex</strong></footer>
      </main>`;
  }

  function renderLegacyTopCounters() {
    return `<div class="tx-legacy-counter-bar" aria-label="Workspace counters">${legacyTopCounters.map((item) => `<span class="tx-counter-pill" title="${escapeHtml(item.title)}"><i>${escapeHtml(item.icon)}</i><strong>${escapeHtml(item.value)}</strong></span>`).join('')}</div>`;
  }

  function renderActionSpine() {
    const task = taskSpine.find((item) => item.id === state.activeTask) || taskSpine[1];
    const buttons = taskSpine.map((item) => `
      <button class="tx-spine-button ${item.scaffold ? 'tx-spine-scaffold' : ''}" data-task="${escapeHtml(item.id)}" type="button" title="${escapeHtml(item.title)}" ${item.scaffold ? 'aria-disabled="true"' : ''}>
        <span>${escapeHtml(item.icon)}</span><strong>${escapeHtml(item.label)}</strong>
      </button>`).join('');
    return `
      <div class="tx-action-spine" aria-label="Current workflow spine">
        <div class="tx-spine-track">${buttons}</div>
        <div class="tx-spine-current"><span class="tx-mini-label">Now</span><strong id="current-task-label">${escapeHtml(task.label)}</strong><span id="current-task-status">${escapeHtml(taskStatus[task.id] || '')}</span></div>
      </div>`;
  }

  function renderQuickControls() {
    return `
      <div class="tx-toolbar tx-toolbar-local tx-sample-row">
        <button class="tx-button" data-sample="documentation" title="Documentation fixture">Documentation</button>
        <button class="tx-button" data-sample="start" title="Start fixture">Start</button>
        <button class="tx-button" data-sample="topic" title="Topic fixture">Topic</button>
        <button class="tx-button" data-sample="evidence" title="Evidence fixture">Evidence</button>
        <button class="tx-button" data-sample="unknown" title="Unknown schema fixture">Unknown</button>
      </div>
      <label class="tx-file tx-file-compact"><span>Load</span><input id="artifact-file" type="file" accept=".md,.markdown,text/markdown,text/plain"></label>
    `;
  }

  function renderSourceFilterControls() {
    return `<div class="tx-source-filter" aria-label="Source filter">${sourceFilters.map((filter) => `<button class="tx-icon-chip" type="button" data-source-filter="${escapeHtml(filter.id)}" title="${escapeHtml(filter.title)}">${escapeHtml(filter.label)}</button>`).join('')}</div>`;
  }

  function renderDiscoveryIconBar() {
    return `<div class="tx-iconbar" aria-label="Discovery actions">${discoveryActions.map((action) => `<button class="tx-icon-button" type="button" ${action.id === 'audit' ? 'data-run-audit' : ''} title="${escapeHtml(action.title)}"><span>${escapeHtml(action.icon)}</span><small>${escapeHtml(action.label)}</small></button>`).join('')}</div>`;
  }

  function renderDiscoveryControls() {
    return `
      <div class="tx-quick-panel" aria-label="Discovery controls">
        <div class="tx-mini-label">Filter</div>
        ${renderSourceFilterControls()}
      </div>
    `;
  }

  function renderParserControls() {
    return `
      <details>
        <summary>Draft / pasted artifact input</summary>
        <textarea id="artifact-input" spellcheck="false"></textarea>
        <button id="parse-artifact" class="tx-button tx-primary">Parse artifact</button>
      </details>
    `;
  }

  function titleCase(value) { return value.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' '); }
  function badge(text) { return `<span class="tx-badge">${escapeHtml(text)}</span>`; }
  function row(title, detail, badges = []) { return `<div class="tx-row"><div><strong>${escapeHtml(title)}</strong><div class="tx-muted">${escapeHtml(detail)}</div></div><div class="tx-badges">${badges.map(badge).join('')}</div></div>`; }
  function renderFinding(item) { return `<div class="tx-row tx-finding tx-${escapeHtml(item.severity)}"><div><strong>${escapeHtml(item.code)}</strong><div class="tx-muted">${escapeHtml(item.message)}</div></div><div class="tx-badges">${badge(item.severity)}${badge(item.source)}</div></div>`; }
  function finding(severity, code, message, source) { return { severity, code, message, source }; }
  function normalizeLineEndings(value) { return String(value || '').replace(/\r\n?/g, '\n'); }
  function findFirstHorizontalRule(text) { const match = /^---\s*$/m.exec(text); return match ? match.index : -1; }
  function extractSchemaLine(text, pattern) { const raw = text.match(pattern)?.[1]?.trim() || ''; return { raw, id: markdownLabel(raw) || raw }; }
  function extractPlainLine(text, pattern) { return stripMarkdown(text.match(pattern)?.[1]?.trim() || ''); }
  function blockAfterTopLevelList(text, label) {
    const lines = text.split('\n');
    const start = lines.findIndex((line) => line.trim() === `- ${label}`);
    if (start === -1) return '';
    const out = [];
    for (let i = start + 1; i < lines.length; i += 1) { if (/^-\s+\S/.test(lines[i])) break; out.push(lines[i]); }
    return out.join('\n');
  }
  function extractSectionText(bodyText, section) {
    if (!section) return '';
    const lines = String(bodyText || '').split('\n');
    const start = lines.findIndex((line) => line.trim() === `## ${section}`);
    if (start === -1) return '';
    const out = [];
    for (let i = start + 1; i < lines.length; i += 1) {
      if (/^#{1,2}\s+/.test(lines[i])) break;
      out.push(lines[i]);
    }
    return out.join('\n').trim();
  }
  function extractListField(sectionText = '', field) {
    const escaped = field.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return stripMarkdown(new RegExp(`^-\\s*${escaped}:\\s*(.+)$`, 'm').exec(sectionText)?.[1]?.trim() || '');
  }
  function summarizeText(value = '', limit = 160) {
    const text = stripMarkdown(String(value).replace(/^#+\s+.*$/gm, '').replace(/^-\s*/gm, '').replace(/\s+/g, ' ').trim());
    return text.length > limit ? `${text.slice(0, limit - 1).trim()}…` : text;
  }
  function formatFindingSummary(summary) { return `E${summary.error || 0} W${summary.warning || 0} I${summary.info || 0} P${summary.preserve || 0}`; }
  function markdownLabel(value) { return value.match(/^\[([^\]]+)\]/)?.[1]?.trim() || ''; }
  function stripMarkdown(value) { return String(value || '').replace(/^\[([^\]]+)\]\([^)]*\)$/, '$1').trim(); }
  function escapeHtml(value) { return String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
})();
