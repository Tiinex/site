import { parseArtifactMarkdown } from './artifact.parse.js';
import { schemaBadgeClass, schemaKey } from '../schemas/root.classify.js';
import { createRootFallbackModel } from '../schemas/root.fallback.js';

export function createRecordFromMarkdown(markdown = '', meta = {}) {
  const parsed = parseArtifactMarkdown(markdown || '');
  const envelope = parsed.envelope || {};
  const current = envelope.current || {};
  const parent = envelope.parent || {};
  const schemaId = current.schema?.id || '';
  const resolvedKind = schemaId || (parsed.hasContinuityContext ? 'tiinex.root.v1' : 'markdown');
  const fallbackModel = createRootFallbackModel(parsed, meta.schemaResolution || { status: schemaId ? 'declared' : 'unknown', fallbackUsed: !schemaId }, meta.findings || []);
  return {
    title: parsed.title || meta.name || 'Untitled artifact',
    summary: current.summary || parsed.body?.sections?.slice(0, 3).join(' · ') || meta.path || 'Local Markdown artifact.',
    kind: resolvedKind,
    schemaId: schemaId || '',
    envelopeSchemaId: envelope.envelopeSchema?.id || '',
    schemaKey: schemaKey(schemaId),
    schemaBadgeClass: schemaBadgeClass(schemaId),
    status: parsed.hasIntegrity ? 'byte ok' : 'local',
    currentCreatedAt: current.createdAt || '',
    path: meta.path || meta.name || '',
    markdown,
    sourceMode: meta.sourceMode || 'local-manual',
    hasContinuityContext: parsed.hasContinuityContext,
    hasIntegrity: parsed.hasIntegrity,
    parentSchemaId: parent.schema?.id || '',
    parentCreatedAt: parent.createdAt || '',
    trace: parent.trace || '',
    origin: parent.origin || envelope.origin || '',
    boundary: parent.boundary || envelope.boundary || '',
    repairsDeclared: Boolean(envelope.repairsDeclared),
    rootReadable: fallbackModel.rootReadable,
    rootDisclosure: fallbackModel.disclosure,
    rootFallback: fallbackModel
  };
}
