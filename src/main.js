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
  - Value: demo-topic-v88-not-authoritative
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
  - Value: demo-evidence-v88-not-authoritative
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
  - Value: demo-unknown-v88-not-authoritative
`
  };

  const schemaIds = new Set(schemaModules.map((schema) => schema.id));
  const moduleById = new Map(schemaModules.map((schema) => [schema.id, schema]));
  const workspace = {
    id: 'local-workspace-v88',
    name: 'Local parser workspace',
    mode: 'file-local',
    records: [],
    activeId: ''
  };
  const state = {
    reader: 'scan',
    verse: 'feed',
    markdown: demoArtifacts.topic,
    label: 'topic demo fixture',
    source: sourceForSample('topic'),
    auditReport: null,
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
    { id: 'feed', label: 'Feed Verse', kind: 'scan', purpose: 'Arrange the current artifact set for quick human scanning without changing source truth.' },
    { id: 'tree', label: 'Tree Verse', kind: 'continuity', purpose: 'Arrange the same artifact set by declared parent/child continuity without claiming missing parents are absent.' },
    { id: 'node-graph', label: 'Node Graph Verse', kind: 'projection', purpose: 'Future graph arrangement over lineage nodes and edges.' }
  ];

  const sourceModes = [
    { id: 'static-fixture', label: 'Static fixture', boundary: 'repo-bundled demo material', github: 'not guessed', write: 'none' },
    { id: 'local-file', label: 'Local file', boundary: 'user-selected browser File object', github: 'not guessed', write: 'none' },
    { id: 'draft', label: 'Draft / pasted', boundary: 'in-memory local draft text', github: 'not guessed', write: 'draft-only' },
    { id: 'github-source-backed', label: 'GitHub source-backed', boundary: 'explicit source descriptor only', github: 'allowed only when declared', write: 'none in v88' }
  ];

  const root = document.getElementById('root');
  if (!root) return;
  root.innerHTML = renderShell();
  bindDemo();
  loadArtifact(state.markdown, state.label, state.source);

  function bindDemo() {
    const textarea = document.getElementById('artifact-input');
    document.querySelectorAll('[data-sample]').forEach((button) => {
      button.addEventListener('click', () => runDemo(button.getAttribute('data-sample')));
    });
    document.querySelectorAll('[data-reader]').forEach((button) => {
      button.addEventListener('click', () => {
        state.reader = button.getAttribute('data-reader') || 'scan';
        syncReaderButtons();
        renderCurrentArtifact();
      });
    });
    document.querySelectorAll('[data-verse]').forEach((button) => {
      button.addEventListener('click', () => {
        state.verse = button.getAttribute('data-verse') || 'feed';
        syncVerseButtons();
        renderVerseParity();
      });
    });
    document.querySelectorAll('[data-run-audit]').forEach((button) => {
      button.addEventListener('click', () => {
        state.auditReport = runWorkspaceAudit();
        renderAuditReport();
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
    document.querySelectorAll('[data-verse]').forEach((button) => {
      button.setAttribute('aria-pressed', String(button.getAttribute('data-verse') === state.verse));
    });
  }

  function loadArtifact(markdown, label, source) {
    state.auditReport = null;
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

  function renderCurrentArtifact() {
    renderArtifactResult(state.markdown, state.label, state.reader, state.source);
    renderWorkspaceState();
    renderVerseParity();
    renderAuditReport();
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
      type: 'tiinex.web.audit.report.v88',
      status,
      startedAt,
      completedAt: new Date().toISOString(),
      selectedWorkspace: state.workspace.id,
      recordsScanned: projections.length,
      loadedBoundaries: 0,
      networkFetches: 0,
      sourceBoundary: 'no hidden source traversal; local/static/draft remain local/static/draft',
      legacyLesson: 'old lineage audit loaded open parent boundaries, then counted OK/mismatch/open/pending; v88 preserves that shape without network fetch yet',
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
        entries.push({ title, status: 'pending', detail: 'Integrity footer present, but byte/c14n verification is not implemented in this v88 skeleton.' });
      }
    }
    return counts.total ? Object.assign(counts, { entries }) : Object.assign(counts, { entries: [] });
  }

  function renderAuditReport() {
    const target = document.getElementById('audit-report');
    if (!target) return;
    const report = state.auditReport;
    if (!report) {
      target.innerHTML = '<p class="tx-muted">Audit has not run yet. Use Audit loaded workspace to traverse the loaded set without hidden source fetches.</p>';
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
          <p class="tx-muted">Load-all skeleton: scans loaded artifacts, marks missing lineage as open, and preserves source boundaries. No network traversal yet.</p>
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
      <p class="tx-muted"><strong>Legacy lesson:</strong> ${escapeHtml(report.legacyLesson)}</p>
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
      actions: ['open detail', 'open lineage', 'run audit', 'source settings', 'copy reference']
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
      base.actions = ['open detail', 'open preservation', 'run audit', 'source settings', 'copy evidence reference'];
    } else if (resolution.fallbackUsed) {
      base.kind = 'fallback';
      base.primary = `Unknown child schema: ${resolution.unresolvedSchemaId}. Root envelope can be read, but child-specific validity is not claimed.`;
      base.fields = [
        ['Fallback owner', 'tiinex.root.v1'],
        ['Skipped', 'child-schema-specific validation'],
        ['Disclosure', 'degraded but readable']
      ];
      base.actions = ['open detail', 'inspect envelope', 'run audit', 'source settings'];
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
    const visibleFields = readerMode === 'scan' ? model.fields.slice(0, 2) : model.fields.filter((field) => field[1]);
    const actionLimit = readerMode === 'scan' ? 2 : model.actions.length;
    return `
      <article class="tx-artifact-card tx-reader-${escapeHtml(readerMode)} tx-artifact-${escapeHtml(model.kind)}">
        <header class="tx-artifact-head">
          <div>
            <div class="tx-eyebrow">${escapeHtml(model.kind)} · ${escapeHtml(model.status)}</div>
            <h3>${escapeHtml(model.title)}</h3>
            <p>${escapeHtml(model.primary || model.subtitle)}</p>
          </div>
          <div class="tx-badges tx-card-badges">${badge(model.schemaId)}${badge(model.schemaKind)}${badge(model.sourceBoundary.kind)}${model.resolution.fallbackUsed ? badge('root fallback') : ''}</div>
        </header>
        <div class="tx-artifact-meta">
          <div><span>Parent</span><strong>${escapeHtml(model.parentLabel)}</strong></div>
          <div><span>Created</span><strong>${escapeHtml(model.createdAt)}</strong></div>
          <div><span>Source</span><strong>${escapeHtml(model.sourceBoundary.label)}</strong></div>
          <div><span>Findings</span><strong>${escapeHtml(formatFindingSummary(model.findingSummary))}</strong></div>
        </div>
        <div class="tx-artifact-fields">${visibleFields.map(([name, value]) => `<div><span>${escapeHtml(name)}</span><p>${escapeHtml(value || 'not declared')}</p></div>`).join('')}</div>
        <div class="tx-power-only tx-artifact-sections"><span>Source boundary</span><p>${escapeHtml(model.sourceBoundary.disclosure)}</p></div>
        <div class="tx-power-only tx-artifact-sections"><span>Sections</span><p>${escapeHtml(model.sections.join(' · ') || 'none')}</p></div>
        <footer class="tx-artifact-actions">${model.actions.slice(0, actionLimit).map((action) => `<button class="tx-chip" type="button">${escapeHtml(action)}</button>`).join('')}</footer>
      </article>
    `;
  }

  function renderVerseParity() {
    const target = document.getElementById('verse-surface');
    if (!target) return;
    const projections = state.workspace.records.map(viewModelFromRecord);
    target.innerHTML = state.verse === 'tree' ? renderTreeVerse(projections) : renderFeedVerse(projections);
  }

  function renderFeedVerse(projections) {
    const cards = projections.map((projection) => renderArtifactCard(projection.viewModel, state.reader)).join('');
    return `
      <div class="tx-reader-state">${badge('verse: feed')}${badge('surface parity')}${badge(`${projections.length} artifact${projections.length === 1 ? '' : 's'}`)}</div>
      <p class="tx-muted">Feed Verse scans the workspace artifact set as cards. It changes arrangement and disclosure, not source truth.</p>
      <div class="tx-verse-stack">${cards || '<p class="tx-muted">No artifacts loaded yet.</p>'}</div>
    `;
  }

  function renderTreeVerse(projections) {
    const rows = projections.map((projection) => {
      const model = projection.viewModel;
      return `<div class="tx-tree-row"><div><strong>${escapeHtml(model.title)}</strong><div class="tx-muted">${escapeHtml(model.parentLabel)} → ${escapeHtml(model.schemaId)}</div></div><div class="tx-badges">${badge(model.status)}${badge(model.sourceBoundary.kind)}</div></div>`;
    }).join('');
    return `
      <div class="tx-reader-state">${badge('verse: tree')}${badge('same artifact set')}${badge('declared edges only')}</div>
      <p class="tx-muted">Tree Verse arranges records by declared continuity. Missing parents remain unknown; they are not treated as absent until audit has more authority.</p>
      <div class="tx-tree">${rows || '<p class="tx-muted">No artifacts loaded yet.</p>'}</div>
    `;
  }

  function renderVerseConcept() {
    const verseRows = verses.map((verse) => row(verse.label, verse.purpose, [verse.kind])).join('');
    return `<p class="tx-muted"><strong>Verse:</strong> a bounded way to express, arrange, or experience one or more Tiinex artifacts without changing their source truth.</p><div class="tx-list">${verseRows}</div>`;
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
      'This v88 pass adds a loaded-workspace audit skeleton after reconstructing the workspace UX.',
      'Validation still runs on artifact load; audit rechecks loaded records and marks missing lineage as open.',
      'Root fallback cards disclose degraded state instead of claiming child-schema validity.',
      'Legacy lesson kept: audit counts OK/mismatch/open/pending and shows loaded boundary progress.'
    ].join('\n');

    return `
      <main class="tx-shell tx-shell-workspace">
        <header class="tx-global-dock" aria-label="Global Tiinex controls">
          <div class="tx-brand"><img class="tx-logo" src="./public/assets/tiinex-logo-white-transparent.png" alt=""><span>Tiinex Site</span></div>
          <nav class="tx-toolbar tx-dock-actions">
            <button class="tx-button" type="button">+ Create</button>
            <button class="tx-button" type="button">Share</button>
            <button class="tx-button" type="button">?</button>
          </nav>
        </header>

        <section class="tx-workspace-window" aria-label="Tiinex workspace">
          <div class="tx-window-titlebar">
            <div class="tx-window-title">
              <strong>Tiinex workspace</strong>
              <span class="tx-badge tx-badge-soft">v88 UX reconstruction</span>
            </div>
            <div class="tx-window-stats tx-badges">
              ${badge('file-local safe')}${badge('workspace frame')}${badge('app.js not loaded')}${badge('source rows kept')}${badge('audit load-all skeleton')}
            </div>
          </div>

          <div class="tx-source-strip" aria-label="Source row">
            <div class="tx-source-primary"><span class="tx-source-dot"></span><strong>Local parser workspace</strong><span class="tx-muted">explicit source boundary · no local→github guess</span></div>
            <div class="tx-badges">${badge('static-fixture')}${badge('draft/local safe')}${badge('cache: none')}</div>
          </div>

          <div class="tx-mode-strip" aria-label="Mode controls">
            <div class="tx-mode-name">DISCOVERY MODE</div>
            <div class="tx-segment" aria-label="Verse projection"><button class="tx-button" data-verse="feed" type="button">Feed</button><button class="tx-button" data-verse="tree" type="button">Tree</button></div>
            <div class="tx-segment" aria-label="Reader density"><button class="tx-button" data-reader="scan" type="button">Scan</button><button class="tx-button" data-reader="power" type="button">Power</button><button class="tx-button" data-reader="audit" type="button">Audit</button></div>
            <button class="tx-button tx-audit-run" data-run-audit type="button">Audit loaded workspace</button>
            <div class="tx-search-pill">Search title/body/schema…</div>
          </div>

          <div class="tx-workspace-body">
            <aside class="tx-rail tx-left-rail" aria-label="Workspace controls">
              <article class="tx-mini-card">
                <h2>Sources</h2>
                ${renderQuickControls()}
              </article>
              <article class="tx-mini-card">
                <h2>Workspace state</h2>
                <div id="workspace-state" class="tx-result tx-muted">Workspace state will render after artifact load.</div>
              </article>
              <article class="tx-mini-card tx-collapsible-card">
                <details>
                  <summary>Source boundary modes</summary>
                  <div class="tx-list">${renderSourceModes()}</div>
                </details>
              </article>
              <article class="tx-mini-card tx-collapsible-card">
                ${renderParserControls()}
              </article>
            </aside>

            <section class="tx-primary-stage" aria-label="Primary artifact verse">
              <div class="tx-stage-header">
                <div>
                  <div class="tx-eyebrow">Workspace verse</div>
                  <h1>Feed / Tree</h1>
                </div>
                <div class="tx-badges">${badge('same artifacts')}${badge('arrangement only')}${badge('source truth preserved')}</div>
              </div>
              <div id="verse-surface" class="tx-result tx-muted">Verse projection will render after artifact load.</div>
              <section class="tx-audit-surface" aria-label="Audit report surface">
                <div class="tx-stage-subhead">
                  <div><strong>Audit load-all skeleton</strong><div class="tx-muted">Loaded workspace audit; missing parent lineage stays open until source traversal exists.</div></div>
                  <button class="tx-button" data-run-audit type="button">Run audit</button>
                </div>
                <div id="audit-report" class="tx-result tx-muted">Audit report will render after artifact load.</div>
              </section>
            </section>

            <aside class="tx-rail tx-inspector" aria-label="Artifact inspector">
              <article class="tx-mini-card tx-inspector-card">
                <h2>Artifact inspector</h2>
                <div id="artifact-result" class="tx-result tx-muted">Choose a sample or load a local Markdown file.</div>
              </article>
            </aside>
          </div>
        </section>

        <section class="tx-secondary-grid" aria-label="Secondary grounding">
          <article class="tx-card"><h2>Verse concept</h2>${renderVerseConcept()}</article>
          <article class="tx-card"><h2>Schema module projection</h2><div class="tx-list">${schemaRows}</div></article>
          <article class="tx-card tx-collapsible-card"><details><summary>Presentation surfaces</summary><div class="tx-list">${surfaceRows}</div></details></article>
          <article class="tx-card tx-collapsible-card"><details><summary>Reader modes</summary><div class="tx-list">${readerRows}</div></details></article>
          <article class="tx-card"><h2>Audit ownership</h2><pre>${escapeHtml(auditPlan)}</pre></article>
          <article class="tx-card tx-warning"><h2>Boundary</h2><p class="tx-muted">The v79 app is archived in <code>.old/</code> for UX and behavior reference. It is ignored by git and not imported by this runtime.</p></article>
        </section>
      </main>`;
  }

  function renderQuickControls() {
    return `
      <div class="tx-toolbar tx-toolbar-local tx-sample-row">
        <button class="tx-button" data-sample="topic">Topic sample</button>
        <button class="tx-button" data-sample="evidence">Evidence sample</button>
        <button class="tx-button" data-sample="unknown">Unknown schema</button>
      </div>
      <label class="tx-file tx-file-compact"><span>Load Markdown</span><input id="artifact-file" type="file" accept=".md,.markdown,text/markdown,text/plain"></label>
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
