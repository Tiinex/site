import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prepareNodeHandoffManufacturingInput } from '../node/handoff.manufacture.js';
import { projectHandoffHumanOutput } from '../../handoff/carrierProjection.js';
import { writePortableRuntimePackageZip } from '../../output/node.zip.js';

export async function prepareHandoffManufactureCliCommand(parsed = {}, runtime = {}) {
  const flags = parsed.flags || {};
  const workspaceRoot = flags.workspace || parsed.positionals?.[0] || '.';
  const handoffPath = flags.handoff || parsed.positionals?.[1] || '';
  const materialBindings = await readOptionalJson(flags['material-bindings'] || flags.materials);
  const expectedToolingBootstrap = await readOptionalJson(flags['tooling-bootstrap-manifest']);
  const workspaceDescriptorValue = await readOptionalJson(flags['workspace-roots'] || flags['workspace-descriptors']);
  const routeDescriptorValue = await readOptionalJson(flags['workspace-routes'] || flags['handoff-route-descriptors']);
  const additionalWorkspaces = [
    ...splitFlag(flags['additional-workspaces']),
    ...descriptorArray(workspaceDescriptorValue, 'workspaces')
  ];
  const handoffRoutes = [
    ...splitFlag(flags['handoff-routes'] || flags.routes),
    ...descriptorArray(routeDescriptorValue, 'routes')
  ];
  const verifyRoundtrip = !flags['no-roundtrip'];
  const input = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    handoffPath,
    handoffRoutes,
    additionalWorkspaces,
    workspaceId: flags['workspace-id'] || '',
    workspaceTitle: flags['workspace-title'] || flags.title || '',
    toolingBootstrap: flags['tooling-bootstrap'] || 'embedded',
    expectedToolingBootstrap,
    materialBindings,
    referenceTargets: splitFlag(flags['reference-targets']),
    maxFiles: flags['max-files'],
    bootstrapMaxFiles: flags['bootstrap-max-files'],
    verifyRoundtrip
  }, runtime);
  return {
    input,
    options: {
      verifyRoundtrip,
      packageInput: { builtAt: flags['built-at'] || undefined }
    }
  };
}

export async function materializeHandoffManufactureCliOutput(result = {}, flags = {}) {
  const humanOutput = projectHandoffHumanOutput({
    projection: result.carrierProjection || {},
    route: flags.route || '',
    collisionInstance: flags['collision-instance'] || 1
  });
  const wantsWrite = Boolean(flags.output || flags['output-dir']);
  if (!wantsWrite) return summarizeHandoffManufactureCliOutput(result, {}, humanOutput, null);
  const shared = result.carrierProjection?.mode === 'shared';
  if ((shared || flags['output-dir'] || flags['transport-text']) && humanOutput.status !== 'ready') throw new Error(humanOutput.status === 'selection-required' ? 'portable.cli.handoff-carrier.route-selection.required' : 'portable.cli.handoff-carrier.output.blocked');
  const target = flags.output
    ? path.resolve(String(flags.output))
    : path.resolve(String(flags['output-dir']), humanOutput.primary.filename);
  const writeReceipt = await writePortableRuntimePackageZip(result.bundle, target);
  const transportTextReceipt = flags['transport-text'] ? await writeTransportTextSidecar(humanOutput, target, flags['transport-text']) : null;
  return summarizeHandoffManufactureCliOutput(result, writeReceipt, humanOutput, transportTextReceipt);
}

export function summarizeHandoffManufactureCliOutput(result = {}, writeReceipt = {}, humanOutput = null, transportTextReceipt = null) {
  const summarizeRequirement = (item = {}) => Object.freeze({
    requirementId: String(item.requirementId || ''),
    classification: String(item.classification || ''),
    disposition: String(item.disposition || ''),
    referenceTarget: String(item.referenceTarget || ''),
    selectedPath: String(item.selectedMaterial?.path || ''),
    selectedSha256: String(item.selectedMaterial?.sha256 || ''),
    providerId: String(item.selectedMaterial?.provider?.id || '')
  });
  const summarizeWorkspace = (item = {}) => Object.freeze({
    id: String(item.id || ''),
    materialization: String(item.materialization || ''),
    qualification: String(item.qualification || ''),
    entryCount: Array.isArray(item.includedEntries) ? item.includedEntries.length : 0,
    completenessState: String(item.completenessEvidence?.state || ''),
    completenessProof: String(item.completenessEvidence?.proof || '')
  });
  const bootstrapInspection = result.toolingBootstrapInspection || {};
  const projection = result.carrierProjection || {};
  const routeSummary = Object.freeze((projection.routes || []).map((route) => Object.freeze({
    id: String(route.id || ''),
    state: String(route.state || ''),
    workspaceId: String(route.workspaceId || ''),
    workspaceRelativePath: String(route.workspaceRelativePath || ''),
    dimension: String(route.dimension || ''),
    from: String(route.parties?.from || ''),
    to: String(route.parties?.to || ''),
    projectedFilename: String(route.projectedFilename || '')
  })));
  return Object.freeze({
    schema: result.schema || 'tiinex.portable.operation.result.v1',
    operation: String(result.operation || 'manufacture-handoff-package'),
    resultSchema: String(result.resultSchema || ''),
    status: String(result.status || 'unknown'),
    executable: Boolean(result.executable),
    transportExecutable: Boolean(result.transportExecutable),
    verification: Object.freeze({ ...(result.verification || {}) }),
    planSummary: Object.freeze({
      status: String(result.plan?.status || 'unknown'),
      requiredClosureReady: Boolean(result.plan?.requiredClosureReady),
      semanticHandoffStatus: String(result.plan?.semanticHandoffStatus || 'unknown'),
      required: Object.freeze((result.plan?.requirements?.required || []).map(summarizeRequirement)),
      reference: Object.freeze((result.plan?.requirements?.reference || []).map(summarizeRequirement)),
      workspaces: Object.freeze((result.plan?.workspaceMaterializations || []).map(summarizeWorkspace))
    }),
    carrierProjection: Object.freeze({
      status: String(projection.status || 'unknown'),
      mode: String(projection.mode || ''),
      workspaces: Object.freeze((projection.workspaces || []).map((workspace) => Object.freeze({ ...workspace }))),
      workspace: Object.freeze({ ...(projection.workspace || {}) }),
      selection: Object.freeze({ ...(projection.selection || {}) }),
      routes: routeSummary
    }),
    humanOutput: humanOutput ? Object.freeze({
      status: humanOutput.status,
      primary: humanOutput.primary,
      normalInlineRouting: humanOutput.normalInlineRouting ? Object.freeze({ ...humanOutput.normalInlineRouting }) : null,
      fallbackTransportText: humanOutput.fallbackTransportText ? Object.freeze({ ...humanOutput.fallbackTransportText, content: undefined }) : null
    }) : null,
    toolingBootstrap: result.toolingBootstrap || null,
    manufacturingEvidence: result.manufacturingEvidence || null,
    toolingBootstrapInspection: Object.freeze({
      schema: String(bootstrapInspection.schema || ''),
      status: String(bootstrapInspection.status || 'unknown'),
      delivery: String(bootstrapInspection.delivery || 'unknown'),
      counts: Object.freeze({ ...(bootstrapInspection.counts || {}) }),
      qualification: Object.freeze({ ...(bootstrapInspection.qualification || {}) })
    }),
    roundtripSummary: result.roundtrip ? Object.freeze({
      schema: String(result.roundtrip.schema || ''),
      status: String(result.roundtrip.status || 'unknown'),
      verification: Object.freeze({ ...(result.roundtrip.verification || {}) }),
      runtimeStatus: String(result.roundtrip.runtime?.status || '')
    }) : null,
    findings: Object.freeze((result.findings || []).map((finding) => Object.freeze({
      severity: String(finding.severity || ''),
      code: String(finding.code || ''),
      message: String(finding.message || '')
    }))),
    findingSummary: result.findingSummary || null,
    boundary: String(result.boundary || ''),
    writeReceipt: writeReceipt?.status ? writeReceipt : null,
    primaryOutput: writeReceipt?.status ? Object.freeze({ ...writeReceipt, projectedFilename: String(humanOutput?.primary?.filename || ''), selectedRoute: String(humanOutput?.primary?.workspaceRelativeHandoffPath || '') }) : null,
    transportTextSidecar: transportTextReceipt
  });
}

async function writeTransportTextSidecar(humanOutput, packageTarget, flagValue) {
  const target = flagValue === true
    ? defaultSidecarPath(packageTarget)
    : path.resolve(String(flagValue));
  await mkdir(path.dirname(target), { recursive: true });
  const content = String(humanOutput.fallbackTransportText?.content || '');
  await writeFile(target, content, 'utf8');
  return Object.freeze({ schema: 'tiinex.portable.handoff-transport-text-write.v1', status: 'written', path: target, bytes: Buffer.byteLength(content, 'utf8'), authority: 'none', normalEmission: false });
}
function defaultSidecarPath(packageTarget) {
  const suffix = '.handoff-package.zip';
  return packageTarget.toLowerCase().endsWith(suffix) ? `${packageTarget.slice(0, -suffix.length)}.transport.txt` : `${packageTarget}.transport.txt`;
}
async function readOptionalJson(file = '') { if (!file) return {}; return JSON.parse(await readFile(file, 'utf8')); }
function descriptorArray(value, key) { if (Array.isArray(value)) return value; if (Array.isArray(value?.[key])) return value[key]; return []; }
function splitFlag(value) { if (!value || value === true) return []; return String(value).split(',').map((item) => item.trim()).filter(Boolean); }
