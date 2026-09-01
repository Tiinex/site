import assert from 'node:assert/strict';
import { buildExportPackageBundle, inspectExportPackageBundle } from './package.builder.js';
import { buildExportPackageFileMap, finalizeFile } from './package.fileMap.js';
import { EXPORT_PACKAGE_CONTROL_PATHS } from './package.controlTopology.js';
import { packageFileBytes } from './package.bytes.js';

const markdown = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-08-19T00:00:00.000Z
  - Summary: Control topology
  - Status: draft/local

---

# Control topology

# Continuity Integrity

- Draft Local Integrity
  - Method: browser-local-draft
  - Value: pending-publication-or-export
`;

const bundle = buildExportPackageBundle({
  id: 'w-control-topology',
  title: 'Control topology',
  records: [{ id: 'a', title: 'A', path: 'a.md', markdown, source: { adapterId: 'local' }, sourceMode: 'local-transition' }],
  assets: []
}, { clock: () => '2026-08-19T13:35:00.000Z' });

assert.equal(inspectExportPackageBundle(bundle).status, 'valid');

const requiredPaths = Object.values(EXPORT_PACKAGE_CONTROL_PATHS);
for (const path of requiredPaths) {
  const candidate = path === EXPORT_PACKAGE_CONTROL_PATHS.fileMap
    ? { ...bundle, files: bundle.files.filter((file) => file.path !== path) }
    : removeControlAndRebuildFileMap(bundle, path);
  const inspection = inspectExportPackageBundle(candidate);
  assert.equal(inspection.status, 'invalid', `missing ${path} must fail closed`);
  assert.ok(inspection.findings.some((finding) => finding.code === 'export.package.bundle.control-missing' && finding.path === path), `missing ${path} should be identified as required control topology`);
}

for (const path of requiredPaths) {
  const candidate = path === EXPORT_PACKAGE_CONTROL_PATHS.fileMap
    ? replaceControlWithoutRebuild(bundle, path, '{not-json')
    : replaceControlAndRebuildFileMap(bundle, path, '{not-json');
  const inspection = inspectExportPackageBundle(candidate);
  assert.equal(inspection.status, 'invalid', `unreadable ${path} must fail closed`);
  assert.ok(inspection.findings.some((finding) => finding.code === 'export.package.bundle.control-unreadable' && finding.path === path), `unreadable ${path} should be identified`);
}

const pointerCases = [
  ['manifestPath', EXPORT_PACKAGE_CONTROL_PATHS.manifest],
  ['receiptPath', EXPORT_PACKAGE_CONTROL_PATHS.receipt],
  ['buildReceiptPath', EXPORT_PACKAGE_CONTROL_PATHS.buildReceipt],
  ['contractPath', EXPORT_PACKAGE_CONTROL_PATHS.contract],
  ['findingsPath', EXPORT_PACKAGE_CONTROL_PATHS.findings],
  ['fileMapPath', EXPORT_PACKAGE_CONTROL_PATHS.fileMap]
];
for (const [field, expected] of pointerCases) {
  const candidate = mutateJsonControlAndRebuildFileMap(bundle, EXPORT_PACKAGE_CONTROL_PATHS.index, (index) => {
    index[field] = `redirected/${field}.json`;
  });
  const inspection = inspectExportPackageBundle(candidate);
  assert.equal(inspection.status, 'invalid', `redirected ${field} must fail closed`);
  assert.ok(inspection.findings.some((finding) => finding.code === 'export.package.bundle.index-control-pointer-mismatch' && finding.field === field && finding.expected === expected));
}

const blankPointer = mutateJsonControlAndRebuildFileMap(bundle, EXPORT_PACKAGE_CONTROL_PATHS.index, (index) => {
  index.contractPath = '';
});
const blankInspection = inspectExportPackageBundle(blankPointer);
assert.equal(blankInspection.status, 'invalid');
assert.ok(blankInspection.findings.some((finding) => finding.code === 'export.package.bundle.index-control-pointer-missing' && finding.field === 'contractPath'));

const duplicatePointer = mutateJsonControlAndRebuildFileMap(bundle, EXPORT_PACKAGE_CONTROL_PATHS.index, (index) => {
  index.contractPath = index.buildReceiptPath;
});
const duplicateInspection = inspectExportPackageBundle(duplicatePointer);
assert.equal(duplicateInspection.status, 'invalid');
assert.ok(duplicateInspection.findings.some((finding) => finding.code === 'export.package.bundle.index-control-pointer-duplicate'));
assert.ok(duplicateInspection.findings.some((finding) => finding.code === 'export.package.bundle.index-control-pointer-mismatch' && finding.field === 'contractPath'));

for (const path of [
  EXPORT_PACKAGE_CONTROL_PATHS.buildReceipt,
  EXPORT_PACKAGE_CONTROL_PATHS.contract,
  EXPORT_PACKAGE_CONTROL_PATHS.findings
]) {
  const candidate = removeControlAndRebuildFileMap(bundle, path);
  const inspection = inspectExportPackageBundle(candidate);
  assert.equal(inspection.status, 'invalid', `removing ${path} and rebuilding durable file map must remain invalid`);
  assert.ok(inspection.findings.some((finding) => finding.code === 'export.package.bundle.control-missing' && finding.path === path));
}

function removeControlAndRebuildFileMap(source, path) {
  const governed = source.files.filter((file) => file.path !== path && file.path !== EXPORT_PACKAGE_CONTROL_PATHS.fileMap);
  return withRebuiltFileMap(source, governed);
}

function replaceControlWithoutRebuild(source, path, content) {
  const replacement = finalizeFile({ ...source.files.find((file) => file.path === path), content, data: undefined });
  return { ...source, files: source.files.map((file) => file.path === path ? replacement : file) };
}

function replaceControlAndRebuildFileMap(source, path, content) {
  const replacement = finalizeFile({ ...source.files.find((file) => file.path === path), content, data: undefined });
  const governed = source.files
    .filter((file) => file.path !== EXPORT_PACKAGE_CONTROL_PATHS.fileMap)
    .map((file) => file.path === path ? replacement : file);
  return withRebuiltFileMap(source, governed);
}

function mutateJsonControlAndRebuildFileMap(source, path, mutate) {
  const original = source.files.find((file) => file.path === path);
  const value = JSON.parse(new TextDecoder().decode(packageFileBytes(original)));
  mutate(value);
  return replaceControlAndRebuildFileMap(source, path, `${JSON.stringify(value, null, 2)}\n`);
}

function withRebuiltFileMap(source, governed) {
  const fileMap = buildExportPackageFileMap(governed, { packageId: source.packageId });
  const template = source.files.find((file) => file.path === EXPORT_PACKAGE_CONTROL_PATHS.fileMap);
  const mapFile = finalizeFile({ ...template, content: `${JSON.stringify(fileMap, null, 2)}\n`, data: undefined });
  return { ...source, files: [...governed, mapFile], fileMap };
}

console.log('export.package.controlTopology: ok');
