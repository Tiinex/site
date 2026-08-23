import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { schemaRegistry } from '../../../schemas/registry.js';
import { portableFinding } from '../findings.js';
import { discoverPortableHostCapabilities } from '../host/host.capabilities.js';
import { qualifyPortableSchemaMaterial } from './schema.provider.qualification.js';
import { hasPortableBootstrapCanonicalProvenance } from './schema.bootstrap.provenance.js';

export const PORTABLE_PROVIDER_CATALOG_SCHEMA_ID = 'tiinex.portable.provider-catalog.v1';
export const PORTABLE_SCHEMA_MATERIAL_RESOLUTION_SCHEMA_ID = 'tiinex.portable.schema-material-resolution.v1';
export const PORTABLE_SCHEMA_CHAIN_MATERIAL_SCHEMA_ID = 'tiinex.portable.schema-chain-material.v1';
export const PORTABLE_SCHEMA_CACHE_ENTRY_SCHEMA_ID = 'tiinex.portable.schema-cache-entry.v1';

export function listPortableMaterialProviders(input = {}, options = {}) {
  const discovery = discoverPortableHostCapabilities(input.host || input, options.host || options);
  const capabilities = discovery.profile.capabilities;
  const runtimeProviders = normalizeRuntimeProviders(options.providers || []);
  const loadedFiles = collectExplicitFiles(input);
  const hasLocalMaterial = loadedFiles.some((file) => String(file?.sourceMode || '').includes('node-local') || file?.locator?.kind === 'node-file');
  const hasArchiveMaterial = loadedFiles.some((file) => String(file?.sourceMode || '').includes('zip') || String(file?.locator?.kind || '').includes('zip'));
  const descriptors = [
    providerDescriptor('loaded-material', 'supplied-material', loadedFiles.length > 0, 100, 'Explicit files, records, project sources, or attachments already supplied to the operation.', false),
    providerDescriptor('schema-cache', 'explicit-cache', hasCacheEntries(input.schemaCache), 90, 'Serializable schema cache entries supplied by the caller or session.', false),
    providerDescriptor('provider-responses', 'host-response', hasProviderResponses(input.providerResponses), 85, 'Repository or host material already fetched outside the portable core and supplied as an explicit response.', false),
    providerDescriptor('local-directory-or-checkout', 'filesystem', capabilities.materialAccess.filesystemRead || hasLocalMaterial, 70, 'Local directory or Git checkout materialized by a Node/IDE host.', false),
    providerDescriptor('archive', 'archive', capabilities.materialAccess.archiveRead || hasArchiveMaterial, 65, 'Zip or archive material exposed by the host.', false),
    providerDescriptor('host-repository', 'repository', capabilities.materialAccess.repositorySearch && capabilities.materialAccess.repositoryRead, 60, 'Host-managed repository connector such as GitHub search + file read.', true),
    providerDescriptor('explicit-http', 'http', capabilities.materialAccess.httpRead, 40, 'Explicit HTTP/raw content provider. Authority must be qualified from source metadata.', true),
    ...runtimeProviders.map((provider, index) => providerDescriptor(provider.id, provider.kind || 'runtime-provider', true, Number(provider.priority ?? 80 - index), provider.description || 'Executable provider supplied by the host adapter.', Boolean(provider.remoteFetch)))
  ];
  descriptors.sort((a, b) => b.priority - a.priority || a.id.localeCompare(b.id));
  return Object.freeze({
    schema: PORTABLE_PROVIDER_CATALOG_SCHEMA_ID,
    providers: Object.freeze(descriptors),
    host: discovery.profile,
    findings: discovery.findings
  });
}

export async function resolvePortableSchemaMaterial(input = {}, options = {}) {
  const schemaId = String(input.schemaId || options.schemaId || '').trim();
  const findings = [];
  const providerCatalog = listPortableMaterialProviders(input, options);
  if (!schemaId) {
    findings.push(portableFinding('error', 'portable.schema-provider.schema.required', 'Schema material resolution requires a schema id.'));
    return resolutionResult(schemaId, null, providerCatalog, findings, null);
  }

  const localSelection = selectPortableLoadedSchemaMaterial(input, { schemaId });
  findings.push(...localSelection.findings);
  if (localSelection.status === 'ambiguous') return resolutionResult(schemaId, null, providerCatalog, findings, null, 'ambiguous');
  if (localSelection.material) return resolutionResult(schemaId, localSelection.material, providerCatalog, findings, null);

  const runtimeProviders = normalizeRuntimeProviders(options.providers || []);
  for (const provider of runtimeProviders.sort((a, b) => Number(b.priority || 0) - Number(a.priority || 0))) {
    if (typeof provider.resolveSchema !== 'function') continue;
    let response;
    try {
      response = await provider.resolveSchema(Object.freeze({
        schemaId,
        repository: input.repository || options.repository || 'Tiinex/docs',
        ref: input.ref || options.ref || 'master',
        expectedPaths: expectedSchemaPaths(schemaId)
      }));
    } catch (error) {
      findings.push(portableFinding('warning', 'portable.schema-provider.runtime.failed', 'A runtime schema provider failed and resolution continued with remaining providers.', {
        providerId: provider.id,
        detail: String(error?.message || error)
      }));
      continue;
    }
    const providerSelection = selectSchemaCandidate(normalizeProviderResponse(response, provider), schemaId);
    findings.push(...providerSelection.findings);
    if (providerSelection.status === 'ambiguous') return resolutionResult(schemaId, null, providerCatalog, findings, null, 'ambiguous');
    if (providerSelection.material) return resolutionResult(schemaId, providerSelection.material, providerCatalog, findings, null);
  }

  const request = buildProviderRequest(schemaId, providerCatalog, input, options);
  findings.push(portableFinding('warning', 'portable.schema-provider.material.unresolved', 'Readable schema material was not found in loaded material, cache, provider responses, or executable providers.', { schemaId }));
  return resolutionResult(schemaId, null, providerCatalog, findings, request);
}


export function selectPortableLoadedSchemaMaterial(input = {}, options = {}) {
  const schemaId = String(input.schemaId || options.schemaId || '').trim();
  if (!schemaId) return Object.freeze({ status: 'unresolved', material: null, findings: Object.freeze([portableFinding('error', 'portable.schema-provider.schema.required', 'Schema material selection requires a schema id.')]) });
  return selectSchemaCandidate(collectSchemaCandidates(input), schemaId);
}

export async function resolvePortableSchemaChainMaterial(input = {}, options = {}) {
  const schemaId = String(input.schemaId || options.schemaId || '').trim();
  const maxDepth = normalizePositiveInteger(input.maxDepth ?? options.maxDepth, 16, 1, 64);
  const findings = [];
  const nodes = [];
  const sourceFiles = [...collectExplicitFiles(input)];
  const resolvedFiles = [];
  const availableCacheEntries = normalizeCacheEntries(input.schemaCache);
  const resolvedCacheEntries = [];
  const seen = new Set();
  let current = schemaId;
  let status = 'partial';
  let pendingRequest = null;

  if (!schemaId) findings.push(portableFinding('error', 'portable.schema-chain-material.schema.required', 'Schema chain material resolution requires a schema id.'));
  while (current && nodes.length < maxDepth) {
    if (seen.has(current)) {
      findings.push(portableFinding('error', 'portable.schema-chain-material.cycle', 'Schema material parent chain contains a cycle.', { schemaId: current }));
      status = 'cycle';
      break;
    }
    seen.add(current);
    const resolution = await resolvePortableSchemaMaterial({
      ...input,
      files: [...sourceFiles, ...resolvedFiles],
      schemaCache: availableCacheEntries,
      schemaId: current
    }, options);
    findings.push(...(resolution.findings || []));
    if (!resolution.material) {
      pendingRequest = resolution.providerRequest || null;
      status = resolution.status === 'provider-action-required' ? 'provider-action-required' : resolution.status || 'unresolved';
      break;
    }
    nodes.push(Object.freeze({
      schemaId: current,
      parentSchemaId: resolution.material.parentSchemaId || '',
      path: resolution.material.path,
      providerId: resolution.material.providerId,
      authority: resolution.material.qualification.authority,
      cacheKey: resolution.material.cacheEntry?.cacheKey || '',
      bindingMatch: resolution.material.qualification.bindingMatch
    }));
    resolvedFiles.push(materialAsFile(resolution.material));
    if (resolution.material.cacheEntry) {
      upsertCacheEntry(availableCacheEntries, resolution.material.cacheEntry);
      upsertCacheEntry(resolvedCacheEntries, resolution.material.cacheEntry);
    }
    if (current === 'tiinex.root.v1' || !resolution.material.parentSchemaId) {
      status = current === 'tiinex.root.v1' ? 'complete-to-root' : 'partial-no-parent';
      break;
    }
    current = resolution.material.parentSchemaId;
  }
  if (current && nodes.length >= maxDepth && status === 'partial') {
    status = 'depth-limit';
    findings.push(portableFinding('warning', 'portable.schema-chain-material.depth-limit', 'Schema chain material resolution stopped at the configured depth limit.', { maxDepth }));
  }

  return Object.freeze({
    schema: PORTABLE_SCHEMA_CHAIN_MATERIAL_SCHEMA_ID,
    requestedSchema: schemaId,
    status,
    maxDepth,
    nodes: Object.freeze(nodes),
    materials: Object.freeze({
      files: Object.freeze(dedupeFiles(resolvedFiles)),
      schemaCache: Object.freeze(resolvedCacheEntries)
    }),
    providerRequest: pendingRequest,
    findings: Object.freeze(findings)
  });
}

function collectSchemaCandidates(input = {}) {
  const out = [];
  for (const file of collectExplicitFiles(input)) out.push(candidate(file, 'loaded-material', 100, false, false));
  for (const entry of normalizeCacheEntries(input.schemaCache)) out.push(candidate({
    path: entry.path,
    content: entry.markdown,
    source: mergeSource(entry.source, { authority: entry.authority }),
    schemaId: entry.schemaId,
    checksum: entry.checksum
  }, 'schema-cache', 90, false, true));
  for (const response of normalizeProviderResponses(input.providerResponses)) {
    for (const file of response.files) out.push(candidate({ ...file, source: mergeSource(file.source, response.source) }, response.providerId || 'provider-response', Number(response.priority || 85), Boolean(response.remoteFetch), false));
  }
  out.sort((a, b) => b.priority - a.priority);
  return out;
}

function selectSchemaCandidate(candidates = [], schemaId = '') {
  const findings = [];
  const materials = [];
  for (const candidateValue of candidates) {
    const inspected = inspectSchemaCandidate(candidateValue, schemaId);
    findings.push(...inspected.findings);
    if (inspected.material) materials.push(inspected.material);
  }
  if (!materials.length) return Object.freeze({ status: 'unresolved', material: null, findings: Object.freeze(findings) });
  const ranked = materials.map((material) => Object.freeze({ material, rank: materialAuthorityRank(material.qualification), digest: stableHash(material.markdown || '') }));
  const topRank = Math.max(...ranked.map((entry) => entry.rank));
  const top = ranked.filter((entry) => entry.rank === topRank);
  const distinct = new Map();
  for (const entry of top) if (!distinct.has(entry.digest)) distinct.set(entry.digest, entry.material);
  if (distinct.size > 1) {
    findings.push(portableFinding('error', 'portable.schema-provider.material.ambiguous', 'Multiple equally qualified schema representations disagree on bytes; resolution failed closed.', { schemaId, authorityRank: topRank, candidates: [...distinct.values()].map((material) => ({ path: material.path, providerId: material.providerId, authority: material.qualification.authority })) }));
    return Object.freeze({ status: 'ambiguous', material: null, findings: Object.freeze(findings) });
  }
  return Object.freeze({ status: 'resolved', material: top[0].material, findings: Object.freeze(findings) });
}

function materialAuthorityRank(qualification = {}) {
  if (qualification.bindingMatch) return 400;
  if (qualification.authority === 'bundled-canonical-self-verified' && qualification.sourceQualified) return 350;
  if (qualification.authority === 'provider-declared-canonical-unverified') return 250;
  if (qualification.authority === 'cache-preserved-source-qualification') return 200;
  return 100;
}

function inspectSchemaCandidate(candidateValue, schemaId) {
  const findings = [];
  const file = candidateValue.file || {};
  const markdown = textContent(file);
  const path = normalizePath(file.path || file.name || '');
  if (!markdown || !looksLikeSchemaPath(path, schemaId, markdown)) return { material: null, findings };
  let parsed;
  try { parsed = parseArtifactMarkdown(markdown); }
  catch (error) {
    findings.push(portableFinding('warning', 'portable.schema-provider.parse.failed', 'A candidate schema file could not be parsed and was ignored.', { ref: path, detail: String(error?.message || error) }));
    return { material: null, findings };
  }
  const declaredSchemaId = String(parsed.envelope?.current?.schema?.id || '').trim();
  if (declaredSchemaId !== schemaId) {
    if (path.toLowerCase().endsWith(`${schemaId}.schema.md`.toLowerCase())) {
      findings.push(portableFinding('error', 'portable.schema-provider.identity.mismatch', 'A filename-matching schema candidate declared a different Current Schema and was rejected.', {
        ref: path,
        requestedSchemaId: schemaId,
        declaredSchemaId
      }));
    }
    return { material: null, findings };
  }
  const source = normalizeSource(file.source || {}, candidateValue.providerId, candidateValue.remoteFetch, candidateValue.cached);
  const binding = schemaRegistry.byId.get(schemaId)?.binding || null;
  const qualification = qualifyPortableSchemaMaterial({ path, source, binding, checksum: file.checksum || source.checksum || '', markdown, runtimeBootstrapProvenance: candidateValue.runtimeBootstrapProvenance });
  if (candidateValue.runtimeBootstrapProvenance && (qualification.representationIntegrity !== 'verified' || qualification.authority !== 'bundled-canonical-self-verified')) {
    findings.push(portableFinding('error', 'portable.schema-provider.bootstrap.integrity.invalid', 'Runtime-owned canonical bootstrap schema material failed exact self-integrity/source qualification and was rejected.', {
      ref: path,
      schemaId,
      representationIntegrity: qualification.representationIntegrity,
      authority: qualification.authority
    }));
    return { material: null, findings };
  }
  const material = Object.freeze({
    schema: PORTABLE_SCHEMA_MATERIAL_RESOLUTION_SCHEMA_ID,
    schemaId,
    parentSchemaId: String(parsed.envelope?.parent?.schema?.id || '').trim(),
    path,
    markdown,
    providerId: candidateValue.providerId,
    source,
    qualification,
    cacheEntry: buildCacheEntry({ schemaId, path, markdown, source, qualification, checksum: file.checksum || source.checksum || '' })
  });
  return { material, findings };
}

function resolutionResult(schemaId, material, providerCatalog, findings, providerRequest, statusOverride = '') {
  return Object.freeze({
    schema: PORTABLE_SCHEMA_MATERIAL_RESOLUTION_SCHEMA_ID,
    requestedSchema: schemaId,
    status: statusOverride || (material ? 'resolved' : providerRequest ? 'provider-action-required' : 'unresolved'),
    material,
    providerCatalog,
    providerRequest,
    findings: Object.freeze(findings)
  });
}

function buildProviderRequest(schemaId, catalog, input, options) {
  const repository = String(input.repository || options.repository || 'Tiinex/docs');
  const ref = String(input.ref || options.ref || 'master');
  const repositoryProvider = catalog.providers.find((provider) => provider.id === 'host-repository' && provider.available);
  const httpProvider = catalog.providers.find((provider) => provider.id === 'explicit-http' && provider.available);
  const capability = repositoryProvider ? 'repository-search-and-read' : httpProvider ? 'explicit-http-read' : 'supply-schema-material';
  return Object.freeze({
    schema: 'tiinex.portable.provider-request.v1',
    capability,
    purpose: 'Resolve readable schema material without guessing schema meaning.',
    schemaId,
    repository,
    ref,
    searchQueries: Object.freeze([
      `${schemaId}.schema.md`,
      `Current Schema ${schemaId}`
    ]),
    expectedPaths: Object.freeze(expectedSchemaPaths(schemaId)),
    requiredResponse: Object.freeze({
      providerId: 'host-selected-provider',
      files: Object.freeze([{ path: '<repository path>', content: '<UTF-8 schema Markdown>', source: Object.freeze({ repository, ref, commit: '<resolved commit>', path: '<repository path>', authority: 'canonical-core' }) }])
    }),
    nextOperation: 'resolve-schema-material',
    boundary: Object.freeze({
      remoteFetchMustBeHostMediated: true,
      sourceMutation: false,
      remoteWrite: false,
      doNotExecuteReceivedCode: true
    })
  });
}

function buildCacheEntry({ schemaId, path, markdown, source, qualification, checksum }) {
  const basis = [schemaId, source.repository, source.commit || source.ref, path, checksum || stableHash(markdown)].join(':');
  return Object.freeze({
    schema: PORTABLE_SCHEMA_CACHE_ENTRY_SCHEMA_ID,
    cacheKey: `schema:${stableHash(basis)}:${schemaId}`,
    schemaId,
    path,
    markdown,
    checksum: String(checksum || ''),
    source: Object.freeze({ ...source }),
    authority: qualification.authority
  });
}

function normalizeProviderResponses(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.map((response) => Object.freeze({
    providerId: String(response?.providerId || response?.id || 'provider-response'),
    priority: Number(response?.priority || 85),
    remoteFetch: response?.remoteFetch !== false,
    source: response?.source || {},
    files: Object.freeze((response?.files || (response?.file ? [response.file] : [])).map((file) => Object.freeze({ ...file })))
  }));
}

function normalizeProviderResponse(response, provider) {
  if (!response) return [];
  const list = Array.isArray(response) ? response : response.files ? response.files : response.file ? [response.file] : [response];
  return list.map((file) => candidate({ ...file, source: mergeSource(file.source, response.source || provider.source) }, provider.id, Number(provider.priority || 80), Boolean(provider.remoteFetch), false));
}

function normalizeRuntimeProviders(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.filter(Boolean).map((provider, index) => ({
    ...provider,
    id: String(provider.id || provider.name || `runtime-provider-${index + 1}`),
    priority: Number(provider.priority ?? 80 - index)
  }));
}

function collectExplicitFiles(input = {}) {
  const files = [...(Array.isArray(input.files) ? input.files : [])];
  if (typeof input.markdown === 'string') files.push({ path: input.path || 'attachment.md', content: input.markdown, source: input.source });
  for (const record of Array.isArray(input.records) ? input.records : []) {
    if (typeof record?.markdown === 'string') files.push({ path: record.path || record.name || '', content: record.markdown, source: record.source });
  }
  return files;
}

function normalizeCacheEntries(value) {
  const list = value instanceof Map ? [...value.values()] : Array.isArray(value) ? value : value && typeof value === 'object' ? Object.values(value) : [];
  return list.filter((entry) => entry?.schemaId && typeof entry?.markdown === 'string').map((entry) => Object.freeze({ ...entry }));
}

function hasCacheEntries(value) { return normalizeCacheEntries(value).length > 0; }
function hasProviderResponses(value) { return normalizeProviderResponses(value).some((response) => response.files.length); }

function providerDescriptor(id, kind, available, priority, description, remoteFetch) {
  return Object.freeze({ id, kind, available: Boolean(available), priority, description, remoteFetch: Boolean(remoteFetch), remoteWrite: false, sourceMutation: false });
}

function candidate(file, providerId, priority, remoteFetch, cached) {
  return { file, providerId, priority, remoteFetch, cached, runtimeBootstrapProvenance: hasPortableBootstrapCanonicalProvenance(file?.source) };
}

function normalizeSource(source = {}, providerId = '', remoteFetch = false, cached = false) {
  return Object.freeze({
    providerId: String(source.providerId || providerId || 'loaded-material'),
    repository: String(source.repository || source.sourceRepository || ''),
    ref: String(source.ref || ''),
    commit: String(source.commit || source.sourceCommit || ''),
    path: normalizePath(source.path || source.sourcePath || ''),
    authority: String(source.authority || source.originTrustRole || ''),
    checksum: String(source.checksum?.value || source.checksum || ''),
    remoteFetch: Boolean(remoteFetch || source.remoteFetch),
    cached: Boolean(cached || source.cached),
    qualification: String(source.qualification || 'explicit-supplied')
  });
}

function mergeSource(primary = {}, fallback = {}) { return { ...(fallback || {}), ...(primary || {}) }; }

function materialAsFile(material) {
  return Object.freeze({
    path: material.path,
    content: material.markdown,
    sourceMode: material.source.remoteFetch ? 'portable-host-remote' : material.source.cached ? 'portable-cache' : 'portable-supplied',
    source: material.source
  });
}

function upsertCacheEntry(entries, entry) {
  const index = entries.findIndex((item) => item.schemaId === entry.schemaId && item.cacheKey === entry.cacheKey);
  if (index === -1) entries.push(entry);
  else entries[index] = entry;
}

function dedupeFiles(files) {
  const map = new Map();
  for (const file of files) {
    const key = `${normalizePath(file.path || file.name || '')}:${stableHash(textContent(file))}`;
    if (!map.has(key)) map.set(key, Object.freeze({ ...file }));
  }
  return [...map.values()];
}

function expectedSchemaPaths(schemaId) {
  return [
    `.topics/.schemas/${schemaId}.schema.md`,
    `.topics/.schemas/core/${schemaFamily(schemaId)}/${schemaId}.schema.md`,
    `.topics/.schemas/**/${schemaId}.schema.md`
  ];
}

function schemaFamily(schemaId = '') {
  const parts = String(schemaId).split('.');
  return parts.length >= 3 ? parts[1] : 'unknown';
}

function looksLikeSchemaPath(path, schemaId, markdown) {
  const lower = path.toLowerCase();
  if (lower.endsWith(`${schemaId}.schema.md`.toLowerCase())) return true;
  if (!lower.endsWith('.schema.md')) return false;
  return markdown.includes(schemaId);
}

function textContent(file = {}) {
  if (typeof file.content === 'string') return file.content;
  if (typeof file.markdown === 'string') return file.markdown;
  return '';
}

function normalizePath(value = '') {
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+/g, '/').trim();
}

function stableHash(value = '') {
  const text = String(value || '');
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function normalizePositiveInteger(value, fallback, min, max) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(number)));
}
