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
      httpRead: explicitBoolean(explicit.materialAccess?.httpRead, inferred.httpRead)
    }),
    execution: Object.freeze({
      javascript: explicitBoolean(explicit.execution?.javascript, inferred.javascript),
      shell: explicitBoolean(explicit.execution?.shell, inferred.shell),
      networkFromExecutionSandbox: explicitBoolean(explicit.execution?.networkFromExecutionSandbox ?? explicit.execution?.network, false)
    }),
    multimodal: Object.freeze({
      images: explicitBoolean(explicit.multimodal?.images, inferred.images),
      pdf: explicitBoolean(explicit.multimodal?.pdf, inferred.pdf)
    }),
    mutation: Object.freeze({
      localDraftResult: true,
      filesystemWrite: explicitBoolean(explicit.mutation?.filesystemWrite, inferred.filesystemWrite),
      remoteWriteAvailable: explicitBoolean(explicit.mutation?.remoteWriteAvailable, inferred.remoteWriteAvailable),
      remoteWriteAuthorized: explicit.mutation?.remoteWriteAuthorized === true || options.allowRemoteWrite === true
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
  return (value.materialAccess || value.repositories || value.execution || value.multimodal || value.mutation) ? value : null;
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
    httpRead: available('httpRead'),
    javascript: available('javascript'),
    shell: available('shell'),
    images: available('images'),
    pdf: available('pdf'),
    filesystemWrite: available('filesystemWrite'),
    remoteWriteAvailable: available('remoteWriteAvailable')
  };
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
