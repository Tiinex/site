import { parseArtifactMarkdown } from './artifact.parse.js';
import { schemaBadgeClass, schemaKey } from '../schemas/root.classify.js';
import { createRootFallbackModel } from '../schemas/root.fallback.js';
import { inferRecordMaterialRole } from '../workspaces/workspace.materialRole.js';

export function createRecordFromMarkdown(markdown = '', meta = {}) {
  const parsed = parseArtifactMarkdown(markdown || '');
  const title = bestRecordTitle(parsed, meta);
  const envelope = parsed.envelope || {};
  const current = envelope.current || {};
  const parent = envelope.parent || {};
  const schemaId = current.schema?.id || '';
  const resolvedKind = schemaId || (parsed.hasContinuityContext ? 'tiinex.root.v1' : 'markdown');
  const fallbackModel = createRootFallbackModel(parsed, meta.schemaResolution || { status: schemaId ? 'declared' : 'unknown', fallbackUsed: !schemaId }, meta.findings || []);
  return {
    title,
    summary: current.summary || parsed.body?.sections?.slice(0, 3).join(' · ') || meta.path || 'Local Markdown artifact.',
    kind: resolvedKind,
    schemaId: schemaId || '',
    envelopeSchemaId: envelope.envelopeSchema?.id || '',
    schemaKey: schemaKey(schemaId),
    schemaBadgeClass: schemaBadgeClass(schemaId),
    status: parsed.hasIntegrity ? 'schema ok' : 'local',
    lifecycleStatus: current.status || meta.lifecycleStatus || '',
    currentCreatedAt: current.createdAt || '',
    path: meta.path || meta.name || '',
    markdown,
    sourceMode: meta.sourceMode || 'local-manual',
    hasContinuityContext: parsed.hasContinuityContext,
    hasIntegrity: parsed.hasIntegrity,
    parentSchemaId: parent.schema?.id || '',
    parentCreatedAt: parent.createdAt || '',
    trace: parent.trace || '',
    traceLabel: parent.traceLabel || '',
    origin: parent.origin || envelope.origin || '',
    boundary: parent.boundary || envelope.boundary || '',
    repairsDeclared: Boolean(envelope.repairsDeclared),
    rootReadable: fallbackModel.rootReadable,
    rootDisclosure: fallbackModel.disclosure,
    rootFallback: fallbackModel,
    materialRole: inferRecordMaterialRole({
      path: meta.path || meta.name || '',
      kind: resolvedKind,
      schemaId: schemaId || '',
      envelopeSchemaId: envelope.envelopeSchema?.id || '',
      hasContinuityContext: parsed.hasContinuityContext,
      hasIntegrity: parsed.hasIntegrity,
      parentSchemaId: parent.schema?.id || '',
      trace: parent.trace || '',
      origin: parent.origin || envelope.origin || '',
      markdown
    })
  };
}

function bestRecordTitle(parsed = {}, meta = {}) {
  const parsedTitle = String(parsed.title || '').trim();
  if (parsedTitle && parsedTitle !== 'Untitled artifact') return parsedTitle;
  const fallback = titleFromPath(meta.path || meta.name || '');
  return fallback || parsedTitle || 'Untitled artifact';
}

function titleFromPath(path = '') {
  const name = String(path || '').split('/').filter(Boolean).pop() || '';
  const withoutKnownSuffix = name
    .replace(/\.trace\.md$/i, '')
    .replace(/\.schema\.md$/i, '')
    .replace(/\.validator\.md$/i, '')
    .replace(/\.workspace\.md$/i, '')
    .replace(/\.(?:md|markdown)$/i, '');
  const cleaned = withoutKnownSuffix
    .replace(/^\d+[-_\s.]*/, '')
    .replace(/[-_.]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!cleaned) return '';
  return cleaned.replace(/\b[a-zåäö]/gi, (m) => m.toUpperCase()).slice(0, 96);
}

