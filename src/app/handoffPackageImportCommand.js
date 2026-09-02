import { fileToArchiveDecodedEntries, qualifyDecodedArchiveEntries } from '../adapters/archive/archive.adapter.js';
import { EXPORT_PACKAGE_CONTROL_ROLES } from '../export/package.controlTopology.js';
import { buildExportPackageApplyResult, buildExportPackageImportPlan } from '../export/package.apply.js';
import { rehydratePortableRuntimePackage } from '../tooling/portable/package/runtime.package.js';
import { applyRecipientFacingV2Handoff, tryReadRecipientFacingV2 } from './handoffPackageRecipientV2.js';

const KNOWN_CONTROL_PATHS = new Set(EXPORT_PACKAGE_CONTROL_ROLES.map((entry) => entry.path));

export async function tryReadOperationalHandoffPackage(files = [], options = {}) {
  const selected = Array.from(files || []).filter(Boolean);
  if (selected.length !== 1 || !/\.zip$/i.test(String(selected[0]?.name || selected[0]?.relativePath || ''))) return Object.freeze({ detected: false });
  let decoded;
  try {
    decoded = options.predecodedArchive || await fileToArchiveDecodedEntries(selected[0], { ...options, source: 'handoff-package-intake' });
  } catch (error) {
    return Object.freeze({ detected: false, extractionError: error });
  }
  const recipient = await tryReadRecipientFacingV2(decoded, options);
  if (recipient.detected) return Object.freeze(recipient);

  const controlPaths = (decoded.entries || []).map((entry) => String(entry.path || '')).filter((path) => KNOWN_CONTROL_PATHS.has(path));
  const packagePrefixCount = (decoded.entries || []).filter((entry) => String(entry.path || '').startsWith('tiinex.package/')).length;
  const detected = controlPaths.length >= 2 || (controlPaths.length >= 1 && packagePrefixCount >= 3);
  if (!detected) return Object.freeze({ detected: false, extracted: decoded });

  const extracted = await qualifyDecodedArchiveEntries(decoded, { ...options, source: 'handoff-package-intake', stripPortableControl: false, enforceMergePreflight: false });
  if ((extracted.errors || []).length) return Object.freeze({ detected: true, ok: false, error: 'handoff-package.archive-read-failed', extracted, notice: 'Claimed Handoff package could not be read safely.' });

  const rehydrated = rehydratePortableRuntimePackage({ files: extracted.entries || [] });
  if (rehydrated.status !== 'rehydrated' || rehydrated.inspection?.status !== 'valid') {
    return Object.freeze({ detected: true, ok: false, error: 'handoff-package.invalid', extracted, rehydrated, notice: firstFinding(rehydrated.findings) || 'Claimed Handoff package failed package inspection.' });
  }
  const importPlan = buildExportPackageImportPlan(rehydrated.bundle, { inspection: rehydrated.inspection });
  const applyResult = buildExportPackageApplyResult(rehydrated.bundle, { importPlan });
  if (importPlan.status === 'blocked' || applyResult.status === 'blocked') {
    return Object.freeze({ detected: true, ok: false, error: 'handoff-package.import-blocked', extracted, rehydrated, importPlan, applyResult, notice: firstFinding(importPlan.findings) || 'Handoff package import is blocked.' });
  }
  return Object.freeze({
    detected: true,
    ok: true,
    extracted,
    rehydrated,
    importPlan,
    applyResult,
    boundary: 'Exact operational Handoff package intake. One archive decode owner feeds bounded package detection; shared rehydration/inspection/import/apply own package interpretation; Site only applies qualified outputs through workspace lifecycle.'
  });
}

export function applyOperationalHandoffPackageToWorkspace(input = {}) {
  if (input.handoff?.kind === 'recipient-v2') return applyRecipientFacingV2Handoff(input);
  const lifecycle = input.lifecycle;
  const state = input.state;
  const handoff = input.handoff;
  const options = input.options || {};
  if (!lifecycle || !handoff?.ok) return { ok: false, error: 'handoff-package.apply.input-invalid', state, notice: 'Handoff package could not be applied.' };
  const plan = handoff.importPlan || {};
  const adapterResult = handoff.applyResult?.adapterResult || {};
  const context = plan.workspaceContext || {};
  const workspaceEntry = (adapterResult.workspaceEntries || [])[0] || null;
  const requestedWorkspaceId = uniqueHandoffWorkspaceId(state, String(context.id || '').trim(), String(plan.packageId || '').trim());

  let opened;
  if (workspaceEntry?.markdown && lifecycle.openWorkspaceFromMarkdown) {
    opened = lifecycle.openWorkspaceFromMarkdown(state, workspaceEntry.markdown, {
      id: requestedWorkspaceId || undefined,
      title: context.title || context.name || workspaceEntry.title || 'Imported handoff',
      path: workspaceEntry.path || context.workspaceImport?.path || 'workspace.workspace.md',
      sourceMode: 'package-import-workspace-file'
    }, options);
  } else if (lifecycle.createWorkspace) {
    opened = lifecycle.createWorkspace(state, { id: requestedWorkspaceId || undefined, name: context.title || context.name || 'Imported handoff' }, options);
  }
  if (!opened?.ok) return { ok: false, error: opened?.error || 'handoff-package.workspace-open-failed', state, handoff, notice: 'Could not create the Handoff workspace through the canonical lifecycle.' };

  let nextState = opened.state;
  let workspaceId = opened.workspace?.id || context.id || '';
  const recordResult = (adapterResult.records || []).length ? lifecycle.addWorkspaceRecords?.(nextState, workspaceId, adapterResult.records, options) : null;
  if (recordResult?.ok) nextState = recordResult.state;
  else if ((adapterResult.records || []).length) return { ok: false, error: recordResult?.error || 'handoff-package.records-apply-failed', state, handoff, notice: 'Could not restore Handoff local artifacts.' };

  const sourceRows = (Array.isArray(context.sources) ? context.sources : []).filter((source) => source && source.id !== 'local' && source.adapterId);
  for (const source of sourceRows) {
    const registered = lifecycle.addWorkspaceSource?.(nextState, workspaceId, {
      id: source.id,
      label: source.label,
      adapterId: source.adapterId,
      sourceKind: source.sourceKind,
      repository: source.repo,
      ref: source.ref,
      requestedRef: source.requestedRef,
      materializedCommit: source.materializedCommit,
      rootPath: source.rootPath,
      boundary: source.boundary,
      repoDiscovery: source.repoDiscovery,
      issueDiscovery: source.issueDiscovery,
      issueUrls: source.issueUrls,
      explicitFileRefs: source.explicitFileRefs,
      discoveryState: 'deferred'
    }, { ...options, sourceIdentityPolicy: 'refine-existing' });
    if (registered?.ok) nextState = registered.state;
  }

  // Shared package apply returns exact binary Uint8Array values, while current workspace lifecycle/persistence is JSON-shaped.
  // Normalize only the Site-local asset representation to byte arrays so exact bytes survive later clone/persistence/reopen;
  // shared package byte owners already accept arrays on subsequent export.
  const localAssets = (adapterResult.assets || []).map(jsonSafePackageAsset);
  const assetResult = localAssets.length ? lifecycle.addWorkspaceAssets?.(nextState, workspaceId, localAssets, options) : null;
  if (assetResult?.ok) nextState = assetResult.state;
  else if (localAssets.length) return { ok: false, error: assetResult?.error || 'handoff-package.assets-apply-failed', state, handoff, notice: 'Could not restore Handoff local assets.' };

  const next = nextState;
  const workspace = (next.workspaces || []).find((item) => item.id === workspaceId) || lifecycle.activeWorkspace?.(next);
  if (!workspace) return { ok: false, error: 'handoff-package.workspace-missing-after-apply', state, handoff, notice: 'Handoff workspace disappeared during import.' };
  workspaceId = workspace.id;
  workspace.workspaceImport = Object.assign({}, workspace.workspaceImport || {}, {
    schema: 'tiinex.workspace.import.v1',
    sourceMode: 'package-import-workspace-file',
    boundary: 'browser-local Handoff package import; package source references remain reference-only descriptors',
    handoffPackageId: plan.packageId || '',
    handoffPackageRepresentationSha256: plan.fileMap?.representationSha256 || '',
    packageSourceReferences: (plan.sourceReferences || []).map(compactSourceReference)
  });
  workspace.workspaceMemberBindings = Array.isArray(context.workspaceMemberBindings) ? context.workspaceMemberBindings.map((binding) => structuredCloneSafe(binding)) : (workspace.workspaceMemberBindings || []);
  const desiredSourceOrder = ['local', ...(Array.isArray(context.sourceOrder) ? context.sourceOrder : []).filter((id) => id && id !== 'local')];
  workspace.sourceOrder = [...new Set([...desiredSourceOrder.filter((id) => (workspace.sources || []).some((source) => source.id === id)), ...(workspace.sources || []).map((source) => source.id)])];
  workspace.packageWorkspaceContext = compactWorkspaceContext(context);
  workspace.importResults = Array.isArray(workspace.importResults) ? workspace.importResults.slice() : [];
  workspace.importResults.unshift({
    schema: 'tiinex.workspace.import.result.v1', ok: true,
    message: `Imported Handoff package ${plan.packageId || ''}.`,
    counts: { records: adapterResult.records?.length || 0, assets: adapterResult.assets?.length || 0, workspaceEntries: adapterResult.workspaceEntries?.length || 0, sourceReferences: plan.sourceReferences?.length || 0, warnings: plan.counts?.warnings || 0, errors: 0 },
    diagnostics: { handoffPackage: true, packageId: plan.packageId || '', packageRepresentationSha256: plan.fileMap?.representationSha256 || '', sourceReferenceCount: plan.sourceReferences?.length || 0, noRemoteFetch: true, noSourceMutation: true },
    at: typeof options.clock === 'function' ? options.clock() : new Date().toISOString()
  });
  next.activeWorkspaceId = workspaceId;
  return {
    ok: true,
    state: next,
    workspace,
    workspaceId,
    handoff,
    adapterResult,
    notice: `Imported Handoff package · ${adapterResult.records?.length || 0} local artifact${adapterResult.records?.length === 1 ? '' : 's'} · ${adapterResult.assets?.length || 0} asset${adapterResult.assets?.length === 1 ? '' : 's'} · ${plan.sourceReferences?.length || 0} source reference${plan.sourceReferences?.length === 1 ? '' : 's'}.`
  };
}


function jsonSafePackageAsset(asset = {}) {
  const bytes = asset?.bytes;
  const byteArray = bytes instanceof Uint8Array
    ? Array.from(bytes)
    : ArrayBuffer.isView(bytes)
      ? Array.from(new Uint8Array(bytes.buffer, bytes.byteOffset, bytes.byteLength))
      : bytes instanceof ArrayBuffer
        ? Array.from(new Uint8Array(bytes))
        : Array.isArray(bytes) ? bytes.slice() : bytes;
  return Object.assign({}, asset, byteArray === undefined ? {} : { bytes: byteArray });
}

function uniqueHandoffWorkspaceId(state = {}, preferred = '', packageId = '') {
  const ids = new Set((Array.isArray(state?.workspaces) ? state.workspaces : []).map((workspace) => String(workspace?.id || '')).filter(Boolean));
  const base = preferred || `handoff-${String(packageId || 'package').replace(/[^a-z0-9_-]+/gi, '-').slice(0, 36) || 'package'}`;
  if (!ids.has(base)) return base;
  const suffix = String(packageId || 'import').replace(/[^a-z0-9]+/gi, '').slice(-10) || 'import';
  let candidate = `${base}--handoff-${suffix}`;
  let serial = 2;
  while (ids.has(candidate)) { candidate = `${base}--handoff-${suffix}-${serial}`; serial += 1; }
  return candidate;
}

function compactSourceReference(reference = {}) {
  return {
    schema: String(reference.schema || 'tiinex.export.package.import.source-reference.v2'),
    materialKind: String(reference.materialKind || ''), id: String(reference.id || ''), title: String(reference.title || ''), status: String(reference.status || ''), boundary: String(reference.boundary || ''),
    target: structuredCloneSafe(reference.target || {}), packagePath: String(reference.packagePath || '')
  };
}

function compactWorkspaceContext(context = {}) {
  return {
    schema: String(context.schema || ''), id: String(context.id || ''), title: String(context.title || context.name || ''), name: String(context.name || context.title || ''),
    sourceOrder: Array.isArray(context.sourceOrder) ? context.sourceOrder.map(String) : [], materialMembership: structuredCloneSafe(context.materialMembership || {}), boundary: String(context.boundary || '')
  };
}

function structuredCloneSafe(value) { return JSON.parse(JSON.stringify(value || {})); }
function firstFinding(findings = []) { return String((findings || []).find((finding) => finding?.severity === 'error')?.message || (findings || [])[0]?.message || '').trim(); }
