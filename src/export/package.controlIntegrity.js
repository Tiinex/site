import { packageFileBytes, sha256Hex, utf8Bytes } from './package.bytes.js';
import { exportPackageManifestFingerprint } from './package.manifest.js';
import { inspectExportPackageControlTopology } from './package.controlTopology.js';

export function inspectExportPackageControlConsistency(files = [], input = {}) {
  const topology = input.topologyChecked
    ? { findings: [], controls: input.controls || {} }
    : inspectExportPackageControlTopology(files);
  const findings = [...topology.findings];
  const manifest = topology.controls.manifest || null;
  const receipt = topology.controls.receipt || null;
  const buildReceipt = topology.controls.buildReceipt || null;
  const contract = topology.controls.contract || null;
  if (!manifest || !receipt || !buildReceipt || !contract) return findings;

  const expectedFingerprint = exportPackageManifestFingerprint(manifest);
  if (String(manifest.integrity?.fingerprint || '') !== expectedFingerprint) findings.push(finding('error', 'export.package.bundle.manifest-fingerprint-mismatch', 'Manifest semantic fingerprint does not match its declared material/status authority.'));
  if (String(receipt.packageId || '') !== String(manifest.packageId || '')) findings.push(finding('error', 'export.package.bundle.receipt-package-id-mismatch', 'Receipt package identity differs from manifest package identity.'));
  if (String(receipt.manifestFingerprint || '') !== expectedFingerprint) findings.push(finding('error', 'export.package.bundle.receipt-manifest-mismatch', 'Receipt no longer corresponds to the exact manifest semantic fingerprint.'));
  if (String(buildReceipt.packageId || '') !== String(manifest.packageId || '')) findings.push(finding('error', 'export.package.bundle.build-receipt-package-id-mismatch', 'Build receipt package identity differs from manifest package identity.'));
  if (String(buildReceipt.manifestFingerprint || '') !== expectedFingerprint) findings.push(finding('error', 'export.package.bundle.build-receipt-manifest-mismatch', 'Build receipt no longer corresponds to the exact manifest semantic fingerprint.'));
  if (String(buildReceipt.materialRepresentationSha256 || '') !== packageMaterialRepresentationSha256(files)) findings.push(finding('error', 'export.package.bundle.build-receipt-material-mismatch', 'Build receipt no longer corresponds to the exact governed material byte representation.'));
  if (String(contract.manifest?.integrity?.fingerprint || '') !== expectedFingerprint || String(contract.manifest?.packageId || '') !== String(manifest.packageId || '')) findings.push(finding('error', 'export.package.bundle.contract-manifest-mismatch', 'Embedded contract manifest differs from the serialized manifest control authority.'));
  if (String(contract.receipt?.manifestFingerprint || '') !== String(receipt.manifestFingerprint || '') || String(contract.receipt?.receiptId || '') !== String(receipt.receiptId || '')) findings.push(finding('error', 'export.package.bundle.contract-receipt-mismatch', 'Embedded contract receipt differs from the serialized receipt control authority.'));
  return findings;
}


export function packageMaterialRepresentationSha256(files = []) {
  const entries = files
    .filter((file) => file?.path && !String(file.path).startsWith('tiinex.package/'))
    .map((file) => ({
      path: String(file.path || ''),
      entryId: String(file.entryId || ''),
      kind: String(file.kind || ''),
      bytes: packageFileBytes(file).byteLength,
      sha256: sha256Hex(packageFileBytes(file))
    }))
    .sort((a, b) => a.path.localeCompare(b.path) || a.entryId.localeCompare(b.entryId));
  return sha256Hex(utf8Bytes(JSON.stringify(entries)));
}
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
