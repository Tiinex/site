import { classifyArchiveEntry, safeArchivePath } from '../../../adapters/archive/archive.adapter.js';
import { createRecordFromMarkdown } from '../../../artifacts/artifact.record.js';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { portableFinding } from '../findings.js';

export const PORTABLE_INPUT_SCHEMA_ID = 'tiinex.portable.input.v1';

export function normalizePortableInput(input = {}) {
  const files = collectInputFiles(input);
  const findings = [...(Array.isArray(input.findings) ? input.findings : [])];
  const records = [];
  const assets = [];
  const workspaceEntries = [];
  const seenPaths = new Set();

  for (const [index, file] of files.entries()) {
    const fallbackName = `material-${index + 1}.md`;
    const materialPath = safeArchivePath(file.path || file.name || fallbackName);
    if (!materialPath) {
      findings.push(portableFinding('warning', 'portable.input.path.unsafe', 'Unsafe or empty material path was skipped.', { ref: file.path || file.name || '' }));
      continue;
    }
    noteDuplicatePath(materialPath, seenPaths, findings);
    const content = textContent(file);
    const kind = file.kind || classifyArchiveEntry(materialPath, content || null);
    const descriptor = Object.freeze({
      path: materialPath,
      kind,
      size: Number(file.size || byteLengthOfText(content) || 0),
      type: String(file.type || ''),
      sourceMode: file.sourceMode || input.sourceMode || 'portable-local',
      contentAvailable: Boolean(content)
    });

    if (kind === 'record' || kind === 'workspace') {
      const record = recordFromFile(file, descriptor, content);
      records.push(record);
      if (kind === 'workspace') workspaceEntries.push(workspaceSummary(record));
    } else {
      assets.push(Object.freeze({ ...descriptor, previewState: content ? 'available' : 'metadata-only' }));
    }
  }

  for (const [index, raw] of (Array.isArray(input.records) ? input.records : []).entries()) {
    const record = normalizeExistingRecord(raw || {}, index);
    noteDuplicatePath(record.path, seenPaths, findings);
    records.push(record);
  }
  for (const asset of Array.isArray(input.assets) ? input.assets : []) assets.push(Object.freeze({ ...asset }));

  const containsExplicitSourceMetadata = records.some((record) => record.source?.adapterId && record.source.adapterId !== 'local');
  return Object.freeze({
    schema: PORTABLE_INPUT_SCHEMA_ID,
    boundary: Object.freeze({
      mode: 'supplied-material',
      remoteFetch: false,
      remoteWrite: false,
      inferredGitHubSource: false,
      sourceInterpretation: 'explicit-only',
      containsExplicitSourceMetadata
    }),
    files: Object.freeze(files.map((file, index) => fileSummary(file, index)).filter((file) => file.path)),
    records: Object.freeze(records),
    assets: Object.freeze(assets),
    workspaceEntries: Object.freeze(workspaceEntries),
    findings: Object.freeze(findings)
  });
}

export function findSchemaMaterial(schemaId = '', input = {}) {
  const wanted = String(schemaId || '').trim();
  if (!wanted) return null;
  const exactName = `${wanted}.schema.md`.toLowerCase();
  const candidates = schemaCandidateMaterials(input);
  let match = candidates.find((file) => normalizedPath(file).endsWith(exactName));
  if (!match) {
    match = candidates.find((file) => {
      const materialPath = normalizedPath(file);
      const content = textContent(file);
      if (!materialPath.endsWith('.schema.md') || !content) return false;
      try { return parseArtifactMarkdown(content).envelope?.current?.schema?.id === wanted; }
      catch { return content.includes(wanted); }
    });
  }
  if (!match) return null;
  const materialPath = safeArchivePath(match.path || match.name || exactName);
  return Object.freeze({
    schemaId: wanted,
    path: materialPath,
    markdown: textContent(match),
    role: 'supplied-readable-schema-material',
    authority: 'declared-by-material; verify against current Tiinex/docs'
  });
}

export function suppliedSchemaParentId(schemaId = '', input = {}) {
  const material = findSchemaMaterial(schemaId, input);
  if (!material?.markdown) return '';
  try { return String(parseArtifactMarkdown(material.markdown).envelope?.parent?.schema?.id || '').trim(); }
  catch { return ''; }
}

export function portableInputFiles(input = {}) {
  return collectInputFiles(input);
}

function recordFromFile(file, descriptor, content) {
  const derived = createRecordFromMarkdown(content, {
    path: descriptor.path,
    name: file.name || descriptor.path,
    sourceMode: descriptor.sourceMode,
    lifecycleStatus: file.lifecycleStatus || ''
  });
  return Object.freeze({
    ...derived,
    id: String(file.id || derived.id || descriptor.path),
    source: normalizeSuppliedSource(file.source, descriptor.path),
    portableMaterialKind: descriptor.kind
  });
}

function normalizeExistingRecord(raw = {}, index = 0) {
  const materialPath = safeArchivePath(raw.path || raw.name || `record-${index + 1}.md`) || `record-${index + 1}.md`;
  const content = textContent(raw);
  const derived = content ? createRecordFromMarkdown(content, {
    path: materialPath,
    name: raw.name || materialPath,
    sourceMode: raw.sourceMode || 'portable-local',
    lifecycleStatus: raw.lifecycleStatus || ''
  }) : {};
  return Object.freeze({
    ...derived,
    ...raw,
    id: String(raw.id || derived.id || materialPath),
    path: materialPath,
    markdown: typeof raw.markdown === 'string' ? raw.markdown : (typeof raw.content === 'string' ? raw.content : derived.markdown || ''),
    sourceMode: raw.sourceMode || derived.sourceMode || 'portable-local',
    source: normalizeSuppliedSource(raw.source, materialPath),
    portableMaterialKind: raw.portableMaterialKind || (raw.kind === 'workspace' ? 'workspace' : 'record')
  });
}

function collectInputFiles(input = {}) {
  const files = [];
  if (typeof input.markdown === 'string') files.push({ path: input.path || 'attachment.md', content: input.markdown, sourceMode: input.sourceMode, source: input.source });
  for (const file of Array.isArray(input.files) ? input.files : []) files.push(file || {});
  return files;
}

function schemaCandidateMaterials(input = {}) {
  const files = collectInputFiles(input);
  for (const record of Array.isArray(input.records) ? input.records : []) {
    if (typeof record?.markdown === 'string') files.push({ path: record.path || record.name || '', content: record.markdown, sourceMode: record.sourceMode, source: record.source });
  }
  return files;
}

function normalizeSuppliedSource(source = {}, materialPath = '') {
  if (source?.adapterId && source.adapterId !== 'local') {
    return Object.freeze({
      ...source,
      path: source.path || materialPath,
      boundary: source.boundary || 'Explicitly supplied source metadata; portable tooling did not fetch or infer this provenance.',
      provenanceQualification: source.provenanceQualification || 'explicit-supplied-unverified'
    });
  }
  return Object.freeze({
    kind: source?.kind || 'local-session',
    adapterId: source?.adapterId || 'local',
    path: source?.path || materialPath,
    boundary: source?.boundary || 'Portable local material; no GitHub provenance inferred.'
  });
}

function workspaceSummary(record = {}) {
  return Object.freeze({ path: record.path, title: record.title, schemaId: record.schemaId, sourceMode: record.sourceMode });
}

function fileSummary(file = {}, index = 0) {
  const materialPath = safeArchivePath(file.path || file.name || `material-${index + 1}`);
  const content = textContent(file);
  return Object.freeze({
    path: materialPath,
    size: Number(file.size || byteLengthOfText(content) || 0),
    kind: file.kind || '',
    type: String(file.type || ''),
    contentAvailable: Boolean(content)
  });
}

function noteDuplicatePath(materialPath, seenPaths, findings) {
  if (!materialPath) return;
  if (seenPaths.has(materialPath)) findings.push(portableFinding('warning', 'portable.input.path.duplicate', 'Duplicate material path is present; lineage matching may be ambiguous.', { ref: materialPath }));
  seenPaths.add(materialPath);
}

function normalizedPath(file = {}) {
  return String(safeArchivePath(file.path || file.name || '') || '').toLowerCase();
}

function textContent(file = {}) {
  if (typeof file.content === 'string') return file.content;
  if (typeof file.markdown === 'string') return file.markdown;
  return '';
}

function byteLengthOfText(value = '') {
  if (typeof Buffer !== 'undefined') return Buffer.byteLength(String(value || ''), 'utf8');
  return new TextEncoder().encode(String(value || '')).byteLength;
}
