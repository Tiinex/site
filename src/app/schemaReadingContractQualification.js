import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';
import { sha256Hex, utf8Bytes } from '../export/package.bytes.js';
import { resolveSchemaModule } from '../schemas/resolver.js';
import { validateArtifact } from '../validation/validateArtifact.js';

export const SCHEMA_READING_CONTRACT_QUALIFICATION_SCHEMA_ID = 'tiinex.site.schema-reading-contract-qualification.v1';

export function qualifySchemaReadingContractMarkdown(markdown = '', requestedSchemaId = '') {
  const text = String(markdown ?? '');
  const requested = String(requestedSchemaId || '').trim();
  const findings = [];
  let parsed = null;
  let parseException = null;
  try { parsed = parseArtifactMarkdown(text); }
  catch (error) { parseException = error; }

  const observedSchemaId = String(parsed?.envelope?.current?.schema?.id || '').trim();
  const resolution = requested ? resolveSchemaModule({ schemaId: requested }) : null;
  const module = resolution?.module || null;
  const exactModule = Boolean(requested && !resolution?.fallbackUsed && String(module?.id || '') === requested);
  const expectedChecksum = exactModule ? String(module?.binding?.checksum?.value || module?.binding?.checksum || '').trim() : '';
  const checksum = text ? sha256Hex(utf8Bytes(text)) : '';
  const checksumExact = Boolean(expectedChecksum && checksum === expectedChecksum);
  const identityExact = Boolean(requested && observedSchemaId === requested);

  let artifactValidation = null;
  if (exactModule && identityExact && checksumExact && !parseException) {
    artifactValidation = validateArtifact({ markdown: text, parsed, resolution });
  }
  const validationState = String(artifactValidation?.validation?.state || '');
  const validationExact = requested === 'tiinex.root.v1'
    ? validationState === 'root-validated'
    : validationState === 'exact-schema-validated';
  const validationErrors = Array.isArray(artifactValidation?.findings)
    ? artifactValidation.findings.filter((finding) => String(finding?.severity || '').toLowerCase() === 'error')
    : [];

  if (!requested) findings.push('Requested schema identifier authority is unavailable.');
  if (!text.trim()) findings.push('Schema reading-contract material is empty.');
  if (parseException) findings.push(`Schema reading-contract material could not be parsed as a Tiinex artifact: ${String(parseException?.message || parseException)}.`);
  if (!identityExact) findings.push(`Schema reading-contract Current Schema must be exactly ${requested || '(unavailable)'}; observed ${observedSchemaId || '(empty)'}.`);
  if (!exactModule) findings.push(`No exact installed schema module authority is available for ${requested || '(unavailable)'}.`);
  if (exactModule && !expectedChecksum) findings.push(`Exact schema source checksum authority is unavailable for ${requested}.`);
  if (exactModule && expectedChecksum && !checksumExact) findings.push(`Schema reading-contract bytes do not match the exact installed source checksum for ${requested}.`);
  if (exactModule && identityExact && checksumExact && !validationExact) findings.push(`Schema reading-contract material did not reach exact supported artifact validation for ${requested}.`);
  if (validationErrors.length) findings.push(`Schema reading-contract material has ${validationErrors.length} error finding(s) under exact supported artifact validation.`);

  const qualified = Boolean(
    requested
    && text.trim()
    && !parseException
    && identityExact
    && exactModule
    && expectedChecksum
    && checksumExact
    && validationExact
    && validationErrors.length === 0
  );

  return Object.freeze({
    schema: SCHEMA_READING_CONTRACT_QUALIFICATION_SCHEMA_ID,
    state: qualified ? 'qualified' : 'unavailable',
    requestedSchemaId: requested,
    observedSchemaId,
    checksum,
    expectedChecksum,
    identityState: identityExact ? 'qualified' : 'unavailable',
    sourceChecksumState: checksumExact ? 'qualified' : 'unavailable',
    validationState: validationExact ? 'qualified' : 'unavailable',
    validationCoverage: String(artifactValidation?.validation?.coverage || ''),
    moduleAuthorityState: exactModule ? 'qualified' : 'unavailable',
    findings: Object.freeze(findings)
  });
}
