import { portableFinding, summarizePortableFindings } from '../findings.js';

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
  httpRead: capability('httpRead', [/http/, /web fetch/, /download url/, /open url/]),
  javascript: capability('javascript', [/javascript/, /\bnode\b/, /code execution/, /python/]),
  shell: capability('shell', [/shell/, /terminal/, /container/, /exec/]),
  images: capability('images', [/vision/, /image analysis/, /open image/, /multimodal/, /screenshot/]),
  pdf: capability('pdf', [/pdf/, /screenshot.*page/, /render.*pdf/]),
  filesystemWrite: capability('filesystemWrite', [/write file/, /save file/, /filesystem.*write/, /create.*local file/], [/github/, /repository/, /remote write/]),
  remoteWriteAvailable: capability('remoteWriteAvailable', [/github.*create/, /github.*update/, /remote write/, /create.*repository file/, /update.*repository file/])
});

const ACTIONS = Object.freeze({
  'repository-schema-resolution': Object.freeze({
    aliases: ['repository-search-and-read', 'resolve-schema-material', 'resolve-unknown-schema'],
    steps: ['repositorySearch', 'repositoryRead']
  }),
  'repository-search': Object.freeze({ aliases: ['repositorysearch'], steps: ['repositorySearch'] }),
  'repository-read': Object.freeze({ aliases: ['repositoryread'], steps: ['repositoryRead'] }),
  'filesystem-read': Object.freeze({ aliases: ['filesystemread', 'read-file'], steps: ['filesystemRead'] }),
  'archive-read': Object.freeze({ aliases: ['archiveread', 'extract-archive'], steps: ['archiveRead'] }),
  'image-analysis': Object.freeze({ aliases: ['images', 'multimodal.images', 'open-image-with-host-vision'], steps: ['images'] }),
  'pdf-analysis': Object.freeze({ aliases: ['pdf', 'multimodal.pdf', 'open-or-render-pdf-with-host-reader'], steps: ['pdf'] }),
  'filesystem-write': Object.freeze({ aliases: ['filesystemwrite', 'write-file'], steps: ['filesystemWrite'] }),
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
    if (expected.capability === 'repositoryRead') normalizedFiles.push(...normalizeRepositoryFiles(normalized, findings));
    if (expected.capability === 'filesystemRead' || expected.capability === 'archiveRead') normalizedFiles.push(...normalizeLocalFiles(normalized, findings, expected.capability));
    if (expected.capability === 'images' || expected.capability === 'pdf') interpretations.push(...normalizeInterpretations(normalized, findings, expected.capability));
  }
  const summary = summarizePortableFindings(findings);
  const providerResponses = normalizedFiles.some((file) => file.source?.repository)
    ? Object.freeze([Object.freeze({
        providerId: 'host-repository',
        priority: 85,
        remoteFetch: true,
        files: Object.freeze(normalizedFiles.filter((file) => file.source?.repository))
      })])
    : Object.freeze([]);
  const localFiles = Object.freeze(normalizedFiles.filter((file) => !file.source?.repository));
  return Object.freeze({
    schema: PORTABLE_HOST_ACTION_ACCEPTANCE_SCHEMA_ID,
    actionId: plan.actionId || receipt.actionId || '',
    action: plan.action || receipt.action || '',
    status: summary.counts.error ? 'rejected' : 'accepted',
    providerResponses,
    material: Object.freeze({ files: localFiles }),
    interpretations: Object.freeze(interpretations),
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
    repository: request.repository || 'Tiinex/docs',
    queries: request.searchQueries || [request.schemaId ? `${request.schemaId}.schema.md` : '<query>'],
    ref: request.ref || 'master'
  });
  if (capabilityName === 'repositoryRead') return Object.freeze({
    repository: request.repository || 'Tiinex/docs',
    path: request.path || '<exact path selected from search result or expectedPaths>',
    ref: request.ref || 'master'
  });
  if (capabilityName === 'filesystemRead') return Object.freeze({ path: request.path || request.localPath || '<local path>' });
  if (capabilityName === 'archiveRead') return Object.freeze({ archivePath: request.archivePath || request.locator?.archivePath || '<archive path>', entryPath: request.entryPath || request.locator?.entryPath || '<entry path>' });
  if (capabilityName === 'images' || capabilityName === 'pdf') return Object.freeze({ path: request.asset?.path || request.assetPath || request.path || '<asset path>', locator: request.asset?.locator || request.locator || null });
  if (capabilityName === 'filesystemWrite') return Object.freeze({ path: request.path || '<output path>', content: '<explicit local content>' });
  if (capabilityName === 'remoteWriteAvailable') return Object.freeze({ target: request.target || '<explicit authorized remote target>', content: '<explicit reviewed content>' });
  return Object.freeze({});
}

function expectedResult(capabilityName) {
  if (capabilityName === 'repositorySearch') return Object.freeze({ paths: ['<repository path>'], repository: '<owner/name>', ref: '<resolved ref or commit>' });
  if (capabilityName === 'repositoryRead') return Object.freeze({ files: [{ path: '<repository path>', content: '<UTF-8 text>', source: { repository: '<owner/name>', ref: '<ref>', commit: '<commit when available>', path: '<repository path>', authority: '<explicit claim>' } }] });
  if (capabilityName === 'filesystemRead' || capabilityName === 'archiveRead') return Object.freeze({ files: [{ path: '<local or archive-relative path>', content: '<UTF-8 text or explicit asset locator>' }] });
  if (capabilityName === 'images' || capabilityName === 'pdf') return Object.freeze({ assetPath: '<asset path>', description: '<generated description>', observations: ['<bounded observation>'], qualification: { mode: 'host-multimodal' } });
  return Object.freeze({ status: '<completed status>', result: '<explicit normalized result>' });
}

function expectedReceiptShape(capabilityName) { return expectedResult(capabilityName); }

function continuationFor(action, request = {}) {
  if (action === 'repository-schema-resolution') return Object.freeze({ operation: request.nextOperation || 'resolve-schema-material', mergeAs: 'providerResponses' });
  if (action === 'image-analysis' || action === 'pdf-analysis') return Object.freeze({ operation: 'accept-host-receipt', mergeAs: 'interpretations' });
  return Object.freeze({ operation: 'accept-host-receipt', mergeAs: 'material-or-result' });
}

function normalizeRepositoryFiles(normalized, findings) {
  const files = normalizeFiles(normalized);
  const out = [];
  for (const file of files) {
    if (!file.path || typeof file.content !== 'string') {
      findings.push(portableFinding('error', 'portable.host-receipt.repository-file.invalid', 'Repository read receipts require path and UTF-8 content.', { ref: file.path || '' }));
      continue;
    }
    const source = file.source || normalized.source || {};
    if (!source.repository) findings.push(portableFinding('error', 'portable.host-receipt.repository-source.missing', 'Repository read receipts require explicit repository identity.', { ref: file.path }));
    if (!source.commit) findings.push(portableFinding('warning', 'portable.host-receipt.repository-commit.unpinned', 'Repository material was returned without a resolved commit and remains moving-ref qualified.', { ref: file.path, repository: source.repository || '' }));
    const authority = source.authority === 'canonical-core' && !source.commit ? 'remote-repository-unpinned' : String(source.authority || 'remote-repository-unverified');
    out.push(Object.freeze({
      path: normalizePath(file.path),
      content: file.content,
      sourceMode: 'portable-host-repository',
      source: Object.freeze({
        repository: String(source.repository || ''),
        ref: String(source.ref || ''),
        commit: String(source.commit || ''),
        path: normalizePath(source.path || file.path),
        authority,
        remoteFetch: true
      })
    }));
  }
  return out;
}

function normalizeLocalFiles(normalized, findings, capabilityName) {
  const files = normalizeFiles(normalized);
  return files.flatMap((file) => {
    if (!file.path || (typeof file.content !== 'string' && !file.locator)) {
      findings.push(portableFinding('error', 'portable.host-receipt.local-file.invalid', 'Local/archive read receipts require a path plus content or an explicit locator.', { ref: file.path || '' }));
      return [];
    }
    if (file.source?.repository || normalized.source?.repository) findings.push(portableFinding('warning', 'portable.host-receipt.local-source.stripped', 'Repository source metadata was ignored for a local/archive read receipt.', { ref: file.path }));
    return [Object.freeze({
      path: normalizePath(file.path),
      ...(typeof file.content === 'string' ? { content: file.content } : {}),
      ...(file.locator ? { locator: sanitizeLocator(file.locator) } : {}),
      sourceMode: capabilityName === 'archiveRead' ? 'portable-host-archive' : 'portable-host-local',
      source: null
    })];
  });
}

function normalizeInterpretations(normalized, findings, capabilityName) {
  if (!normalized.assetPath || !normalized.description) {
    findings.push(portableFinding('error', 'portable.host-receipt.interpretation.invalid', 'Multimodal receipts require assetPath and a generated description.'));
    return [];
  }
  return [Object.freeze({
    schema: 'tiinex.portable.asset-analysis-response.v1',
    assetPath: normalizePath(normalized.assetPath),
    description: String(normalized.description),
    observations: Object.freeze(normalizeList(normalized.observations)),
    qualification: Object.freeze({
      mode: normalized.qualification?.mode || (capabilityName === 'images' ? 'host-multimodal-image' : 'host-multimodal-pdf'),
      generatedInterpretation: true,
      sourceAssetPreserved: true,
      analysisIsNotSourceMaterial: true
    })
  })];
}

function normalizeFiles(value = {}) {
  if (Array.isArray(value.files)) return value.files;
  if (value.file && typeof value.file === 'object') return [value.file];
  if (value.path || value.content) return [value];
  return [];
}

function normalizeList(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(list.map((item) => String(item || '').trim()).filter(Boolean))];
}

function sanitizeLocator(locator = {}) {
  return Object.freeze({
    kind: String(locator.kind || ''),
    archivePath: String(locator.archivePath || ''),
    entryPath: normalizePath(locator.entryPath || ''),
    localPath: String(locator.localPath || '')
  });
}

function serializableSchema(value) {
  if (!value || typeof value !== 'object') return value || null;
  try { return JSON.parse(JSON.stringify(value)); } catch { return null; }
}

function sanitizeRequest(value = {}) {
  const safe = {};
  for (const key of ['schemaId', 'repository', 'ref', 'path', 'assetPath', 'capability', 'purpose', 'searchQueries', 'expectedPaths', 'nextOperation']) {
    if (value[key] !== undefined) safe[key] = value[key];
  }
  if (value.asset) safe.asset = { path: value.asset.path, mimeType: value.asset.mimeType, locator: value.asset.locator };
  return safe;
}

function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+/g, '/'); }
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
