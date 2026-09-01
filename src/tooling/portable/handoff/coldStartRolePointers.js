import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { portableFinding } from '../findings.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';

export function resolveColdStartRolePointerMaterial(bundle, facts, findings, pointerPath, roleKind = 'participant-role') {
  const codeKind = roleKind === 'endpoint-role' ? 'endpoint-role' : 'participant-role';
  const labelKind = roleKind === 'endpoint-role' ? 'Endpoint Role' : 'Participant Role';
  const archivePath = String(facts.archivePath || '').trim();
  const archiveFile = findFile(bundle, archivePath);
  if (!archiveFile) {
    findings.push(portableFinding('error', `portable.cold-start.${codeKind}.archive.missing`, `${labelKind} Pointer target archive is not carried.`, { pointerPath, archivePath }));
    return null;
  }
  const archive = inspectStoredWorkspaceArchive(packageFileBytes(archiveFile), { ownedBytes: true });
  if (archive.state !== 'qualified') {
    findings.push(portableFinding('error', `portable.cold-start.${codeKind}.archive.invalid`, `${labelKind} Pointer target archive is not qualified.`, { pointerPath, archivePath }));
    return null;
  }
  const targetPath = String(facts.targetCarrierKind || '') === 'workspace-cache-entry'
    ? String(facts.targetArchiveEntry || '')
    : String(facts.targetInnerPath || '');
  const matches = (archive.entries || []).filter((entry) => normalizePath(entry.path || '') === normalizePath(targetPath));
  if (matches.length !== 1) {
    findings.push(portableFinding('error', matches.length > 1 ? `portable.cold-start.${codeKind}.target.ambiguous` : `portable.cold-start.${codeKind}.target.missing`, `${labelKind} Pointer does not resolve to exactly one target entry.`, { pointerPath, archivePath, targetPath, matches: matches.length }));
    return null;
  }
  const data = packageFileBytes({ data: matches[0].data });
  if ((facts.targetBytes && Number(facts.targetBytes) !== data.byteLength)
    || (facts.targetSha256 && String(facts.targetSha256) !== sha256Hex(data))) {
    findings.push(portableFinding('error', `portable.cold-start.${codeKind}.target.identity-mismatch`, `${labelKind} Pointer target bytes diverge from the declared exact identity.`, { pointerPath, archivePath, targetPath }));
    return null;
  }
  const markdown = decodeUtf8(data);
  return markdown ? Object.freeze({ path: `${archivePath}::${targetPath}`, markdown }) : null;
}

function findFile(bundle = {}, path = '') { return (bundle.files || []).find((file) => String(file.path || '') === String(path || '')) || null; }
function normalizePath(value) { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+/, ''); }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
