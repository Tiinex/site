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
  - Value: demo-topic-v85-not-authoritative
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
  - Value: demo-evidence-v85-not-authoritative
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
  - Value: demo-unknown-v85-not-authoritative
`
  };

  const schemaIds = new Set(schemaModules.map((schema) => schema.id));
  const moduleById = new Map(schemaModules.map((schema) => [schema.id, schema]));
  const workspace = {
    id: 'local-workspace-v85',
    name: 'Local parser workspace',
    mode: 'file-local',
    records: [],
    activeId: ''
  };
  const state = {
    reader: 'scan',
    markdown: demoArtifacts.topic,
    label: 'topic demo fixture',
    source: sourceForSample('topic'),
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

  const sourceModes = [
    { id: 'static-fixture', label: 'Static fixture', boundary: 'repo-bundled demo material', github: 'not guessed', write: 'none' },
    { id: 'local-file', label: 'Local file', boundary: 'user-selected browser File object', github: 'not guessed', write: 'none' },
    { id: 'draft', label: 'Draft / pasted', boundary: 'in-memory local draft text', github: 'not guessed', write: 'draft-only' },
    { id: 'github-source-backed', label: 'GitHub source-backed', boundary: 'explicit source descriptor only', github: 'allowed only when declared', write: 'none in v85' }
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

  function loadArtifact(markdown, label, source) {
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

  function renderArtifactResult(markdown, label, readerMode, source) {
    const artifact = parseArtifactMarkdown(markdown);
    const resolution = resolveSchemaModule(artifact.envelope.current.schema.id);
    const findings = validateArtifact(artifact, resolution);
    const summary = summarizeFindings(findings);
    const status = findings.some((item) => item.severity === 'error') ? 'invalid-or-incomplete' : resolution.fallbackUsed ? 'degraded' : 'readable';
    const sourceBoundary = resolveSourceBoundary(source, artifact);
    const viewModel = buildArtifactViewModel(artifact, resolution, findings, summary, status, sourceBoundary);
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

  function summarizeFindings(findings) {
    return findings.reduce((acc, item) => { acc[item.severity] = (acc[item.severity] || 0) + 1; return acc; }, { error: 0, warning: 0, info: 0, preserve: 0 });
  }

  function renderShell() {
    const schemaRows = schemaModules.map((schema) => row(schema.label, schema.summary, [schema.kind, schema.id])).join('');
    const surfaceRows = surfaces.map((surface) => row(surface.label, surface.purpose, [surface.kind])).join('');
    const readerRows = readers.map(([name, purpose]) => row(titleCase(name), purpose, ['reader'])).join('');
    const auditPlan = [
      'Audit remains a domain operation in src/audit/.',
      'This v85 pass adds workspace state and explicit source-boundary disclosure to parsed artifact cards.',
      'Validation still runs on artifact load; full lineage load-all audit remains v87 scope.',
      'Root fallback cards disclose degraded state instead of claiming child-schema validity.'
    ].join('\n');

    return `
      <main class="tx-shell">
        <header class="tx-topbar">
          <div class="tx-brand"><img class="tx-logo" src="./public/assets/tiinex-logo-white-transparent.png" alt=""><span>Tiinex Site</span></div>
          <nav class="tx-toolbar"><span class="tx-pill">fresh v85 shell</span><span class="tx-pill">file-local safe</span><span class="tx-pill">workspace state</span><span class="tx-pill">source boundaries</span></nav>
        </header>
        <section class="tx-hero">
          <h1>Tiinex Site workspace shell</h1>
          <p class="tx-muted">A file-local runtime scaffold that keeps parsed Tiinex artifacts inside an explicit workspace and preserves source/draft boundaries without guessing GitHub provenance.</p>
          <div class="tx-badges">${badge('app.js not loaded')}${badge('no ES module startup')}${badge('workspace cards')}${badge('source boundaries')}</div>
        </section>
        <section class="tx-grid tx-grid-wide">
          <article class="tx-card"><h2>Artifact parser demo</h2>${renderParserControls()}</article>
          <article class="tx-card"><h2>Artifact card surface</h2><div id="artifact-result" class="tx-result tx-muted">Choose a sample or load a local Markdown file.</div></article>
          <article class="tx-card"><h2>Workspace state</h2><div id="workspace-state" class="tx-result tx-muted">Workspace state will render after artifact load.</div></article>
          <article class="tx-card"><h2>Source boundary modes</h2><div class="tx-list">${renderSourceModes()}</div></article>
          <article class="tx-card"><h2>Schema module projection</h2><div class="tx-list">${schemaRows}</div></article>
          <article class="tx-card"><h2>Presentation surfaces</h2><div class="tx-list">${surfaceRows}</div></article>
          <article class="tx-card"><h2>Reader modes</h2><div class="tx-list">${readerRows}</div></article>
          <article class="tx-card"><h2>Audit ownership</h2><pre>${escapeHtml(auditPlan)}</pre></article>
          <article class="tx-card tx-warning"><h2>Boundary</h2><p class="tx-muted">The v79 app is archived in <code>.old/</code> for UX and behavior reference. It is ignored by git and not imported by this runtime.</p></article>
        </section>
      </main>`;
  }

  function renderParserControls() {
    return `
      <div class="tx-toolbar tx-toolbar-local">
        <button class="tx-button" data-sample="topic">Topic sample</button>
        <button class="tx-button" data-sample="evidence">Evidence sample</button>
        <button class="tx-button" data-sample="unknown">Unknown schema sample</button>
      </div>
      <div class="tx-reader-picker" aria-label="Reader density">
        <span>Reader density</span>
        <button class="tx-button" data-reader="scan" type="button">Scan</button>
        <button class="tx-button" data-reader="power" type="button">Power</button>
        <button class="tx-button" data-reader="audit" type="button">Audit</button>
      </div>
      <label class="tx-file"><span>Load local Markdown</span><input id="artifact-file" type="file" accept=".md,.markdown,text/markdown,text/plain"></label>
      <textarea id="artifact-input" spellcheck="false"></textarea>
      <button id="parse-artifact" class="tx-button tx-primary">Parse artifact</button>
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
