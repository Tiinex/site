import { portableFinding } from '../findings.js';
import { buildPortableToolBindings, normalizePortableHostTools } from './tool.bindings.js';

export const PORTABLE_HOST_CAPABILITIES_SCHEMA_ID = 'tiinex.portable.host-capabilities.v1';
export const PORTABLE_TOOLING_DISCOVERY_SCHEMA_ID = 'tiinex.portable.tooling-discovery.v1';

export function discoverPortableHostCapabilities(input = {}, options = {}) {
  const tools = normalizePortableHostTools(input.tools || input.availableTools || options.tools || []);
  const toolBindings = buildPortableToolBindings({ tools });
  const explicit = input.capabilities || input.hostCapabilities || directCapabilityProfile(input) || options.capabilities || directCapabilityProfile(options) || {};
  const findings = [...(toolBindings.findings || [])];
  const inferred = inferToolCapabilities(toolBindings);
  const capabilities = Object.freeze({
    materialAccess: Object.freeze({
      attachments: explicitBoolean(explicit.materialAccess?.attachments, inferred.attachments),
      projectSources: explicitBoolean(explicit.materialAccess?.projectSources, inferred.projectSources),
      filesystemRead: explicitBoolean(explicit.materialAccess?.filesystemRead ?? explicit.materialAccess?.filesystem, inferred.filesystemRead),
      archiveRead: explicitBoolean(explicit.materialAccess?.archiveRead ?? explicit.materialAccess?.archives, inferred.archiveRead),
      repositorySearch: explicitBoolean(explicit.materialAccess?.repositorySearch ?? explicit.repositories?.search, inferred.repositorySearch),
      repositoryRead: explicitBoolean(explicit.materialAccess?.repositoryRead ?? explicit.repositories?.read, inferred.repositoryRead),
      repositoryWrite: explicitBoolean(explicit.materialAccess?.repositoryWrite ?? explicit.repositories?.write, inferred.repositoryWrite),
      httpRead: explicitBoolean(explicit.materialAccess?.httpRead, inferred.httpRead)
    }),
    execution: Object.freeze({
      javascript: explicitBoolean(explicit.execution?.javascript, inferred.javascript),
      shell: explicitBoolean(explicit.execution?.shell, inferred.shell),
      process: explicitBoolean(explicit.execution?.process ?? explicit.execution?.processExecution, inferred.shell || inferred.javascript),
      networkFromExecutionSandbox: explicitBoolean(explicit.execution?.networkFromExecutionSandbox ?? explicit.execution?.network, false)
    }),
    multimodal: Object.freeze({
      images: explicitBoolean(explicit.multimodal?.images, inferred.images),
      pdf: explicitBoolean(explicit.multimodal?.pdf, inferred.pdf)
    }),
    mutation: Object.freeze({
      localDraftResult: true,
      filesystemWrite: explicitBoolean(explicit.mutation?.filesystemWrite, inferred.filesystemWrite),
      repositoryWrite: explicitBoolean(explicit.mutation?.repositoryWrite ?? explicit.repositories?.write, inferred.repositoryWrite),
      remoteWriteAvailable: explicitBoolean(explicit.mutation?.remoteWriteAvailable, inferred.remoteWriteAvailable || inferred.repositoryWrite),
      remoteWriteAuthorized: explicit.mutation?.remoteWriteAuthorized === true || options.allowRemoteWrite === true
    }),
    interaction: Object.freeze({
      artifactReturn: explicitBoolean(explicit.interaction?.artifactReturn, inferred.artifactReturn),
      humanConfirmation: explicitBoolean(explicit.interaction?.humanConfirmation, inferred.humanConfirmation),
      authenticationRequest: explicitBoolean(explicit.interaction?.authenticationRequest, inferred.authenticationRequest),
      copyableTextPresentation: explicitBoolean(explicit.interaction?.copyableTextPresentation, inferred.copyableTextPresentation)
    })
  });

  if (capabilities.mutation.remoteWriteAvailable && !capabilities.mutation.remoteWriteAuthorized) {
    findings.push(portableFinding('info', 'portable.host.remote-write.not-authorized', 'A remote write tool appears available, but portable tooling will not treat it as authorized without explicit human approval.'));
  }
  if (!capabilities.materialAccess.repositorySearch && !capabilities.materialAccess.repositoryRead) {
    findings.push(portableFinding('info', 'portable.host.repository-provider.unavailable', 'No host repository search/read capability was discovered; unknown schemas require supplied, cached, local, archive, HTTP, or separately fetched material.'));
  }

  return Object.freeze({
    schema: PORTABLE_TOOLING_DISCOVERY_SCHEMA_ID,
    profile: Object.freeze({
      schema: PORTABLE_HOST_CAPABILITIES_SCHEMA_ID,
      capabilityInstance: buildCapabilityInstance(input, options),
      capabilities,
      tools: Object.freeze(tools),
      toolBindings: toolBindings.bindings
    }),
    routes: buildTaskRoutes(capabilities),
    findings: Object.freeze(findings)
  });
}

export function portableTaskRoute(task = '', profileOrCapabilities = {}) {
  const capabilities = profileOrCapabilities.capabilities || profileOrCapabilities;
  return buildTaskRoutes(capabilities)[normalizeTask(task)] || buildUnknownRoute(task);
}

function buildTaskRoutes(capabilities = {}) {
  const access = capabilities.materialAccess || {};
  const multimodal = capabilities.multimodal || {};
  const repositoryReady = Boolean(access.repositorySearch && access.repositoryRead);
  const suppliedReady = Boolean(access.attachments || access.projectSources || access.filesystemRead || access.archiveRead);
  return Object.freeze({
    'load-material': route('load-material', suppliedReady ? 'ready' : 'host-adapter-required', suppliedReady
      ? ['attachments-or-project-sources', 'filesystem-or-archive-provider']
      : ['provide-readable-material-explicitly']),
    'resolve-unknown-schema': route('resolve-unknown-schema', repositoryReady || suppliedReady || access.httpRead ? 'ready' : 'blocked', [
      'loaded-schema-material',
      'explicit-schema-cache',
      ...(access.filesystemRead ? ['local-directory-or-checkout'] : []),
      ...(access.archiveRead ? ['archive-provider'] : []),
      ...(repositoryReady ? ['host-repository-provider'] : []),
      ...(access.httpRead ? ['explicit-http-provider'] : []),
      'preserve-only'
    ]),
    'search-lineage': route('search-lineage', suppliedReady ? 'ready' : 'material-required', ['load-material', 'search-loaded-lineage']),
    'create-local-draft': route('create-local-draft', 'ready', ['resolve-schema-material', 'schema-guide', 'plan-artifact', 'create-local-draft', 'validate-draft', 'stage-draft']),
    'materialize-durable-findings': route('materialize-durable-findings', 'ready', ['plan-durable-materialization', 'resolve-schema-material', 'create-local-draft', 'validate-draft', 'stage-draft']),
    'qualify-checkpoint': route('qualify-checkpoint', 'ready', ['describe-checkpoint-gate', 'execute-fixed-gates-in-trusted-node-adapter', 'qualify-checkpoint']),
    'create-checkpoint': route('create-checkpoint', 'ready', ['serialize-explicit-session-state', 'create-checkpoint']),
    'build-runtime-package': route('build-runtime-package', 'ready', ['collect-loaded-and-staged-material', 'build-runtime-package', 'roundtrip-runtime-package', ...(capabilities.mutation?.filesystemWrite ? ['optional-local-zip-write'] : [])]),
    'analyze-image-asset': route('analyze-image-asset', access.archiveRead && multimodal.images ? 'ready' : 'host-adapter-required', [
      'discover-asset',
      ...(access.archiveRead ? ['materialize-archive-entry'] : ['request-archive-reader']),
      ...(multimodal.images ? ['host-image-analysis'] : ['request-multimodal-image-capability'])
    ]),
    'publish-or-remote-write': route('publish-or-remote-write', capabilities.mutation?.remoteWriteAuthorized ? 'authorized' : 'blocked', capabilities.mutation?.remoteWriteAuthorized
      ? ['explicit-human-approved-adapter']
      : ['request-explicit-human-authorization'])
  });
}

function directCapabilityProfile(value = {}) {
  if (!value || typeof value !== 'object') return null;
  return (value.materialAccess || value.repositories || value.execution || value.multimodal || value.mutation || value.interaction) ? value : null;
}

function inferToolCapabilities(toolBindings = {}) {
  const bindings = toolBindings.bindings || {};
  const available = (name) => Boolean(bindings[name]?.selected);
  return {
    attachments: available('attachments'),
    projectSources: available('projectSources'),
    filesystemRead: available('filesystemRead'),
    archiveRead: available('archiveRead'),
    repositorySearch: available('repositorySearch'),
    repositoryRead: available('repositoryRead'),
    repositoryWrite: available('repositoryWrite'),
    httpRead: available('httpRead'),
    javascript: available('javascript'),
    shell: available('shell'),
    images: available('images'),
    pdf: available('pdf'),
    filesystemWrite: available('filesystemWrite'),
    remoteWriteAvailable: available('remoteWriteAvailable'),
    artifactReturn: available('artifactReturn'),
    humanConfirmation: available('humanConfirmation'),
    authenticationRequest: available('authenticationRequest'),
    copyableTextPresentation: available('copyableTextPresentation')
  };
}


function buildCapabilityInstance(input = {}, options = {}) {
  const provider = normalizeIdentity(input.provider || options.provider || {}, 'provider');
  const host = normalizeIdentity(input.hostIdentity || input.hostContext || input.host || options.hostIdentity || options.hostContext || {}, 'host');
  const session = normalizeIdentity(input.session || input.sessionContext || options.session || {}, 'session');
  const explicitInstanceId = String(input.capabilityInstanceId || options.capabilityInstanceId || session.capabilityInstanceId || '').trim();
  const instanceId = explicitInstanceId || (session.id ? `session:${session.id}` : '');
  return Object.freeze({
    schema: 'tiinex.portable.host-capability-instance.v1',
    instanceId,
    state: instanceId ? 'session-bound' : 'unbound',
    provider: Object.freeze({ id: provider.id, name: provider.name, declared: provider.declared }),
    host: Object.freeze({ id: host.id, name: host.name, declared: host.declared }),
    session: Object.freeze({ id: session.id, name: session.name, declared: session.declared }),
    authority: Object.freeze({ providerNameGrantsCapability: false, hostNameGrantsCapability: false, currentSessionBindingsRequired: true, advertisementIsExerciseEvidence: false })
  });
}

function normalizeIdentity(value, kind) {
  if (typeof value === 'string') return { id: value.trim(), name: value.trim(), declared: Boolean(value.trim()), capabilityInstanceId: '' };
  if (!value || typeof value !== 'object') return { id: '', name: '', declared: false, capabilityInstanceId: '' };
  const id = String(value.id || value.identifier || value.slug || '').trim();
  const name = String(value.name || value.label || id || '').trim();
  return { id, name, declared: Boolean(id || name), capabilityInstanceId: kind === 'session' ? String(value.capabilityInstanceId || '').trim() : '' };
}

function route(task, status, sequence) {
  return Object.freeze({ task, status, sequence: Object.freeze([...new Set(sequence.filter(Boolean))]) });
}

function buildUnknownRoute(task) {
  return route(normalizeTask(task) || 'unknown', 'unknown-task', ['inspect-operation-catalog']);
}

function normalizeTask(value = '') {
  return String(value || '').trim().toLowerCase().replace(/[_\s]+/g, '-');
}

function explicitBoolean(value, fallback = false) {
  if (value === true || value === false) return value;
  return Boolean(fallback);
}
