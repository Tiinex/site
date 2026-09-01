import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { inspectStoredWorkspaceArchive } from './workspaceByteProvider.js';
import { parseRecipientV2Pointer, parseRecipientV2Relation } from './recipientV2.artifacts.js';
import { recipientV2TransportFacts } from './recipientV2.transportManifest.js';
import { PHASE1_COMPLETE_WORKSPACE_ROLE, PHASE1_BOUNDED_WORKSPACE_ROLE } from './recipientV2.artifactFirst.workspaces.js';
import { PHASE1_BOOTSTRAP_ROLE, PHASE1_CACHE_ROLE, currentSchemaId, decodeUtf8, oneFile, sectionText, fieldValue, markdownTarget, normalizeRoutePath, deepFreeze, finding } from './recipientV2.artifactFirst.shared.js';

export function deriveRecipientV2ArtifactFirstPhase1Facts(files = []) {
  const facts = new Map();
  const payloadByPath = new Map();
  const archiveByLocation = new Map();
  const archiveIdentity = (location = '') => {
    const key = String(location || '');
    if (!key) return null;
    if (archiveByLocation.has(key)) return archiveByLocation.get(key);
    const file = oneFile(files, key);
    if (!file) { archiveByLocation.set(key, null); return null; }
    const bytes = packageFileBytes(file);
    const identity = Object.freeze({ file, bytes, sha256: sha256Hex(bytes), archive: inspectStoredWorkspaceArchive(bytes, { ownedBytes: true }) });
    archiveByLocation.set(key, identity);
    return identity;
  };
  for (const file of files) {
    const path = String(file.path || '');
    if (!/\.md$/i.test(path)) continue;
    const markdown = decodeUtf8(packageFileBytes(file));
    if (currentSchemaId(markdown) === 'tiinex.external.payload.v1') payloadByPath.set(path, parsePhase1Payload(markdown));
  }
  for (const file of files) {
    const path = String(file.path || '');
    if (!/\.md$/i.test(path)) continue;
    const markdown = decodeUtf8(packageFileBytes(file));
    const schemaId = currentSchemaId(markdown);
    if (schemaId === 'tiinex.pointer.v1') {
      const parsed = parseRecipientV2Pointer(markdown);
      if (parsed.role === 'participant-role' || parsed.role === 'endpoint-role') {
        const roleKind = parsed.role === 'endpoint-role' ? 'endpoint-role' : 'participant-role';
        const targetPayload = payloadByPath.get(String(parsed.targetPayload || '')) || null;
        const targetArchiveIdentity = targetPayload ? archiveIdentity(targetPayload.location) : null;
        const archive = targetArchiveIdentity?.archive || null;
        const targetPath = parsed.targetCarrierKind === 'workspace-cache-entry' ? parsed.targetArchiveEntry : parsed.targetInnerPath;
        const targetMatches = archive?.state === 'qualified' ? archive.entries.filter((entry) => String(entry.path || '') === String(targetPath || '')) : [];
        const target = targetMatches.length === 1 ? targetMatches[0] : null;
        const targetBytes = target ? packageFileBytes({ data: target.data }) : new Uint8Array();
        facts.set(path, recipientV2TransportFacts(roleKind, {
          workspaceId: parsed.workspaceId || '',
          routeId: parsed.routeId || '',
          ...(roleKind === 'endpoint-role' ? { endpointRequirementId: parsed.endpointRequirementId || '', endpointParty: parsed.endpointParty || '' } : { participantRequirementId: parsed.participantRequirementId || '' }),
          roleLabelHint: parsed.roleLabelHint || '',
          referenceTarget: parsed.roleReference || '',
          targetCarrierKind: parsed.targetCarrierKind || '',
          targetWorkspaceId: parsed.targetWorkspaceId || '',
          archivePath: targetPayload?.location || '',
          archiveSha256: targetArchiveIdentity?.sha256 || '',
          targetInnerPath: parsed.targetInnerPath || '',
          targetArchiveEntry: parsed.targetArchiveEntry || '',
          targetBytes: targetBytes.byteLength,
          targetSha256: targetBytes.byteLength ? sha256Hex(targetBytes) : ''
        }));
      } else facts.set(path, recipientV2TransportFacts(parsed.role || 'navigation', {
          workspaceId: parsed.workspaceId || '',
          payloadArtifactPath: parsed.workspacePayload || '',
          workspaceRelativeHandoffPath: parsed.handoffWorkspacePath || '',
          routeId: parsed.routeId || '',
          routeSelection: parsed.role === 'recovery-orientation' ? Object.freeze({ mode: parsed.routeSelection || '', selectedRouteId: parsed.selectedRouteId || '', candidateCount: Number(parsed.candidateRouteCount || 0) }) : undefined,
          carrierLineage: parsed.role === 'recovery-orientation' ? Object.freeze({ dimension: parsed.carrierDimension || '', parentDimension: parsed.parentCarrierDimension || '', checkpointKind: parsed.carrierCheckpoint || '' }) : undefined
        }));
    } else if (schemaId === 'tiinex.external.payload.v1') {
      const parsed = parsePhase1Payload(markdown);
      if ([PHASE1_COMPLETE_WORKSPACE_ROLE, PHASE1_BOUNDED_WORKSPACE_ROLE].includes(parsed.payloadRole)) facts.set(path, recipientV2TransportFacts('workspace-representation-payload', { workspaceId: parsed.workspaceId, coverage: parsed.payloadRole === PHASE1_BOUNDED_WORKSPACE_ROLE ? 'bounded' : 'complete', archivePath: parsed.location || '', archiveBytes: Number(parsed.bytes || 0), archiveSha256: parsed.integrityValue || '' }));
      else if (parsed.payloadRole === PHASE1_BOOTSTRAP_ROLE) facts.set(path, recipientV2TransportFacts('tooling-bootstrap', { archivePath: parsed.location || '', archiveBytes: Number(parsed.bytes || 0), archiveSha256: parsed.integrityValue || '', payloadRole: parsed.payloadRole }));
      else if (parsed.payloadRole === PHASE1_CACHE_ROLE) {
        const archive = archiveIdentity(parsed.location)?.archive || null;
        const materials = parsed.materials.map((material) => {
          const matches = archive?.state === 'qualified' ? archive.entries.filter((entry) => String(entry.path || '') === String(material.archiveEntry || '')) : [];
          const entry = matches.length === 1 ? matches[0] : null;
          const bytes = entry ? packageFileBytes({ data: entry.data }) : new Uint8Array();
          return Object.freeze({ requirementId: material.requirementId, classification: material.classification, referenceTarget: material.referenceTarget, routeWorkspaceId: parsed.workspaceId, routePath: '', sourceRequirementId: material.requirementId, originalPath: '', archiveEntry: material.archiveEntry, bytes: bytes.byteLength, sha256: bytes.byteLength ? sha256Hex(bytes) : '' });
        });
        facts.set(path, recipientV2TransportFacts('workspace-dependency-cache', { workspaceId: parsed.workspaceId, archivePath: parsed.location || '', archiveBytes: Number(parsed.bytes || 0), archiveSha256: parsed.integrityValue || '', materials: Object.freeze(materials) }));
      }
    } else if (schemaId === 'tiinex.relation.v1') {
      const parsed = parseRecipientV2Relation(markdown);
      facts.set(path, recipientV2TransportFacts('workspace-representation', {
        workspaceId: parsed.targetWorkspaceId || '', coverage: parsed.scope === 'bounded recipient-relative workspace materialization' ? 'bounded' : 'complete', workspaceArtifactInnerPath: parsed.targetWorkspaceInnerPath || '', payloadArtifactPath: parsed.source || '', relationType: parsed.relationType || '', relationDirection: parsed.direction || '', relationScope: parsed.scope || ''
      }));
    }
  }
  return facts;
}

export function parsePhase1Payload(markdown = '') {
  const identity = sectionText(markdown, 'Payload Identity');
  const location = sectionText(markdown, 'Payload Location');
  const integrity = sectionText(markdown, 'Integrity Reference');
  return Object.freeze({
    workspaceId: fieldValue(identity, 'Workspace Id'),
    payloadRole: fieldValue(identity, 'Payload Role'),
    bytes: Number(fieldValue(identity, 'Byte Size') || 0),
    location: markdownTarget(fieldValue(location, 'Location')),
    integrityStatus: fieldValue(integrity, 'Integrity Status'),
    integrityMethod: fieldValue(integrity, 'Integrity Method'),
    integrityValue: fieldValue(integrity, 'Integrity Value'),
    integrityTarget: fieldValue(integrity, 'Integrity Target'),
    materials: parsePhase1MaterialBindings(markdown)
  });
}

function parsePhase1MaterialBindings(markdown = '') {
  const section = sectionText(markdown, 'Payload Material Bindings');
  if (!section) return Object.freeze([]);
  const out = [];
  let current = null;
  for (const line of section.split(/\r?\n/)) {
    const requirement = line.match(/^\s*-\s+Requirement Id:\s*(.*?)\s*$/i);
    if (requirement) {
      if (current) out.push(Object.freeze(current));
      current = { requirementId: String(requirement[1] || '').trim(), classification: '', referenceTarget: '', archiveEntry: '' };
      continue;
    }
    if (!current) continue;
    const classification = line.match(/^\s+-\s+Classification:\s*(.*?)\s*$/i);
    const reference = line.match(/^\s+-\s+Material Reference:\s*(.*?)\s*$/i);
    const archiveEntry = line.match(/^\s+-\s+Archive Entry:\s*(.*?)\s*$/i);
    if (classification) current.classification = String(classification[1] || '').trim();
    else if (reference) current.referenceTarget = String(reference[1] || '').trim();
    else if (archiveEntry) current.archiveEntry = String(archiveEntry[1] || '').trim();
  }
  if (current) out.push(Object.freeze(current));
  return Object.freeze(out);
}

export function selectPhase1SourceRoute(carrierProjection = {}, selector = '', findings = []) {
  const candidates = [...(carrierProjection.routes || [])].filter((route) => String(route.state || '') === 'qualified');
  const requested = String(selector || '').trim();
  if (!requested) {
    if (candidates.length === 1) return deepFreeze({ state: 'qualified', mode: 'implicit-single-qualified-route', selector: '', candidateCount: 1, route: candidates[0] });
    findings.push(finding('error', candidates.length > 1 ? 'portable.handoff-v2-phase1.route-selection.required' : 'portable.handoff-v2-phase1.route-selection.unresolved', candidates.length > 1 ? 'Phase 1 artifact-first manufacture requires an explicit route selector when more than one qualified Handoff candidate exists.' : 'Phase 1 artifact-first manufacture requires exactly one qualified Handoff route candidate.', { candidateCount: candidates.length }));
    return deepFreeze({ state: 'blocked', mode: candidates.length > 1 ? 'selection-required' : 'unresolved', selector: '', candidateCount: candidates.length, route: null });
  }
  const normalized = normalizeRoutePath(requested);
  const matches = candidates.filter((route) => String(route.id || '') === requested || normalizeRoutePath(route.workspaceRelativePath || '') === normalized || `${String(route.workspaceId || '')}:${normalizeRoutePath(route.workspaceRelativePath || '')}` === requested);
  if (matches.length !== 1) {
    findings.push(finding('error', matches.length > 1 ? 'portable.handoff-v2-phase1.route-selection.ambiguous' : 'portable.handoff-v2-phase1.route-selection.unresolved', 'Explicit Phase 1 route selector must bind exactly one qualified Handoff route candidate.', { selector: requested, matches: matches.length, candidateCount: candidates.length }));
    return deepFreeze({ state: 'blocked', mode: matches.length > 1 ? 'ambiguous' : 'unresolved', selector: requested, candidateCount: candidates.length, route: null });
  }
  return deepFreeze({ state: 'qualified', mode: 'explicit-qualified-route-selector', selector: requested, candidateCount: candidates.length, route: matches[0] });
}

export function qualifyPhase1BootstrapPayload(bootstrapPayload = null, semanticFiles = [], findings = []) {
  if (!bootstrapPayload) return null;
  const localFindings = [];
  if (String(bootstrapPayload.parsed?.payloadRole || '') !== PHASE1_BOOTSTRAP_ROLE) localFindings.push(finding('error', 'portable.handoff-v2-phase1.bootstrap.role-mismatch', 'Portable Tooling bootstrap External Payload must declare the accepted bootstrap payload role.'));
  const location = String(bootstrapPayload.parsed?.location || '');
  const matches = semanticFiles.filter((file) => String(file.path || '') === location);
  if (!location || matches.length !== 1) localFindings.push(finding('error', 'portable.handoff-v2-phase1.bootstrap.location-unresolved', 'Portable Tooling bootstrap External Payload Location must resolve exactly one carried payload file.', { path: location, count: matches.length }));
  let bytes = new Uint8Array();
  if (matches.length === 1) {
    bytes = packageFileBytes(matches[0]);
    const digest = sha256Hex(bytes);
    if (Number(bootstrapPayload.parsed?.bytes || 0) !== bytes.byteLength || String(bootstrapPayload.parsed?.integrityStatus || '') !== 'verified' || String(bootstrapPayload.parsed?.integrityMethod || '') !== 'sha256' || String(bootstrapPayload.parsed?.integrityValue || '') !== digest) localFindings.push(finding('error', 'portable.handoff-v2-phase1.bootstrap.identity-mismatch', 'Portable Tooling bootstrap visible byte identity diverges from the exact carried payload bytes.', { path: location }));
    const archive = inspectStoredWorkspaceArchive(bytes, { ownedBytes: true });
    if (archive.state !== 'qualified') localFindings.push(finding('error', 'portable.handoff-v2-phase1.bootstrap.archive-invalid', 'Portable Tooling bootstrap payload is not a qualified deterministic stored-ZIP representation.', { path: location, findings: archive.findings || [] }));
  }
  findings.push(...localFindings);
  return deepFreeze({ state: localFindings.some((item) => item.severity === 'error') ? 'blocked' : 'qualified', artifactPath: String(bootstrapPayload.path || ''), payloadPath: location, payloadRole: String(bootstrapPayload.parsed?.payloadRole || ''), bytes: bytes.byteLength, sha256: bytes.byteLength ? sha256Hex(bytes) : '', findings: Object.freeze(localFindings), boundary: 'Visible External Payload ownership of exact portable Tooling bootstrap bytes. Ingress navigation and package placement create no Parent or package authority.' });
}

export function qualifyPhase1CachePayload(cachePayload = null, semanticFiles = [], findings = []) {
  if (!cachePayload) return null;
  const localFindings = [];
  const location = String(cachePayload.parsed?.location || '');
  const matches = semanticFiles.filter((file) => String(file.path || '') === location);
  if (!location || matches.length !== 1) localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.location-unresolved', 'Selected-route cache External Payload Location must resolve exactly one carried payload file.', { path: location, count: matches.length }));
  let bytes = new Uint8Array();
  let archive = null;
  const materialQualifications = [];
  if (matches.length === 1) {
    bytes = packageFileBytes(matches[0]);
    const digest = sha256Hex(bytes);
    if (Number(cachePayload.parsed?.bytes || 0) !== bytes.byteLength || String(cachePayload.parsed?.integrityStatus || '') !== 'verified' || String(cachePayload.parsed?.integrityMethod || '') !== 'sha256' || String(cachePayload.parsed?.integrityValue || '') !== digest) localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.identity-mismatch', 'Selected-route cache visible byte identity diverges from exact carried cache bytes.', { path: location }));
    archive = inspectStoredWorkspaceArchive(bytes, { ownedBytes: true });
    if (archive.state !== 'qualified') localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.archive-invalid', 'Selected-route cache payload is not a qualified deterministic stored-ZIP representation.', { path: location, findings: archive.findings || [] }));
  }
  const seenRequirements = new Set();
  const seenReferences = new Set();
  const seenEntries = new Set();
  for (const material of cachePayload.parsed?.materials || []) {
    const requirementId = String(material.requirementId || '');
    const referenceTarget = String(material.referenceTarget || '');
    const archiveEntry = String(material.archiveEntry || '');
    if (!requirementId || !referenceTarget || !archiveEntry) {
      localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.material-binding-incomplete', 'Every selected-route cache material binding must visibly declare requirement id, material reference, and archive entry.'));
      continue;
    }
    if (seenRequirements.has(requirementId) || seenReferences.has(referenceTarget) || seenEntries.has(archiveEntry)) localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.material-binding-ambiguous', 'Selected-route cache material bindings must be one-to-one by requirement id, material reference, and archive entry.', { requirementId, referenceTarget, archiveEntry }));
    seenRequirements.add(requirementId); seenReferences.add(referenceTarget); seenEntries.add(archiveEntry);
    const entryMatches = archive?.state === 'qualified' ? archive.entries.filter((entry) => String(entry.path || '') === archiveEntry) : [];
    if (archive?.state === 'qualified' && entryMatches.length !== 1) localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.material-entry-unresolved', 'Selected-route cache material binding must resolve exactly one exact cache entry.', { requirementId, referenceTarget, archiveEntry, count: entryMatches.length }));
    const entry = entryMatches.length === 1 ? entryMatches[0] : null;
    const entryBytes = entry ? packageFileBytes({ data: entry.data }) : new Uint8Array();
    materialQualifications.push(deepFreeze({ requirementId, classification: String(material.classification || ''), referenceTarget, archiveEntry, bytes: entryBytes.byteLength, sha256: entryBytes.byteLength ? sha256Hex(entryBytes) : '' }));
  }
  if (!(cachePayload.parsed?.materials || []).length) localFindings.push(finding('error', 'portable.handoff-v2-phase1.cache.material-bindings-missing', 'Selected-route cache External Payload must visibly bind every owned detached material to one archive entry.'));
  findings.push(...localFindings);
  return deepFreeze({ state: localFindings.some((item) => item.severity === 'error') ? 'blocked' : 'qualified', workspaceId: String(cachePayload.parsed?.workspaceId || ''), artifactPath: String(cachePayload.path || ''), payloadPath: location, payloadRole: String(cachePayload.parsed?.payloadRole || ''), bytes: bytes.byteLength, sha256: bytes.byteLength ? sha256Hex(bytes) : '', archive, materials: Object.freeze(materialQualifications), findings: Object.freeze(localFindings), boundary: 'Visible cache External Payload ownership plus exact cache ZIP bytes and visible material-to-entry bindings. Cache location and compatibility JSON do not create material authority.' });
}
