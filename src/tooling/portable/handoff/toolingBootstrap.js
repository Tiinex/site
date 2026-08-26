import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';

export const PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_PATH = 'tiinex.bootstrap/manifest.json';
export const PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID = 'tiinex.portable.tooling-bootstrap.manifest.v1';

export function inspectPortableToolingBootstrap(bundle = {}) {
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  const byPath = new Map(files.map((file) => [String(file.path || ''), file]));
  const findings = [];
  const manifestFile = byPath.get(PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_PATH);
  const manifest = parseJsonFile(manifestFile);
  if (!manifest) findings.push(finding('error', 'portable.tooling-bootstrap.manifest.missing', 'Portable Tooling bootstrap manifest is missing or unreadable.'));
  else if (String(manifest.schema || '') !== PORTABLE_TOOLING_BOOTSTRAP_MANIFEST_SCHEMA_ID) findings.push(finding('error', 'portable.tooling-bootstrap.manifest.schema', 'Portable Tooling bootstrap manifest schema is unsupported.', { actual: manifest.schema || '' }));

  const delivery = String(manifest?.delivery || '');
  const entrypoint = String(manifest?.entrypoint || '').trim();
  if (manifest && !['embedded', 'persistent'].includes(delivery)) findings.push(finding('error', 'portable.tooling-bootstrap.delivery.unsupported', 'Portable Tooling bootstrap delivery mode is unsupported.', { delivery }));
  if (manifest && !entrypoint) findings.push(finding('error', 'portable.tooling-bootstrap.entrypoint.missing', 'Portable Tooling bootstrap manifest must declare one exact runtime entrypoint.'));
  else if (entrypoint && (!entrypoint.startsWith('runtime/') || entrypoint.includes('..'))) findings.push(finding('error', 'portable.tooling-bootstrap.entrypoint.invalid', 'Portable Tooling bootstrap entrypoint must be one normalized runtime-relative path.', { entrypoint }));
  const declared = new Map();
  for (const entry of manifest?.runtime?.entries || []) {
    const relative = String(entry.path || '');
    const packagePath = `tiinex.bootstrap/${relative}`;
    if (!relative.startsWith('runtime/') || declared.has(packagePath)) {
      findings.push(finding('error', 'portable.tooling-bootstrap.entry.invalid', 'Bootstrap runtime manifest contains an invalid or duplicate runtime entry.', { path: relative }));
      continue;
    }
    declared.set(packagePath, entry);
    if (delivery !== 'embedded') continue;
    const file = byPath.get(packagePath);
    if (!file) {
      findings.push(finding('error', 'portable.tooling-bootstrap.runtime.missing', 'Embedded Tooling bootstrap runtime entry is missing from package bytes.', { path: packagePath }));
      continue;
    }
    const data = packageFileBytes(file);
    if (Number(entry.bytes || 0) !== data.byteLength) findings.push(finding('error', 'portable.tooling-bootstrap.runtime.bytes-mismatch', 'Embedded Tooling bootstrap runtime byte length differs from its manifest.', { path: packagePath }));
    if (String(entry.sha256 || '') !== sha256Hex(data)) findings.push(finding('error', 'portable.tooling-bootstrap.runtime.sha256-mismatch', 'Embedded Tooling bootstrap runtime digest differs from its manifest.', { path: packagePath }));
  }
  const entrypointPackagePath = entrypoint ? `tiinex.bootstrap/${entrypoint}` : '';
  if (entrypointPackagePath && !declared.has(entrypointPackagePath)) findings.push(finding('error', 'portable.tooling-bootstrap.entrypoint.unlisted', 'Portable Tooling bootstrap entrypoint is not present in the exact manifest-declared runtime representation.', { entrypoint }));
  const runtimeFiles = files.filter((file) => String(file.path || '').startsWith('tiinex.bootstrap/runtime/'));
  if (delivery === 'embedded') {
    for (const file of runtimeFiles) if (!declared.has(String(file.path || ''))) findings.push(finding('error', 'portable.tooling-bootstrap.runtime.unlisted', 'A package byte is colocated under the bootstrap runtime prefix but is not granted bootstrap authority by the manifest.', { path: file.path || '' }));
    if (runtimeFiles.length !== declared.size) findings.push(finding('error', 'portable.tooling-bootstrap.runtime.cardinality', 'Embedded Tooling bootstrap runtime cardinality differs from its manifest.', { declared: declared.size, supplied: runtimeFiles.length }));
  } else if (delivery === 'persistent' && runtimeFiles.length) {
    findings.push(finding('error', 'portable.tooling-bootstrap.persistent.embedded-bytes', 'Persistent Tooling bootstrap mode must not silently embed runtime bytes.', { supplied: runtimeFiles.length }));
  }
  const representation = manifest?.runtime?.entries || [];
  const representationSha256 = sha256Text(stableJson(representation));
  if (manifest && String(manifest.runtime?.representationSha256 || '') !== representationSha256) findings.push(finding('error', 'portable.tooling-bootstrap.runtime.representation-mismatch', 'Tooling bootstrap runtime representation digest differs from the declared manifest entries.'));
  return Object.freeze({
    schema: 'tiinex.portable.tooling-bootstrap.inspection.v1',
    status: findings.some((item) => item.severity === 'error') ? 'invalid' : 'valid',
    delivery: delivery || 'unknown',
    manifest,
    entrypoint: entrypoint ? Object.freeze({ path: entrypoint, packagePath: entrypointPackagePath, state: declared.has(entrypointPackagePath) ? 'qualified' : 'unqualified' }) : null,
    counts: Object.freeze({ declaredRuntimeFiles: declared.size, suppliedRuntimeFiles: runtimeFiles.length, findings: findings.length, errors: findings.filter((item) => item.severity === 'error').length }),
    qualification: Object.freeze({ exactManifestMembershipRequired: true, exactEntrypointManifestMembershipRequired: true, filenameOrColocationAuthority: false, ordinaryWorkspaceBytesAreBootstrapAuthority: false }),
    findings: Object.freeze(findings)
  });
}

function parseJsonFile(file) { if (!file) return null; try { return JSON.parse(new TextDecoder().decode(packageFileBytes(file))); } catch { return null; } }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function sha256Text(value = '') { const bytes = new TextEncoder().encode(String(value)); return sha256Hex(bytes); }
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
