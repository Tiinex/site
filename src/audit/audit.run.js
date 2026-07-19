import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { normalizeArtifact } from '../artifacts/artifact.normalize.js';
import { resolveSchemaModule } from '../schemas/resolver.js';
import { rootValidate, rootFallbackFinding } from '../schemas/root.validate.js';
import { topicValidate } from '../schemas/core/topic/topic.validate.js';
import { preservationValidate } from '../schemas/core/preservation/preservation.validate.js';
import { evidenceValidate } from '../schemas/core/evidence/evidence.validate.js';
import { summarizeFindings } from './audit.summary.js';

const validators = new Map([
  ['tiinex.root.v1', rootValidate],
  ['tiinex.topic.v1', topicValidate],
  ['tiinex.preservation.v1', preservationValidate],
  ['tiinex.evidence.v1', evidenceValidate]
]);

export function runAudit(scope = {}) {
  const markdown = scope.markdown || '';
  const parsed = parseArtifactMarkdown(markdown);
  const schemaId = parsed.envelope.current.schema.id;
  const resolution = resolveSchemaModule({ schemaId });
  const validator = validators.get(resolution.module.id) || rootValidate;
  const findings = validator(parsed);
  if (resolution.fallbackUsed) findings.push(rootFallbackFinding(schemaId));
  const normalized = normalizeArtifact(parsed, resolution, findings);
  return {
    status: findings.some((finding) => finding.severity === 'error') ? 'invalid-or-incomplete' : resolution.fallbackUsed ? 'degraded' : 'readable',
    parsed,
    resolution,
    artifact: normalized,
    findings,
    summary: summarizeFindings(findings)
  };
}
