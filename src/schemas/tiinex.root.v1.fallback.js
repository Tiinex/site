import { schemaBadgeClass, schemaKey, schemaLabel } from './tiinex.root.v1.classify.js';

export const ROOT_FALLBACK_CONTRACT_ID = 'tiinex.root.fallback.v1';

export function createRootFallbackModel(parsedArtifact = {}, schemaResolution = {}, findings = []) {
  const envelope = parsedArtifact.envelope || {};
  const currentSchemaId = envelope.current?.schema?.id || '';
  const parentSchemaId = envelope.parent?.schema?.id || '';
  const resolutionStatus = schemaResolution.status || (schemaResolution.fallbackUsed ? 'root-fallback' : 'unknown');
  const fallbackUsed = Boolean(schemaResolution.fallbackUsed || resolutionStatus === 'root-fallback');
  const integrity = parsedArtifact.integrity || {};
  const findingCounts = countFindings(findings);
  return {
    schema: ROOT_FALLBACK_CONTRACT_ID,
    title: parsedArtifact.title || envelope.current?.summary || 'Untitled artifact',
    summary: envelope.current?.summary || parsedArtifact.body?.sections?.slice(0, 3).join(' · ') || 'Tiinex artifact readable through root fallback.',
    currentSchemaId: currentSchemaId || 'unknown',
    envelopeSchemaId: envelope.envelopeSchema?.id || 'unknown',
    schemaKey: schemaKey(currentSchemaId),
    schemaLabel: schemaLabel(currentSchemaId),
    badgeClass: schemaBadgeClass(currentSchemaId),
    resolutionStatus,
    fallbackUsed,
    rootReadable: Boolean(parsedArtifact.hasContinuityContext && envelope.current?.schema?.id),
    continuity: {
      hasContinuityContext: Boolean(parsedArtifact.hasContinuityContext),
      hasIntegrity: Boolean(parsedArtifact.hasIntegrity),
      createdAt: envelope.current?.createdAt || '',
      parentSchemaId: parentSchemaId || null,
      trace: envelope.parent?.trace || '',
      origin: envelope.parent?.origin || envelope.origin || '',
      boundary: envelope.parent?.boundary || envelope.boundary || '',
      repairsDeclared: Boolean(envelope.repairsDeclared)
    },
    integrity: {
      methods: integrity.methods || [],
      values: integrity.values || []
    },
    findings,
    findingCounts,
    badges: makeBadges({ currentSchemaId, fallbackUsed, parsedArtifact, findingCounts }),
    disclosure: fallbackUsed ? 'root-fallback' : findingCounts.error ? 'invalid-or-incomplete' : 'readable'
  };
}

export function presentRootFallback(artifactOrModel = {}, context = {}) {
  const model = artifactOrModel.schema === ROOT_FALLBACK_CONTRACT_ID
    ? artifactOrModel
    : createRootFallbackModel(artifactOrModel, context.schemaResolution || {}, context.findings || []);
  return {
    title: model.title,
    summary: model.summary,
    badges: model.badges,
    disclosure: model.disclosure,
    schemaKey: model.schemaKey,
    schemaLabel: model.schemaLabel,
    continuity: model.continuity,
    findings: model.findings
  };
}

function countFindings(findings = []) {
  const counts = { error: 0, warning: 0, info: 0, preserve: 0, total: 0 };
  for (const finding of Array.isArray(findings) ? findings : []) {
    const severity = finding?.severity || 'info';
    if (counts[severity] == null) counts[severity] = 0;
    counts[severity] += 1;
    counts.total += 1;
  }
  return counts;
}

function makeBadges({ currentSchemaId, fallbackUsed, parsedArtifact, findingCounts }) {
  const badges = [];
  badges.push(currentSchemaId || 'unknown schema');
  badges.push(schemaKey(currentSchemaId));
  if (fallbackUsed) badges.push('root fallback');
  if (parsedArtifact?.hasContinuityContext) badges.push('continuity');
  else badges.push('plain markdown');
  if (parsedArtifact?.hasIntegrity) badges.push('integrity');
  if (findingCounts.error) badges.push(`${findingCounts.error} errors`);
  if (findingCounts.warning) badges.push(`${findingCounts.warning} warnings`);
  return badges.filter(Boolean);
}
