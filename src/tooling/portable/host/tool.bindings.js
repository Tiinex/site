import { portableFinding, summarizePortableFindings } from '../findings.js';
import { normalizeInterpretations, normalizeList, normalizeLocalFiles, normalizeRepositoryFiles, serializableSchema } from './tool.receiptNormalization.js';

export const PORTABLE_TOOL_BINDINGS_SCHEMA_ID = 'tiinex.portable.tool-bindings.v1';
export const PORTABLE_HOST_ACTION_PLAN_SCHEMA_ID = 'tiinex.portable.host-action-plan.v1';
export const PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID = 'tiinex.portable.host-action-receipt.v1';
export const PORTABLE_HOST_ACTION_ACCEPTANCE_SCHEMA_ID = 'tiinex.portable.host-action-acceptance.v1';

const CAPABILITIES = Object.freeze({
  attachments: capability('attachments', [/attachment/, /uploaded file/, /project source/]),
  projectSources: capability('projectSources', [/project source/, /file library/]),
  filesystemRead: capability('filesystemRead', [/filesystem/, /read file/, /open file/, /container/, /shell/, /terminal/]),
  archiveRead: capability('archiveRead', [/\bzip\b/, /archive/, /extract/, /unpack/]),
  repositorySearch: capability('repositorySearch', [/github.*search/, /repository.*search/, /search.*repository/, /search files.*repo/, /code search/], [/web search/, /news search/, /product search/]),
  repositoryRead: capability('repositoryRead', [/github.*fetch/, /fetch file/, /repository content/, /read.*github/, /read.*repository/, /repo.*file/]),
  repositoryWrite: capability('repositoryWrite', [/github.*create/, /github.*update/, /repository.*write/, /write.*repository/, /create.*repository file/, /update.*repository file/]),
  httpRead: capability('httpRead', [/http/, /web fetch/, /download url/, /open url/]),
  javascript: capability('javascript', [/javascript/, /\bnode\b/, /code execution/, /python/]),
  shell: capability('shell', [/shell/, /terminal/, /container/, /exec/]),
  images: capability('images', [/vision/, /image analysis/, /open image/, /multimodal/, /screenshot/]),
  pdf: capability('pdf', [/pdf/, /screenshot.*page/, /render.*pdf/]),
  filesystemWrite: capability('filesystemWrite', [/write file/, /save file/, /filesystem.*write/, /create.*local file/], [/github/, /repository/, /remote write/]),
  remoteWriteAvailable: capability('remoteWriteAvailable', [/github.*create/, /github.*update/, /remote write/, /create.*repository file/, /update.*repository file/]),
  artifactReturn: capability('artifactReturn', [/return.*artifact/, /return.*file/, /artifact.*output/, /download.*file/, /attach.*output/]),
  humanConfirmation: capability('humanConfirmation', [/human.*confirm/, /ask.*user/, /request.*approval/, /confirmation.*prompt/, /user.*approval/]),
  authenticationRequest: capability('authenticationRequest', [/request.*authentication/, /oauth/, /sign[ -]?in request/, /authentication.*prompt/]),
  copyableTextPresentation: capability('copyableTextPresentation', [/copyable.*text/, /clipboard/, /code block/, /copy.*text/, /text.*presentation/])
});

const ACTIONS = Object.freeze({
  'repository-schema-resolution': Object.freeze({
    aliases: ['repository-search-and-read', 'resolve-schema-material', 'resolve-unknown-schema'],
    steps: ['repositorySearch', 'repositoryRead']
  }),
  'repository-search': Object.freeze({ aliases: ['repositorysearch'], steps: ['repositorySearch'] }),
  'repository-read': Object.freeze({ aliases: ['repositoryread'], steps: ['repositoryRead'] }),
  'repository-write': Object.freeze({ aliases: ['repositorywrite'], steps: ['repositoryWrite'], requiresAuthorization: true }),
  'filesystem-read': Object.freeze({ aliases: ['filesystemread', 'read-file'], steps: ['filesystemRead'] }),
  'archive-read': Object.freeze({ aliases: ['archiveread', 'extract-archive'], steps: ['archiveRead'] }),
  'image-analysis': Object.freeze({ aliases: ['images', 'multimodal.images', 'open-image-with-host-vision'], steps: ['images'] }),
  'pdf-analysis': Object.freeze({ aliases: ['pdf', 'multimodal.pdf', 'open-or-render-pdf-with-host-reader'], steps: ['pdf'] }),
  'filesystem-write': Object.freeze({ aliases: ['filesystemwrite', 'write-file'], steps: ['filesystemWrite'] }),
  'artifact-return': Object.freeze({ aliases: ['artifactreturn', 'return-artifact'], steps: ['artifactReturn'] }),
  'human-confirmation': Object.freeze({ aliases: ['humanconfirmation', 'request-confirmation'], steps: ['humanConfirmation'] }),
  'authentication-request': Object.freeze({ aliases: ['authenticationrequest', 'request-authentication'], steps: ['authenticationRequest'] }),
  'copyable-text-presentation': Object.freeze({ aliases: ['copyabletextpresentation', 'present-copyable-text'], steps: ['copyableTextPresentation'] }),
  'remote-write': Object.freeze({ aliases: ['remotewriteavailable', 'publish-or-remote-write'], steps: ['remoteWriteAvailable'], requiresAuthorization: true })
});

export function normalizePortableHostTools(value = []) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((item, index) => {
    if (typeof item === 'string') return Object.freeze({ id: item, name: item, description: '', capabilities: Object.freeze([]), inputSchema: null });
    const name = String(item?.name || item?.id || item?.tool || `tool-${index + 1}`).trim();
    return Object.freeze({
      id: String(item?.id || name),
      name,
      description: String(item?.description || item?.summary || ''),
      capabilities: Object.freeze(normalizeList(item?.capabilities || item?.tags || [])),
      inputSchema: serializableSchema(item?.inputSchema || item?.parameters || null)
    });
  });
}

export function buildPortableToolBindings(input = {}, options = {}) {
  const tools = normalizePortableHostTools(input.tools || input.availableTools || options.tools || []);
  const bindings = {};
  const findings = [];
  for (const [capabilityName, descriptor] of Object.entries(CAPABILITIES)) {
    const candidates = tools
      .map((tool) => scoreTool(tool, capabilityName, descriptor))
      .filter((candidate) => candidate.score > 0)
      .sort((a, b) => b.score - a.score || a.tool.name.localeCompare(b.tool.name));
    bindings[capabilityName] = Object.freeze({
      capability: capabilityName,
      status: candidates.length ? 'bound' : 'unbound',
      selected: candidates[0] || null,
      alternatives: Object.freeze(candidates.slice(1, 4))
    });
  }
  if (tools.length && !bindings.repositorySearch.selected && bindings.repositoryRead.selected) {
    findings.push(portableFinding('info', 'portable.tool-binding.repository-search.unbound', 'A repository reader was found without a repository search tool; exact paths or a separate search capability will be required.'));
  }
  return Object.freeze({
    schema: PORTABLE_TOOL_BINDINGS_SCHEMA_ID,
    tools: Object.freeze(tools),
    bindings: Object.freeze(bindings),
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
}

export function planPortableHostAction(input = {}, options = {}) {
  const requested = normalizeAction(input.action || input.capability || input.request?.capability || options.action || '');
  const blueprint = ACTIONS[requested] || null;
  const toolBindings = input.toolBindings?.bindings
    ? input.toolBindings
    : buildPortableToolBindings(input.host || input, options.host || options);
  const findings = [...(toolBindings.findings || [])];
  if (!blueprint) findings.push(portableFinding('error', 'portable.host-action.action.unknown', 'Host action planning requires a recognized action or capability.', { action: requested }));
  const actionId = `host-action:${stableHash(stableStringify({ action: requested, request: sanitizeRequest(input.request || input.providerRequest || input) }))}`;
  const steps = (blueprint?.steps || []).map((capabilityName, index) => {
    const binding = toolBindings.bindings?.[capabilityName] || null;
    if (!binding?.selected) findings.push(portableFinding('error', 'portable.host-action.tool.unbound', 'No concrete host tool is bound for a required capability.', { capability: capabilityName, action: requested }));
    return Object.freeze({
      stepId: `${actionId}:${index + 1}`,
      capability: capabilityName,
      status: binding?.selected ? 'ready' : 'blocked',
      tool: binding?.selected?.tool || null,
      score: binding?.selected?.score || 0,
      reasons: binding?.selected?.reasons || Object.freeze([]),
      alternatives: Object.freeze((binding?.alternatives || []).map((entry) => entry.tool)),
      argumentsTemplate: argumentsTemplate(capabilityName, input.request || input.providerRequest || input),
      expectedResult: expectedResult(capabilityName)
    });
  });
  const authorized = blueprint?.requiresAuthorization ? Boolean(input.authorized || input.allowRemoteWrite || options.allowRemoteWrite) : true;
  if (blueprint?.requiresAuthorization && !authorized) findings.push(portableFinding('error', 'portable.host-action.authorization.required', 'This host action requires explicit human authorization.', { action: requested }));
  const blocked = !blueprint || steps.some((step) => step.status === 'blocked') || !authorized;
  return Object.freeze({
    schema: PORTABLE_HOST_ACTION_PLAN_SCHEMA_ID,
    actionId,
    action: requested,
    status: blocked ? (blueprint?.requiresAuthorization && !authorized ? 'authorization-required' : 'blocked') : 'ready',
    steps: Object.freeze(steps),
    receiptContract: Object.freeze({
      schema: PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID,
      actionId,
      action: requested,
      steps: Object.freeze(steps.map((step) => Object.freeze({
        stepId: step.stepId,
        toolId: step.tool?.id || '<bound tool id>',
        status: 'completed',
        normalized: expectedReceiptShape(step.capability)
      })))
    }),
    continuation: continuationFor(requested, input.request || input.providerRequest || input),
    boundary: Object.freeze({
      execution: 'performed by the host or LLM, not by this plan',
      remoteWrite: requested === 'remote-write' ? 'explicit-human-authorization-required' : false,
      sourceMutation: false,
      rawToolOutputIsNotProvenance: true,
      receiptMustBeExplicit: true
    }),
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
}

export function acceptPortableHostActionReceipt(input = {}, options = {}) {
  const plan = input.plan || input.hostActionPlan || options.plan || {};
  const receipt = input.receipt || input.hostReceipt || {};
  const priorAcceptance = input.priorAcceptance || input.previousAcceptance || options.priorAcceptance || {};
  const findings = [];
  const expectedSteps = Array.isArray(plan.steps) ? plan.steps : [];
  const actualSteps = Array.isArray(receipt.steps) ? receipt.steps : [];
  if (!plan.actionId) findings.push(portableFinding('error', 'portable.host-receipt.plan.required', 'Receipt acceptance requires the original host action plan.'));
  if (receipt.schema && receipt.schema !== PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID) findings.push(portableFinding('error', 'portable.host-receipt.schema.invalid', 'Host receipt used an unexpected schema.', { actual: receipt.schema }));
  if (plan.actionId && receipt.actionId !== plan.actionId) findings.push(portableFinding('error', 'portable.host-receipt.action-id.mismatch', 'Host receipt actionId does not match the plan.', { expected: plan.actionId, actual: receipt.actionId || '' }));
  const normalizedFiles = [];
  const interpretations = [];
  for (const expected of expectedSteps) {
    const actual = actualSteps.find((step) => step.stepId === expected.stepId);
    if (!actual) {
      findings.push(portableFinding('error', 'portable.host-receipt.step.missing', 'A required host action step is missing from the receipt.', { stepId: expected.stepId, capability: expected.capability }));
      continue;
    }
    if (actual.status !== 'completed') findings.push(portableFinding('error', 'portable.host-receipt.step.incomplete', 'A host action step did not complete.', { stepId: expected.stepId, status: actual.status || '' }));
    if (expected.tool?.id && actual.toolId && actual.toolId !== expected.tool.id) findings.push(portableFinding('warning', 'portable.host-receipt.tool.changed', 'The receipt used a different tool than the selected binding; the normalized result is accepted only through the explicit receipt.', { expectedToolId: expected.tool.id, actualToolId: actual.toolId }));
    const normalized = actual.normalized || {};
    if (expected.capability === 'repositoryRead') normalizedFiles.push(...normalizeRepositoryFiles(normalized, findings, expected.argumentsTemplate || {}));
    if (expected.capability === 'filesystemRead' || expected.capability === 'archiveRead') normalizedFiles.push(...normalizeLocalFiles(normalized, findings, expected.capability));
    if (expected.capability === 'images' || expected.capability === 'pdf') interpretations.push(...normalizeInterpretations(normalized, findings, expected.capability));
  }
  const prior = acceptedPriorMaterial(priorAcceptance, findings);
  const repositoryFiles = uniqueAcceptedFiles([
    ...prior.repositoryFiles,
    ...normalizedFiles.filter((file) => file.source?.repository)
  ]);
  const localFiles = uniqueAcceptedFiles([
    ...prior.localFiles,
    ...normalizedFiles.filter((file) => !file.source?.repository)
  ]);
  const summary = summarizePortableFindings(findings);
  const providerResponses = repositoryFiles.length
    ? Object.freeze([Object.freeze({
        providerId: 'host-repository',
        priority: 85,
        remoteFetch: true,
        files: Object.freeze(repositoryFiles)
      })])
    : Object.freeze([]);
  return Object.freeze({
    schema: PORTABLE_HOST_ACTION_ACCEPTANCE_SCHEMA_ID,
    actionId: plan.actionId || receipt.actionId || '',
    action: plan.action || receipt.action || '',
    status: summary.counts.error ? 'rejected' : 'accepted',
    providerResponses,
    material: Object.freeze({ files: Object.freeze(localFiles) }),
    interpretations: Object.freeze(interpretations),
    cumulativeRecovery: Object.freeze({
      priorAccepted: prior.accepted,
      repositoryFiles: repositoryFiles.length,
      localFiles: localFiles.length,
      boundary: 'Prior accepted recovery material is carried forward only through explicit accept-host-receipt input; no hidden session memory or cache authority is used.'
    }),
    continuation: plan.continuation || null,
    boundary: Object.freeze({
      repositorySourceRequiresExplicitReceiptMetadata: true,
      localMaterialIsNeverPromotedToRepositorySource: true,
      interpretationsAreGeneratedAndSeparateFromSourceMaterial: true,
      rawToolOutputRetainedByHostOnly: true
    }),
    findings: Object.freeze(findings),
    findingSummary: summary
  });
}

function acceptedPriorMaterial(value = {}, findings = []) {
  const prior = value?.result || value || {};
  const supplied = Boolean(prior && Object.keys(prior).length);
  if (!supplied) return Object.freeze({ accepted: false, repositoryFiles: Object.freeze([]), localFiles: Object.freeze([]) });
  if (String(prior.status || '') !== 'accepted') {
    findings.push(portableFinding('error', 'portable.host-receipt.prior-unaccepted', 'Cumulative receipt acceptance requires a previously accepted host-action result.'));
    return Object.freeze({ accepted: false, repositoryFiles: Object.freeze([]), localFiles: Object.freeze([]) });
  }
  const repositoryFiles = [];
  for (const response of Array.isArray(prior.providerResponses) ? prior.providerResponses : []) {
    for (const file of Array.isArray(response?.files) ? response.files : []) {
      if (file?.source?.receiptQualification === 'accepted-host-repository-read') repositoryFiles.push(file);
    }
  }
  const localFiles = Array.isArray(prior.material?.files) ? prior.material.files.filter(Boolean) : [];
  return Object.freeze({
    accepted: true,
    repositoryFiles: Object.freeze(repositoryFiles),
    localFiles: Object.freeze(localFiles)
  });
}

function uniqueAcceptedFiles(files = []) {
  const out = [];
  const seen = new Set();
  for (const file of files) {
    const source = file?.source || {};
    const key = [
      String(source.repository || ''),
      String(source.commit || source.ref || ''),
      String(source.path || file?.path || ''),
      String(file?.content || '')
    ].join('\u0000');
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(file);
  }
  return out;
}

function capability(name, patterns, negativePatterns = []) { return Object.freeze({ name, patterns, negativePatterns }); }

function scoreTool(tool, capabilityName, descriptor) {
  const corpus = `${tool.name} ${tool.description}`.toLowerCase();
  const explicit = tool.capabilities.map((value) => value.toLowerCase());
  let score = 0;
  const reasons = [];
  if (explicit.includes(capabilityName.toLowerCase())) { score += 120; reasons.push('explicit-capability-tag'); }
  for (const pattern of descriptor.patterns) {
    if (pattern.test(corpus)) { score += patternScore(pattern, tool.name); reasons.push(`matched:${pattern.source}`); }
  }
  for (const pattern of descriptor.negativePatterns || []) {
    if (pattern.test(corpus)) { score -= 80; reasons.push(`negative:${pattern.source}`); }
  }
  if (score > 0 && tool.name.toLowerCase().includes('github') && capabilityName.startsWith('repository')) score += 35;
  if (score > 0 && /fetch_file|open_image|read_file|search$|\.search/.test(tool.name.toLowerCase())) score += 10;
  return Object.freeze({ tool, score: Math.max(0, score), reasons: Object.freeze(reasons) });
}

function patternScore(pattern, name = '') {
  const source = pattern.source;
  if (String(name).toLowerCase().match(pattern)) return 50;
  if (/github|repository|fetch file|open image/.test(source)) return 35;
  return 20;
}

function normalizeAction(value = '') {
  const normalized = String(value || '').trim().toLowerCase().replace(/[_\s]+/g, '-');
  for (const [name, blueprint] of Object.entries(ACTIONS)) {
    if (normalized === name || blueprint.aliases.includes(normalized)) return name;
  }
  return normalized;
}

function argumentsTemplate(capabilityName, request = {}) {
  if (capabilityName === 'repositorySearch') return Object.freeze({
    repository: request.repository || '<explicit repository>',
    queries: request.searchQueries || [request.schemaId ? `${request.schemaId}.schema.md` : '<query>'],
    ref: request.ref || '<explicit ref>'
  });
  if (capabilityName === 'repositoryRead') return Object.freeze({
    repository: request.repository || '<explicit repository>',
    path: request.path || '<exact path selected from search result or expectedPaths>',
    ref: request.ref || '<explicit ref>'
  });
  if (capabilityName === 'repositoryWrite') return Object.freeze({ repository: request.repository || '<explicit repository>', path: request.path || '<explicit target path>', ref: request.ref || '<explicit ref>', content: '<explicit reviewed content>' });
  if (capabilityName === 'filesystemRead') return Object.freeze({ path: request.path || request.localPath || '<local path>' });
  if (capabilityName === 'archiveRead') return Object.freeze({ archivePath: request.archivePath || request.locator?.archivePath || '<archive path>', entryPath: request.entryPath || request.locator?.entryPath || '<entry path>' });
  if (capabilityName === 'images' || capabilityName === 'pdf') return Object.freeze({ path: request.asset?.path || request.assetPath || request.path || '<asset path>', locator: request.asset?.locator || request.locator || null });
  if (capabilityName === 'filesystemWrite') return Object.freeze({ path: request.path || '<output path>', content: '<explicit local content>' });
  if (capabilityName === 'remoteWriteAvailable') return Object.freeze({ target: request.target || '<explicit authorized remote target>', content: '<explicit reviewed content>' });
  if (capabilityName === 'artifactReturn') return Object.freeze({ artifact: request.artifact || '<explicit local artifact/result>' });
  if (capabilityName === 'humanConfirmation') return Object.freeze({ prompt: request.prompt || request.purpose || '<bounded confirmation request>' });
  if (capabilityName === 'authenticationRequest') return Object.freeze({ service: request.service || '<service>', purpose: request.purpose || '<bounded authentication purpose>' });
  if (capabilityName === 'copyableTextPresentation') return Object.freeze({ text: request.text || '<exact text>', presentation: 'copyable' });
  return Object.freeze({});
}

function expectedResult(capabilityName) {
  if (capabilityName === 'repositorySearch') return Object.freeze({ paths: ['<repository path>'], repository: '<owner/name>', ref: '<resolved ref or commit>' });
  if (capabilityName === 'repositoryRead') return Object.freeze({ files: [{ path: '<repository path>', content: '<UTF-8 text>', source: { repository: '<owner/name>', ref: '<ref>', commit: '<commit when available>', path: '<repository path>', authority: '<explicit claim>' } }] });
  if (capabilityName === 'repositoryWrite') return Object.freeze({ status: '<completed status>', target: { repository: '<owner/name>', path: '<path>', ref: '<ref>' }, receipt: '<host evidence>' });
  if (capabilityName === 'filesystemRead' || capabilityName === 'archiveRead') return Object.freeze({ files: [{ path: '<local or archive-relative path>', content: '<UTF-8 text or explicit asset locator>' }] });
  if (capabilityName === 'images' || capabilityName === 'pdf') return Object.freeze({ assetPath: '<asset path>', description: '<generated description>', observations: ['<bounded observation>'], qualification: { mode: 'host-multimodal' } });
  if (capabilityName === 'artifactReturn') return Object.freeze({ status: 'completed', artifactReference: '<host-returned artifact reference>' });
  if (capabilityName === 'humanConfirmation') return Object.freeze({ status: 'completed', confirmed: '<true|false>', responder: '<explicit responder when available>' });
  if (capabilityName === 'authenticationRequest') return Object.freeze({ status: 'completed', authenticationState: '<authorized|declined|unavailable>', credentialMaterial: 'not-returned-to-portable-tooling' });
  if (capabilityName === 'copyableTextPresentation') return Object.freeze({ status: 'completed', presentation: 'copyable-text' });
  return Object.freeze({ status: '<completed status>', result: '<explicit normalized result>' });
}

function expectedReceiptShape(capabilityName) { return expectedResult(capabilityName); }

function continuationFor(action, request = {}) {
  if (action === 'repository-schema-resolution') return Object.freeze({ operation: request.nextOperation || 'resolve-schema-material', mergeAs: 'providerResponses' });
  if (action === 'image-analysis' || action === 'pdf-analysis') return Object.freeze({ operation: 'accept-host-receipt', mergeAs: 'interpretations' });
  return Object.freeze({ operation: 'accept-host-receipt', mergeAs: 'material-or-result' });
}

function sanitizeRequest(value = {}) {
  const safe = {};
  for (const key of ['schemaId', 'repository', 'ref', 'path', 'assetPath', 'capability', 'purpose', 'searchQueries', 'expectedPaths', 'nextOperation']) {
    if (value[key] !== undefined) safe[key] = value[key];
  }
  if (value.asset) safe.asset = { path: value.asset.path, mimeType: value.asset.mimeType, locator: value.asset.locator };
  return safe;
}

function stableStringify(value) { return JSON.stringify(sortValue(value)); }
function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue);
  if (!value || typeof value !== 'object') return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortValue(value[key])]));
}
function stableHash(value = '') {
  let hash = 2166136261;
  for (const char of String(value)) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return (hash >>> 0).toString(16).padStart(8, '0');
}
