import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { inspectHandoffClosureDescriptor } from './materialClosure.descriptor.js';
import { inspectHandoffCarrierProjection } from './carrierProjection.js';
import { inspectHandoffPointerEntrypoints, isHandoffPointerEntrypointPath } from './pointerEntrypoint.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { RECIPIENT_V2_READ_PATH } from './recipientV2.topology.js';

export const PORTABLE_HANDOFF_CONTEXT_AUDIT_SCHEMA_ID = 'tiinex.portable.handoff-context-carriage-audit.v1';

export function auditHandoffPackageContextCarriage(input = {}) {
  const bundle = input.bundle || input;
  if ((bundle.files || []).some((file) => String(file.path || '') === RECIPIENT_V2_READ_PATH)) return auditRecipientV2(bundle);
  const findings = [];
  const closureInspection = inspectHandoffClosureDescriptor(bundle);
  const carrierInspection = inspectHandoffCarrierProjection(bundle);
  const pointerInspection = inspectHandoffPointerEntrypoints(bundle);
  findings.push(...(closureInspection.findings || []), ...(carrierInspection.findings || []), ...(pointerInspection.findings || []));
  const descriptor = closureInspection.descriptor || {};
  const carrier = carrierInspection.projection || {};
  const fileMap = parseJsonFile(findFile(bundle, 'tiinex.package/file-map.json')) || bundle.fileMap || {};
  const fileMapByPath = new Map((fileMap.entries || []).map((entry) => [String(entry.path || ''), entry]));
  const byPath = new Map((bundle.files || []).map((file) => [String(file.path || ''), file]));
  const workspaceEntries = indexWorkspaceEntries(descriptor.workspaceMaterializations || []);
  const workspaceOuterCarriers = indexWorkspaceOuterCarriers(descriptor.workspaceArchiveBindings || []);
  const workspaceByteIndex = indexWorkspaceBytes(descriptor.workspaceMaterializations || []);
  const materialByPath = indexMaterialized(descriptor.materialized || []);
  const requirementById = new Map([...(descriptor.requirements?.required || []), ...(descriptor.requirements?.reference || [])].map((item) => [String(item.requirementId || ''), item]));
  const routeGroundingByPath = indexRouteGrounding(carrier.routes || []);

  const bindingByWorkspace = new Map((descriptor.workspaceArchiveBindings || []).map((binding) => [String(binding.workspaceId || ''), binding]));
  const workspaceGroups = (descriptor.workspaceMaterializations || []).map((workspace) => workspaceGroup(workspace, routeGroundingByPath, bindingByWorkspace.get(String(workspace.id || ''))));
  const materialCarriers = [];
  const explicitDetached = [];
  const generatedEntrypoints = [];
  const packageRequirements = [];
  const unexplained = [];
  let nonControlCarrierCount = 0;
  let classifiedCarrierCount = 0;

  for (const file of bundle.files || []) {
    const path = String(file.path || '');
    if (!path || isControlOrBootstrap(path)) continue;
    nonControlCarrierCount += 1;
    const mapEntry = fileMapByPath.get(path) || {};
    const workspaceMatches = workspaceEntries.get(path) || [];
    const workspaceOuterMatches = workspaceOuterCarriers.get(path) || [];
    const materialMatches = materialByPath.get(path) || [];
    if (workspaceMatches.length === 1 || workspaceOuterMatches.length === 1) {
      classifiedCarrierCount += 1;
      continue;
    }
    if (workspaceMatches.length > 1 || workspaceOuterMatches.length > 1) {
      unexplained.push(summaryFile(file, mapEntry, 'ambiguous-workspace-carrier'));
      findings.push(finding('error', 'portable.handoff-context.workspace-carrier.ambiguous', 'One package carrier is claimed by multiple workspace materializations.', { path, count: Math.max(workspaceMatches.length, workspaceOuterMatches.length) }));
      continue;
    }
    if (path.startsWith('handoff.material/')) {
      if (materialMatches.length !== 1) {
        unexplained.push(summaryFile(file, mapEntry, materialMatches.length ? 'ambiguous-requirement-material' : 'unbound-requirement-material'));
        findings.push(finding('error', materialMatches.length ? 'portable.handoff-context.material.ambiguous' : 'portable.handoff-context.material.unbound', 'handoff.material carrier is not uniquely bound to one materialized Handoff requirement.', { path, count: materialMatches.length }));
        continue;
      }
      const material = materialMatches[0];
      const requirement = requirementById.get(String(material.requirementId || '')) || {};
      const bytes = packageFileBytes(file);
      const actualSha256 = bytes.byteLength ? sha256Hex(bytes) : String(mapEntry.sha256 || '');
      const duplicateWorkspaceBytes = workspaceByteIndex.get(`${Number(material.bytes || 0)}:${String(material.sha256 || '')}`) || [];
      materialCarriers.push(Object.freeze({
        path,
        reason: material.classification === 'reference' ? 'resolved-reference-context' : 'resolved-required-context',
        requirement: Object.freeze({ id: String(material.requirementId || ''), name: String(requirement.name || ''), classification: String(material.classification || ''), referenceTarget: String(material.referenceTarget || '') }),
        selectedProvider: Object.freeze({ ...(material.provider || {}) }),
        provenance: Object.freeze({ ...(material.provenance || {}) }),
        authority: Object.freeze({ ...(material.authority || {}) }),
        bytes: Number(material.bytes || 0),
        sha256: String(material.sha256 || ''),
        actualBytes: bytes.byteLength || Number(mapEntry.bytes || 0),
        actualSha256,
        identicalWorkspaceBytes: Object.freeze(duplicateWorkspaceBytes.map((entry) => Object.freeze({ workspaceId: entry.workspaceId, workspaceRelativePath: entry.path, packagePath: entry.packagePath })))
      }));
      classifiedCarrierCount += 1;
      continue;
    }
    if (isHandoffPointerEntrypointPath(path)) {
      generatedEntrypoints.push(Object.freeze({ ...summaryFile(file, mapEntry, 'generated-pointer-entrypoint'), authority: 'none' }));
      classifiedCarrierCount += 1;
      continue;
    }
    if (isNamedBasePackageRequirement(mapEntry)) {
      packageRequirements.push(Object.freeze({ ...summaryFile(file, mapEntry, namedBasePackageReason(mapEntry)), boundary: String(mapEntry.boundary || '') }));
      classifiedCarrierCount += 1;
      continue;
    }
    if (isExplicitDetachedTransport(mapEntry)) {
      explicitDetached.push(Object.freeze({ ...summaryFile(file, mapEntry, 'explicitly-supplied-detached-material'), semanticLooking: /\.trace\.md$/i.test(path) }));
      classifiedCarrierCount += 1;
      if (/\.trace\.md$/i.test(path)) findings.push(finding('warning', 'portable.handoff-context.detached.semantic-artifact', 'Detached transport material looks like a Tiinex trace artifact but is not route/requirement grounding. Its carriage is explicit, not semantically justified by the Handoff.', { path }));
      continue;
    }
    unexplained.push(summaryFile(file, mapEntry, 'unexplained'));
    findings.push(finding('error', 'portable.handoff-context.carrier.unexplained', 'Non-control/non-bootstrap package carrier has no explicit qualified carriage reason.', { path, kind: String(mapEntry.kind || file.kind || '') }));
  }

  for (const material of descriptor.materialized || []) {
    if (String(material.carrierKind || '') !== 'workspace-archive-entry') continue;
    const requirement = requirementById.get(String(material.requirementId || '')) || {};
    const duplicateWorkspaceBytes = workspaceByteIndex.get(`${Number(material.bytes || 0)}:${String(material.sha256 || '')}`) || [];
    materialCarriers.push(Object.freeze({
      path: '',
      reason: material.classification === 'reference' ? 'resolved-reference-context-via-workspace-archive' : 'resolved-required-context-via-workspace-archive',
      requirement: Object.freeze({ id: String(material.requirementId || ''), name: String(requirement.name || ''), classification: String(material.classification || ''), referenceTarget: String(material.referenceTarget || '') }),
      selectedProvider: Object.freeze({ ...(material.provider || {}) }),
      provenance: Object.freeze({ ...(material.provenance || {}) }),
      authority: Object.freeze({ ...(material.authority || {}) }),
      carrierKind: 'workspace-archive-entry',
      workspaceId: String(material.workspaceId || ''),
      workspaceRelativePath: String(material.workspaceRelativePath || ''),
      bytes: Number(material.bytes || 0),
      sha256: String(material.sha256 || ''),
      actualBytes: Number(material.bytes || 0),
      actualSha256: String(material.sha256 || ''),
      identicalWorkspaceBytes: Object.freeze(duplicateWorkspaceBytes.map((entry) => Object.freeze({ workspaceId: entry.workspaceId, workspaceRelativePath: entry.path, packagePath: entry.packagePath })))
    }));
  }

  const coverageQualified = classifiedCarrierCount === nonControlCarrierCount && unexplained.length === 0;
  if (!coverageQualified) findings.push(finding('error', 'portable.handoff-context.coverage.incomplete', 'Context-carriage audit did not classify every non-control/non-bootstrap package carrier.', { nonControlCarrierCount, classifiedCarrierCount, unexplained: unexplained.length }));

  const duplicateMaterialCount = materialCarriers.filter((item) => item.identicalWorkspaceBytes.length > 0).length;
  return deepFreeze({
    schema: PORTABLE_HANDOFF_CONTEXT_AUDIT_SCHEMA_ID,
    status: findings.some((item) => item.severity === 'error') ? 'blocked' : 'ready',
    coverage: Object.freeze({ nonControlCarrierCount, classifiedCarrierCount, unexplainedCarrierCount: unexplained.length, state: coverageQualified ? 'qualified' : 'incomplete' }),
    workspaceMaterializations: Object.freeze(workspaceGroups),
    materialCarriers: Object.freeze(materialCarriers),
    generatedEntrypoints: Object.freeze(generatedEntrypoints),
    namedPackageRequirements: Object.freeze(packageRequirements),
    explicitDetachedMaterial: Object.freeze(explicitDetached),
    unexplainedCarriers: Object.freeze(unexplained),
    duplicateByteSummary: Object.freeze({ materialCarriersAlsoPresentInWorkspace: duplicateMaterialCount, totalMaterialCarriers: materialCarriers.length, interpretation: 'Duplicate bytes are visible evidence only. The audit does not infer that duplication is semantically required.' }),
    routeGrounding: Object.freeze((carrier.routes || []).map((route) => Object.freeze({ routeId: String(route.id || ''), workspaceId: String(route.workspaceId || ''), handoffPackagePath: String(route.packagePath || ''), required: Object.freeze((route.requiredClosure?.requirements || []).map((item) => Object.freeze({ requirementId: String(item.requirementId || ''), name: String(item.name || ''), referenceTarget: String(item.referenceTarget || ''), state: String(item.state || ''), resolution: item.resolution || null }))) }))),
    inspections: Object.freeze({ closure: closureInspection.status, carrier: carrierInspection.status, pointers: pointerInspection.status }),
    findings: Object.freeze(dedupeFindings(findings)),
    boundary: 'Recipient-relative carriage/provenance audit only. Complete workspace membership is classified as snapshot carriage, not automatically as Handoff Required Context; semantic relevance inside complete workspaces is not inferred.'
  });
}


function auditRecipientV2(bundle = {}) {
  const inspection = inspectRecipientFacingV2Topology(bundle);
  const files = bundle.files || [];
  const workspacePayloadPaths = new Set((inspection.workspaces || []).flatMap((item) => [item.workspaceArtifactPath, item.workspaceArchivePath]));
  const routePointerPaths = new Set((inspection.routes || []).map((item) => item.pointerPath));
  const participantRolePointerPaths = new Set((inspection.participantRoles || []).map((item) => item.pointerPath));
  const cachePaths = new Set((inspection.caches || []).flatMap((cache) => [cache.artifactPath, cache.archivePath]));
  const rootPath = String(inspection.rootArtifact?.path || '');
  const classified = files.filter((file) => {
    const path = String(file.path || '');
    return path === rootPath || path === RECIPIENT_V2_READ_PATH || workspacePayloadPaths.has(path) || routePointerPaths.has(path) || participantRolePointerPaths.has(path) || cachePaths.has(path) || /bootstrap\.(?:trace\.md|zip)$/i.test(path);
  }).length;
  const unexplained = Math.max(0, files.length - classified);
  const findings = [...(inspection.findings || [])];
  if (unexplained) findings.push(finding('error', 'portable.handoff-context.v2.coverage.incomplete', 'Recipient-facing v2 context audit could not classify every visible root carrier.', { total: files.length, classified, unexplained }));
  const cacheMaterials = (inspection.caches || []).flatMap((cache) => cache.materials || []);
  return deepFreeze({ schema: PORTABLE_HANDOFF_CONTEXT_AUDIT_SCHEMA_ID, status: inspection.status === 'valid' && !unexplained ? 'ready' : 'blocked', coverage: Object.freeze({ nonControlCarrierCount: files.length, classifiedCarrierCount: classified, unexplainedCarrierCount: unexplained, state: unexplained ? 'incomplete' : 'qualified' }), workspaceMaterializations: Object.freeze((inspection.workspaces || []).map((item) => Object.freeze({ workspaceId: item.workspaceId, reason: 'complete-workspace-archive-representation', qualification: 'qualified', carrierMode: 'archive', workspaceTargetPackagePath: item.workspaceArtifactPath, archivePackagePath: item.workspaceArchivePath }))), materialCarriers: Object.freeze([]), generatedEntrypoints: Object.freeze([String(inspection.rootArtifact?.path || ''), RECIPIENT_V2_READ_PATH, ...(inspection.participantRoles || []).map((item) => item.pointerPath), ...(inspection.routes || []).map((item) => item.pointerPath)].filter(Boolean)), namedPackageRequirements: Object.freeze([]), explicitDetachedMaterial: Object.freeze(cacheMaterials), unexplainedCarriers: Object.freeze([]), duplicateByteSummary: Object.freeze({ materialCarriersAlsoPresentInWorkspace: 0, totalMaterialCarriers: cacheMaterials.length, interpretation: 'Exact Workspace-scoped recipient cache material is permitted only when not satisfied by a qualified Workspace archive.' }), routeGrounding: Object.freeze((inspection.carrierProjection?.routes || []).map((route) => Object.freeze({ routeId: route.id, workspaceId: route.workspaceId, handoffPackagePath: route.packagePath, required: route.requiredClosure?.requirements || [] }))), inspections: Object.freeze({ recipientV2: inspection.status }), findings: Object.freeze(dedupeFindings(findings)), boundary: 'Recipient-facing v2 carriage audit over qualified visible Tiinex artifacts and exact payload bytes; no outer control JSON is required.' });
}

function indexWorkspaceEntries(workspaces = []) {
  const map = new Map();
  for (const workspace of workspaces) for (const entry of workspace.includedEntries || []) {
    const path = String(entry.packagePath || '');
    if (!path) continue;
    const list = map.get(path) || [];
    list.push(Object.freeze({ workspaceId: String(workspace.id || ''), materialization: String(workspace.materialization || ''), ...entry }));
    map.set(path, list);
  }
  return map;
}
function indexWorkspaceOuterCarriers(bindings = []) {
  const map = new Map();
  const add = (path, value) => { if (!path) return; const list = map.get(path) || []; list.push(value); map.set(path, list); };
  for (const binding of bindings) {
    add(String(binding.workspaceTarget?.packagePath || ''), Object.freeze({ workspaceId: String(binding.workspaceId || ''), role: 'workspace-target' }));
    add(String(binding.representation?.packagePath || ''), Object.freeze({ workspaceId: String(binding.workspaceId || ''), role: 'workspace-archive' }));
  }
  return map;
}
function indexWorkspaceBytes(workspaces = []) {
  const map = new Map();
  for (const workspace of workspaces) for (const entry of workspace.includedEntries || []) {
    const key = `${Number(entry.bytes || 0)}:${String(entry.sha256 || '')}`;
    const list = map.get(key) || [];
    list.push(Object.freeze({ workspaceId: String(workspace.id || ''), path: String(entry.path || ''), packagePath: String(entry.packagePath || '') }));
    map.set(key, list);
  }
  return map;
}
function indexMaterialized(items = []) {
  const map = new Map();
  for (const item of items) {
    const path = String(item.packagePath || '');
    if (!path) continue;
    const list = map.get(path) || [];
    list.push(item);
    map.set(path, list);
  }
  return map;
}
function indexRouteGrounding(routes = []) {
  const map = new Map();
  const add = (path, role) => { if (!path) return; const list = map.get(path) || []; list.push(role); map.set(path, list); };
  for (const route of routes) {
    add(String(route.packagePath || ''), Object.freeze({ routeId: String(route.id || ''), role: 'controlling-handoff' }));
    for (const requirement of route.requiredClosure?.requirements || []) add(String(requirement.resolution?.packagePath || ''), Object.freeze({ routeId: String(route.id || ''), role: 'required-context', requirementId: String(requirement.requirementId || ''), name: String(requirement.name || '') }));
  }
  return map;
}
function workspaceGroup(workspace = {}, routeGroundingByPath, archiveBinding = null) {
  const entries = workspace.includedEntries || [];
  const grounding = [];
  for (const entry of entries) for (const role of routeGroundingByPath.get(String(entry.packagePath || '')) || []) grounding.push(Object.freeze({ workspaceRelativePath: String(entry.path || ''), packagePath: String(entry.packagePath || ''), ...role }));
  return Object.freeze({
    workspaceId: String(workspace.id || ''),
    title: String(workspace.title || workspace.id || ''),
    reason: workspace.materialization === 'complete' ? 'complete-workspace-materialization' : 'partial-workspace-materialization',
    qualification: String(workspace.qualification || ''),
    correlationStatus: String(workspace.correlationStatus || ''),
    entryCount: entries.length,
    totalBytes: entries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0),
    completenessEvidence: Object.freeze({ ...(workspace.completenessEvidence || {}) }),
    routeGrounding: Object.freeze(grounding),
    ...(archiveBinding ? { carrierMode: 'archive', workspaceTargetPackagePath: String(archiveBinding.workspaceTarget?.packagePath || ''), archivePackagePath: String(archiveBinding.representation?.packagePath || '') } : { carrierMode: 'exploded' }),
    interpretation: 'Workspace snapshot carriage is distinct from route Required Context; only routeGrounding entries are known to participate in explicit route grounding.'
  });
}
function isControlOrBootstrap(path) { return path.startsWith('tiinex.package/') || path.startsWith('tiinex.bootstrap/'); }
function isNamedBasePackageRequirement(entry = {}) { return ['workspace-context', 'artifact-markdown', 'asset', 'workspace-source-material', 'workspace-member-material'].includes(String(entry.kind || '')) || String(entry.path || '').startsWith('context/'); }
function namedBasePackageReason(entry = {}) { const kind = String(entry.kind || ''); if (kind === 'workspace-context' || String(entry.path || '').startsWith('context/')) return 'base-package-workspace-context'; return `base-package-${kind || 'material'}`; }
function isExplicitDetachedTransport(entry = {}) { return String(entry.kind || '').includes('transport-material') || String(entry.logicalKind || '') === 'recipient-relative-transport-material'; }
function summaryFile(file = {}, mapEntry = {}, reason = '') { const data = packageFileBytes(file); return Object.freeze({ path: String(file.path || ''), reason, kind: String(mapEntry.kind || file.kind || ''), logicalKind: String(mapEntry.logicalKind || file.logicalKind || ''), bytes: data.byteLength || Number(mapEntry.bytes || file.size || 0), sha256: data.byteLength ? sha256Hex(data) : String(mapEntry.sha256 || '') }); }
function findFile(bundle = {}, path = '') { return (bundle.files || []).find((file) => String(file.path || '') === String(path || '')) || null; }
function parseJsonFile(file = null) { try { return file ? JSON.parse(new TextDecoder().decode(packageFileBytes(file))) : null; } catch { return null; } }
function finding(severity, code, message, extra = {}) { return Object.freeze({ severity, code, message, ...extra }); }
function dedupeFindings(items = []) { const map = new Map(); for (const item of items) { const key = `${item.severity || ''}:${item.code || ''}:${item.path || item.packagePath || item.requirementId || ''}:${item.message || ''}`; if (!map.has(key)) map.set(key, item); } return [...map.values()]; }
function deepFreeze(value) { if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value; if (ArrayBuffer.isView(value) || value instanceof ArrayBuffer) return value; for (const child of Object.values(value)) deepFreeze(child); return Object.freeze(value); }
