import { packageFileBytes } from './package.bytes.js';
import { EXPORT_PACKAGE_FILE_MAP_PATH } from './package.fileMap.js';

export const EXPORT_PACKAGE_INDEX_SCHEMA_ID = 'tiinex.export.package.index.v2';

export const EXPORT_PACKAGE_CONTROL_ROLES = Object.freeze([
  Object.freeze({ role: 'index', path: 'tiinex.package/index.json', kind: 'package-index', indexField: '' }),
  Object.freeze({ role: 'manifest', path: 'tiinex.package/manifest.json', kind: 'package-manifest', indexField: 'manifestPath' }),
  Object.freeze({ role: 'receipt', path: 'tiinex.package/receipt.json', kind: 'package-receipt', indexField: 'receiptPath' }),
  Object.freeze({ role: 'buildReceipt', path: 'tiinex.package/build-receipt.json', kind: 'package-build-receipt', indexField: 'buildReceiptPath' }),
  Object.freeze({ role: 'contract', path: 'tiinex.package/contract.json', kind: 'package-contract', indexField: 'contractPath' }),
  Object.freeze({ role: 'findings', path: 'tiinex.package/findings.json', kind: 'package-findings', indexField: 'findingsPath' }),
  Object.freeze({ role: 'fileMap', path: EXPORT_PACKAGE_FILE_MAP_PATH, kind: 'package-file-map', indexField: 'fileMapPath' })
]);

export const EXPORT_PACKAGE_CONTROL_PATHS = Object.freeze(Object.fromEntries(
  EXPORT_PACKAGE_CONTROL_ROLES.map((entry) => [entry.role, entry.path])
));

export function buildExportPackageControlIndex(input = {}) {
  const index = {
    schema: EXPORT_PACKAGE_INDEX_SCHEMA_ID,
    packageId: String(input.packageId || ''),
    status: String(input.status || 'unknown'),
    boundary: String(input.boundary || 'Package index points to exact control documents, durable file-map authority, and bounded material. It does not create semantic ownership.'),
    entries: Array.isArray(input.entries) ? input.entries : []
  };
  for (const entry of EXPORT_PACKAGE_CONTROL_ROLES) {
    if (entry.indexField) index[entry.indexField] = entry.path;
  }
  return Object.freeze(index);
}

export function exportPackageControlKindForPath(path = '') {
  return EXPORT_PACKAGE_CONTROL_ROLES.find((entry) => entry.path === String(path || ''))?.kind || '';
}

export function inspectExportPackageControlTopology(files = []) {
  const findings = [];
  const controls = {};
  for (const entry of EXPORT_PACKAGE_CONTROL_ROLES) {
    const file = files.find((candidate) => candidate?.path === entry.path);
    if (!file) {
      findings.push(finding('error', 'export.package.bundle.control-missing', 'Package bundle is missing required control file.', { role: entry.role, path: entry.path }));
      controls[entry.role] = null;
      continue;
    }
    const parsed = parseJsonFile(file);
    if (!parsed) {
      findings.push(finding('error', 'export.package.bundle.control-unreadable', 'Required package control file is not readable JSON.', { role: entry.role, path: entry.path }));
      controls[entry.role] = null;
      continue;
    }
    controls[entry.role] = parsed;
  }

  const index = controls.index;
  if (index) {
    if (String(index.schema || '') !== EXPORT_PACKAGE_INDEX_SCHEMA_ID) {
      findings.push(finding('error', 'export.package.bundle.index-schema-invalid', 'Package index schema is missing or unsupported.', { expected: EXPORT_PACKAGE_INDEX_SCHEMA_ID, actual: String(index.schema || '') }));
    }
    const pointerRoles = new Map();
    for (const entry of EXPORT_PACKAGE_CONTROL_ROLES) {
      if (!entry.indexField) continue;
      const declared = String(index[entry.indexField] || '').trim();
      if (!declared) {
        findings.push(finding('error', 'export.package.bundle.index-control-pointer-missing', 'Package index is missing a required canonical control pointer.', { role: entry.role, field: entry.indexField, expected: entry.path }));
        continue;
      }
      const priorRole = pointerRoles.get(declared);
      if (priorRole) {
        findings.push(finding('error', 'export.package.bundle.index-control-pointer-duplicate', 'Package index points multiple control roles at the same path.', { role: entry.role, otherRole: priorRole, field: entry.indexField, path: declared }));
      } else {
        pointerRoles.set(declared, entry.role);
      }
      if (declared !== entry.path) {
        findings.push(finding('error', 'export.package.bundle.index-control-pointer-mismatch', 'Package index control pointer differs from the current canonical operational package topology.', { role: entry.role, field: entry.indexField, expected: entry.path, actual: declared }));
      }
    }
  }

  return Object.freeze({
    schema: 'tiinex.export.package.control-topology.inspection.v1',
    status: findings.some((item) => item.severity === 'error') ? 'invalid' : 'valid',
    controls: Object.freeze(controls),
    findings: Object.freeze(findings)
  });
}

function parseJsonFile(file = {}) {
  try { return JSON.parse(new TextDecoder().decode(packageFileBytes(file))); }
  catch { return null; }
}

function finding(severity, code, message, extra = {}) {
  return Object.freeze({ severity, code, message, ...extra });
}
