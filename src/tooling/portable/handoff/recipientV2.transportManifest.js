import { finalizeFile } from '../../../export/package.fileMap.js';
import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { parseRecipientV2Facts } from './recipientV2.artifacts.js';

export const RECIPIENT_V2_TRANSPORT_MANIFEST_PATH = 'tiinex-recipient-v2.transport.json';
export const RECIPIENT_V2_TRANSPORT_MANIFEST_SCHEMA_ID = 'tiinex.transport.recipient-v2.manifest.v1';

export function recipientV2TransportFacts(role = '', facts = {}) {
  return Object.freeze({ factsFormat: 'portable-recipient-v2', factsVersion: 1, role: String(role || ''), ...(facts || {}) });
}

export function buildRecipientV2TransportManifestFile(files = [], input = {}) {
  const entries = [...files]
    .filter((file) => String(file.path || '') !== RECIPIENT_V2_TRANSPORT_MANIFEST_PATH)
    .map((file) => Object.freeze({
      path: String(file.path || ''),
      bytes: packageFileBytes(file).byteLength,
      sha256: sha256Hex(packageFileBytes(file)),
      kind: String(file.kind || ''),
      mediaType: String(file.mediaType || ''),
      ...(file.transportFacts ? { facts: file.transportFacts } : {})
    }))
    .sort((a, b) => a.path.localeCompare(b.path));
  const manifest = Object.freeze({
    schema: RECIPIENT_V2_TRANSPORT_MANIFEST_SCHEMA_ID,
    version: 1,
    format: String(input.format || ''),
    packageRootPath: String(input.packageRootPath || ''),
    entryArtifactPath: String(input.entryArtifactPath || ''),
    boundary: 'Transport-owned recipient-v2 topology and exact byte map. This control surface is not a Tiinex semantic artifact and does not create Parent, Workspace, Handoff, authorship, or publication authority.',
    entries: Object.freeze(entries)
  });
  return finalizeFile({
    path: RECIPIENT_V2_TRANSPORT_MANIFEST_PATH,
    kind: 'handoff-transport-manifest',
    logicalKind: 'recipient-v2-transport-control',
    mediaType: 'application/json',
    content: `${stableJson(manifest)}\n`,
    boundary: manifest.boundary
  });
}

export function inspectRecipientV2TransportManifest(files = []) {
  const findings = [];
  const candidates = files.filter((file) => String(file.path || '') === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH);
  if (!candidates.length) return Object.freeze({ state: 'absent', file: null, manifest: null, factsByPath: new Map(), findings: Object.freeze([]) });
  if (candidates.length !== 1) return Object.freeze({ state: 'invalid', file: null, manifest: null, factsByPath: new Map(), findings: Object.freeze([finding('error', 'portable.handoff-v2-transport.manifest.duplicate', 'Recipient-v2 transport manifest must occur exactly once.', { count: candidates.length })]) });
  const file = candidates[0];
  let manifest;
  try { manifest = JSON.parse(decodeUtf8(packageFileBytes(file))); }
  catch { return Object.freeze({ state: 'invalid', file, manifest: null, factsByPath: new Map(), findings: Object.freeze([finding('error', 'portable.handoff-v2-transport.manifest.parse-failed', 'Recipient-v2 transport manifest is not valid JSON.')]) }); }
  if (manifest?.schema !== RECIPIENT_V2_TRANSPORT_MANIFEST_SCHEMA_ID || Number(manifest?.version || 0) !== 1) findings.push(finding('error', 'portable.handoff-v2-transport.manifest.schema-invalid', 'Recipient-v2 transport manifest schema/version is unsupported.'));
  if (!manifest?.format || !manifest?.packageRootPath || !manifest?.entryArtifactPath) findings.push(finding('error', 'portable.handoff-v2-transport.manifest.identity-incomplete', 'Recipient-v2 transport manifest is missing format/root/entry identity.'));
  const physical = new Map();
  for (const candidate of files) {
    const path = String(candidate.path || '');
    if (!path || path === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH) continue;
    const list = physical.get(path) || [];
    list.push(candidate);
    physical.set(path, list);
  }
  const declared = new Map();
  const factsByPath = new Map();
  for (const entry of Array.isArray(manifest?.entries) ? manifest.entries : []) {
    const path = String(entry?.path || '');
    if (!path || declared.has(path)) { findings.push(finding('error', 'portable.handoff-v2-transport.manifest.entry-path-invalid', 'Transport manifest entry path is missing or duplicated.', { path })); continue; }
    declared.set(path, entry);
    const matches = physical.get(path) || [];
    if (matches.length !== 1) { findings.push(finding('error', 'portable.handoff-v2-transport.manifest.entry-unresolved', 'Transport manifest entry does not resolve to exactly one visible carrier.', { path, count: matches.length })); continue; }
    const data = packageFileBytes(matches[0]);
    if (Number(entry.bytes) !== data.byteLength || String(entry.sha256 || '') !== sha256Hex(data)) findings.push(finding('error', 'portable.handoff-v2-transport.manifest.byte-identity-mismatch', 'Transport manifest byte identity does not match the visible carrier.', { path }));
    if (/\.md$/i.test(path)) {
      if (!entry.facts || entry.facts.factsFormat !== 'portable-recipient-v2' || Number(entry.facts.factsVersion || 0) !== 1) findings.push(finding('error', 'portable.handoff-v2-transport.manifest.markdown-facts-missing', 'Every generated recipient-v2 Markdown carrier requires one transport-manifest facts record.', { path }));
      else factsByPath.set(path, Object.freeze({ ...entry.facts }));
    } else if (entry.facts) findings.push(finding('error', 'portable.handoff-v2-transport.manifest.nonmarkdown-facts', 'Transport facts may only annotate generated Markdown carriers.', { path }));
  }
  for (const [path, matches] of physical) {
    if (matches.length !== 1) findings.push(finding('error', 'portable.handoff-v2-transport.manifest.physical-duplicate', 'Visible recipient-v2 carrier path is duplicated.', { path, count: matches.length }));
    if (!declared.has(path)) findings.push(finding('error', 'portable.handoff-v2-transport.manifest.unmapped-carrier', 'Visible recipient-v2 carrier is absent from the transport manifest byte map.', { path }));
  }
  return Object.freeze({ state: findings.some((item) => item.severity === 'error') ? 'invalid' : 'valid', file, manifest: manifest || null, factsByPath, findings: Object.freeze(findings) });
}

export function recipientV2FactsForFile(file = {}, transportInspection = null) {
  const path = String(file?.path || '');
  const manifested = transportInspection?.factsByPath?.get?.(path) || null;
  if (manifested) return manifested;
  if (!/\.md$/i.test(path)) return null;
  return parseRecipientV2Facts(decodeUtf8(packageFileBytes(file)));
}

export function recipientV2FactsIndex(bundle = {}) {
  const files = Array.isArray(bundle.files) ? bundle.files : [];
  const transport = inspectRecipientV2TransportManifest(files);
  const map = new Map();
  for (const file of files) {
    const facts = recipientV2FactsForFile(file, transport.state === 'valid' ? transport : null);
    if (facts) map.set(String(file.path || ''), facts);
  }
  return Object.freeze({ transport, map });
}

function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function decodeUtf8(data) { try { return new TextDecoder('utf-8', { fatal: true }).decode(data); } catch { return ''; } }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
