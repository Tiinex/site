import { portableFinding, summarizePortableFindings } from '../findings.js';
import { discoverPortableHostCapabilities, portableTaskRoute } from '../host/host.capabilities.js';
import { resolvePortableSchemaChainMaterial } from '../providers/schema.providers.js';
import { buildPortableSchemaGuide, planPortableArtifact } from '../schema/schema.guide.js';
import { validatePortableDraft } from '../draft/draft.operations.js';
import { searchPortableLineage } from '../lineage/lineage.search.js';
import { preparePortableAssetAnalysis } from '../assets/asset.operations.js';
import { planPortableHostAction } from '../host/tool.bindings.js';

export const PORTABLE_TASK_PREPARATION_SCHEMA_ID = 'tiinex.portable.task-preparation.v1';

export async function preparePortableTask(input = {}, options = {}) {
  const task = normalizeTask(input.task || input.intent || input.goal || options.task || 'inspect');
  const hostDiscovery = discoverPortableHostCapabilities(input.host || input, options.host || options);
  const findings = [...(hostDiscovery.findings || [])];
  const route = portableTaskRoute(routeTask(task), hostDiscovery.profile);
  let result = null;
  let status = 'ready';
  let nextAction = null;

  if (['read-schema', 'create-artifact', 'validate-draft'].includes(task)) {
    const schemaId = String(input.schemaId || options.schemaId || '').trim();
    if (!schemaId) findings.push(portableFinding('error', 'portable.task.schema.required', `Task ${task} requires a schema id.`));
    if (schemaId) {
      const chain = await resolvePortableSchemaChainMaterial({ ...input, schemaId }, options);
      findings.push(...(chain.findings || []));
      if (chain.status === 'provider-action-required') {
        status = 'provider-action-required';
        const hostActionPlan = planPortableHostAction({ ...input, action: 'repository-schema-resolution', request: chain.providerRequest, host: input.host || input }, options);
        findings.push(...(hostActionPlan.findings || []));
        nextAction = Object.freeze({ ...chain.providerRequest, hostActionPlan });
        result = Object.freeze({ schemaChain: chain, hostActionPlan });
      } else {
        const context = { ...input, files: chain.materials.files, schemaCache: chain.materials.schemaCache, schemaId };
        if (task === 'read-schema') {
          const guide = buildPortableSchemaGuide({ ...context, task: input.schemaTask || 'read', detail: input.detail || 'compact' }, options);
          findings.push(...(guide.findings || []));
          result = Object.freeze({ schemaChain: chain, guide: guide.guide });
          status = guide.findings.some((finding) => finding.severity === 'error') ? 'blocked' : 'ready';
          nextAction = Object.freeze({ operation: 'schema-guide', reason: 'Readable schema material is resolved and a compact guide is available.' });
        } else if (task === 'create-artifact') {
          const plan = planPortableArtifact({ ...context, task: 'create', values: input.values || input.inputs || {} }, options);
          findings.push(...(plan.findings || []));
          result = Object.freeze({ schemaChain: chain, guide: plan.guide, plan: plan.plan });
          status = plan.plan.readyToDraft ? 'ready-to-create-local-draft' : 'authoring-input-required';
          nextAction = Object.freeze({
            operation: plan.plan.readyToDraft ? 'create-local-draft' : 'collect-required-inputs',
            missingInputs: plan.plan.missingInputs,
            conditionReviewRequired: plan.plan.conditionReviewRequired
          });
        } else {
          const validation = validatePortableDraft({ ...context, markdown: input.markdown || input.draft?.markdown || '', path: input.path || input.draft?.path || 'draft.md' }, options);
          findings.push(...(validation.findings || []));
          result = Object.freeze({ schemaChain: chain, validation });
          status = validation.status;
          nextAction = Object.freeze({ operation: validation.status === 'clean' ? 'stage-draft' : 'repair-plan' });
        }
      }
    }
  } else if (task === 'search-lineage') {
    const search = searchPortableLineage(input, options);
    findings.push(...(search.findings || []));
    result = Object.freeze({ search });
    status = 'ready';
    nextAction = Object.freeze({ operation: 'search-lineage', returnedMatches: search.matches.length, totalMatches: search.page.total });
  } else if (task === 'analyze-asset') {
    const prepared = preparePortableAssetAnalysis(input, options);
    findings.push(...(prepared.findings || []));
    result = Object.freeze({ assetAnalysis: prepared });
    status = prepared.status;
    const action = prepared.request?.requiredCapability === 'multimodal.pdf' ? 'pdf-analysis' : 'image-analysis';
    const hostActionPlan = prepared.request ? planPortableHostAction({ ...input, action, request: prepared.request, host: input.host || input }, options) : null;
    if (hostActionPlan) findings.push(...(hostActionPlan.findings || []));
    nextAction = prepared.request ? Object.freeze({ ...prepared.request.hostAction, hostActionPlan }) : null;
  } else if (task === 'materialize-findings') {
    const { planPortableDurableMaterialization } = await import('../materialization/durable.materialize.js');
    const plan = planPortableDurableMaterialization(input);
    findings.push(...(plan.findings || []));
    result = Object.freeze({ materializationPlan: plan });
    status = plan.status;
    nextAction = Object.freeze({
      operation: plan.status === 'ready' ? 'materialize-durable-findings' : 'collect-materialization-map',
      unassignedFindings: plan.unassignedFindings?.length || 0
    });
  } else if (task === 'checkpoint') {
    const session = input.session || input.snapshot || input;
    result = Object.freeze({
      sessionSummary: Object.freeze({
        stagedArtifacts: session.stagedArtifacts?.length || 0,
        durableFindings: session.durableFindings?.length || 0,
        schemaCacheEntries: session.schemaCache?.length || 0
      })
    });
    status = 'ready';
    nextAction = Object.freeze({ operation: 'create-checkpoint', canonicalHandoffArtifact: false });
  } else if (task === 'package') {
    const session = input.session || input.snapshot || {};
    const stagedCount = (input.stagedArtifacts || session.stagedArtifacts || []).length;
    result = Object.freeze({ stagedArtifacts: stagedCount, runtimeContract: 'tiinex.export.package.bundle.v1', canonicalPackageSchemaLocked: false });
    status = stagedCount ? 'ready' : 'material-required';
    nextAction = Object.freeze({ operation: stagedCount ? 'build-runtime-package' : 'stage-draft', then: stagedCount ? 'roundtrip-runtime-package' : 'build-runtime-package' });
  } else {
    result = Object.freeze({
      operations: Object.freeze(['inspect', 'audit', 'search-lineage', 'read-schema', 'create-artifact', 'validate-draft', 'analyze-asset', 'materialize-findings', 'checkpoint', 'package'])
    });
    status = task === 'inspect' ? 'ready' : 'unknown-task';
    nextAction = Object.freeze({ operation: task === 'inspect' ? 'inspect' : 'discover-tooling' });
  }

  const summary = summarizePortableFindings(findings);
  if (summary.counts.error && status !== 'provider-action-required') status = 'blocked';
  return Object.freeze({
    schema: PORTABLE_TASK_PREPARATION_SCHEMA_ID,
    task,
    status,
    route,
    host: hostDiscovery.profile,
    result,
    nextAction,
    boundary: Object.freeze({
      remoteFetch: 'host-mediated-only',
      remoteWrite: false,
      sourceMutation: false,
      hiddenChatStateIsProvenance: false
    }),
    findings: Object.freeze(findings),
    findingSummary: summary
  });
}

function normalizeTask(value = '') {
  const task = String(value || '').trim().toLowerCase().replace(/[_\s]+/g, '-');
  const aliases = {
    create: 'create-artifact',
    write: 'create-artifact',
    'create-draft': 'create-artifact',
    schema: 'read-schema',
    'resolve-schema': 'read-schema',
    validate: 'validate-draft',
    repair: 'validate-draft',
    search: 'search-lineage',
    lineage: 'search-lineage',
    image: 'analyze-asset',
    asset: 'analyze-asset',
    'analyze-image': 'analyze-asset',
    materialize: 'materialize-findings',
    'materialize-durable-findings': 'materialize-findings',
    checkpoint: 'checkpoint',
    package: 'package',
    'build-package': 'package'
  };
  return aliases[task] || task || 'inspect';
}

function routeTask(task) {
  if (task === 'read-schema') return 'resolve-unknown-schema';
  if (task === 'create-artifact') return 'create-local-draft';
  if (task === 'validate-draft') return 'create-local-draft';
  if (task === 'search-lineage') return 'search-lineage';
  if (task === 'analyze-asset') return 'analyze-image-asset';
  if (task === 'materialize-findings') return 'materialize-durable-findings';
  if (task === 'checkpoint') return 'create-checkpoint';
  if (task === 'package') return 'build-runtime-package';
  return 'load-material';
}
