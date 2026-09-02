import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { inspectRecipientFacingV2PackageV1 } from '../../handoff/recipientV2.packageV1.inspect.js';
import { handoffWorkspaceProviderForId } from '../../handoff/workspaceByteProvider.js';

export function groundContinuationOperationInput(input = {}, flags = {}) {
  return Object.freeze({
    ...input,
    includeRequiredContext: flags['include-required-context'] || (flags.continue ? 'all' : input.includeRequiredContext || ''),
    includeCurrentWork: Boolean(flags['include-current-work'] || flags.continue || input.includeCurrentWork)
  });
}

export async function materializeGroundWorkspaceCliOutput(result = {}, input = {}, flags = {}) {
  const outputValue = stringFlag(flags.continue) || stringFlag(flags['materialize-workspace']) || stringFlag(flags['workspace-output']);
  if (!outputValue) {
    if (flags.continue === true) throw new Error('portable.cli.ground.continue-output.required');
    if (flags['materialize-workspace'] === true) throw new Error('portable.cli.ground.workspace-output.required');
    return result;
  }
  if (String(result?.readiness?.state || '') !== 'grounded-to-act') throw new Error('portable.cli.ground.workspace-materialization.requires-grounded-to-act');
  const inspection = inspectRecipientFacingV2PackageV1(input.bundle || input.package || input);
  if (String(inspection.status || '') !== 'valid') throw new Error('portable.cli.ground.workspace-materialization.package-unqualified');
  const workspaceId = String(flags.workspace || result?.authority?.route?.workspaceId || '').trim();
  if (!workspaceId) throw new Error('portable.cli.ground.workspace-id.required');
  const workspace = handoffWorkspaceProviderForId(inspection.workspaceByteProvider, workspaceId);
  if (String(workspace.state || '') !== 'qualified') throw new Error(`portable.cli.ground.workspace-unqualified:${workspaceId}`);

  const outputDir = path.resolve(outputValue);
  await ensureEmptyOutputDirectory(outputDir);
  let totalBytes = 0;
  for (const entry of workspace.entries || []) {
    const target = safeTarget(outputDir, String(entry.path || ''));
    await mkdir(path.dirname(target), { recursive: true });
    const data = byteView(entry.data);
    await writeFile(target, data);
    totalBytes += data.byteLength;
  }
  const selectedLeafPath = String(result?.lineage?.selectedRouteLeaves?.[0]?.path || '');
  const selectedHandoffPath = selectedLeafPath.startsWith(`${workspaceId}/`) ? selectedLeafPath.slice(workspaceId.length + 1) : '';
  const workspaceInspection = (inspection.workspaces || []).find((item) => String(item.workspaceId || '') === workspaceId) || {};
  const continuationState = Object.freeze({
    schema: 'tiinex.portable.ground-continuation-state.v1',
    version: 1,
    packageParentPath: path.resolve(String(input.packageSourcePath || '')),
    selectedRoutePointer: String(result?.authority?.route?.pointerPath || input.route || ''),
    selectedRouteId: String(result?.authority?.route?.id || ''),
    selectedHandoffPath,
    workspaceId,
    workspaceTarget: String(workspaceInspection.sourceWorkspaceTargetInnerPath || ''),
    roleLabel: String(result?.authority?.role?.label || ''),
    returnOutputDir: path.dirname(path.resolve(String(input.packageSourcePath || outputDir))),
    boundary: 'Runtime-only continuation state carried forward from one qualified ground --continue receipt. It is excluded from canonical Workspace manufacture and is not semantic authority.'
  });
  const continuationStatePath = path.join(outputDir, '.tiinex', 'continuation.json');
  await mkdir(path.dirname(continuationStatePath), { recursive: true });
  await writeFile(continuationStatePath, `${JSON.stringify(continuationState, null, 2)}\n`, 'utf8');
  const materialization = Object.freeze({
    schema: 'tiinex.portable.ground-workspace-materialization.v1',
    state: 'materialized',
    workspaceId,
    outputDir,
    fileCount: (workspace.entries || []).length,
    totalBytes,
    archivePackagePath: String(workspace.archive?.packagePath || workspace.archive?.location || ''),
    coverage: String(workspace.materialization?.materialization || workspace.materialization?.coverage || 'complete'),
    entriesFingerprint: String(workspace.materialization?.completenessEvidence?.entriesFingerprint || workspace.binding?.completeness?.entriesFingerprint || ''),
    continuationStatePath,
    sourceMutation: false,
    remoteWrite: false,
    boundary: 'Local exact-byte materialization of one already-qualified carried Workspace plus runtime-only .tiinex continuation state. The runtime state is excluded from canonical Workspace manufacture; no package content is executed, semantic authority is not inferred from filenames or output placement, and the input carrier remains untouched.'
  });
  return Object.freeze({ ...result, continuationMaterialization: materialization });
}

async function ensureEmptyOutputDirectory(outputDir) {
  await mkdir(outputDir, { recursive: true });
  const existing = await readdir(outputDir);
  if (existing.length) throw new Error(`portable.cli.ground.workspace-output.not-empty:${outputDir}`);
}

function safeTarget(root, relative) {
  const target = path.resolve(root, relative);
  const rel = path.relative(root, target);
  if (!relative || rel === '' || rel.startsWith(`..${path.sep}`) || rel === '..' || path.isAbsolute(rel)) throw new Error(`portable.cli.ground.workspace-path.unsafe:${relative}`);
  return target;
}

function byteView(value) {
  if (value instanceof Uint8Array) return value;
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  throw new Error('portable.cli.ground.workspace-entry.bytes-unavailable');
}

function stringFlag(value) { return typeof value === 'string' && value.trim() ? value.trim() : ''; }
