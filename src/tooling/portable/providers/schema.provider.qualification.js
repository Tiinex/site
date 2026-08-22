import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';

export function qualifyPortableSchemaMaterial({ path = '', source = {}, binding = null, checksum = '', markdown = '', runtimeBootstrapProvenance = false } = {}) {
  const integrity = canonicalC14nV2SelfState(markdown || '');
  const bundledCanonicalSnapshot = Boolean(
    runtimeBootstrapProvenance === true
    && source.providerId === 'bootstrap-canonical-schema-pack'
    && source.qualification === 'bundled-byte-bound-canonical-snapshot'
    && source.repository
    && source.commit
    && source.path
    && integrity.state === 'verified'
  );
  const repositoryMatch = Boolean(binding?.sourceRepository && source.repository && binding.sourceRepository === source.repository);
  const pathMatch = Boolean(binding?.sourcePath && normalizePath(binding.sourcePath) === normalizePath(path));
  const commitMatch = Boolean(binding?.sourceCommit && source.commit && binding.sourceCommit === source.commit);
  const expectedChecksum = String(binding?.checksum?.value || binding?.checksum || '');
  const checksumMatch = Boolean(expectedChecksum && checksum && expectedChecksum === checksum);
  const bindingMatch = Boolean(binding && repositoryMatch && pathMatch && commitMatch && (!checksum || checksumMatch));
  const authority = bindingMatch
    ? 'canonical-binding-match'
    : bundledCanonicalSnapshot
      ? 'bundled-canonical-self-verified'
      : source.authority === 'canonical-core'
        ? 'provider-declared-canonical-unverified'
        : source.cached
          ? 'cache-preserved-source-qualification'
          : 'supplied-unverified';
  const limitations = [];
  if (!bindingMatch && binding) limitations.push('Registered binding was not fully matched by explicit repository, commit, path, and optional checksum metadata.');
  if (!binding) limitations.push('Schema is not registered in the current site runtime; readable schema material is available but executable child tooling may be unavailable.');
  if (source.qualification === 'bundled-byte-bound-canonical-snapshot' && !bundledCanonicalSnapshot) limitations.push('Bundled canonical snapshot metadata was present but runtime-owned bootstrap provenance, c14n-v2 self-integrity, or required source identity could not be verified.');
  if (!source.repository && source.remoteFetch) limitations.push('Remote material lacks explicit repository identity.');
  return Object.freeze({
    exactSchemaIdentity: true,
    authority,
    sourceQualified: Boolean(bindingMatch || bundledCanonicalSnapshot),
    representationIntegrity: integrity.state,
    bindingMatch,
    registered: Boolean(binding),
    repositoryMatch,
    pathMatch,
    commitMatch,
    checksumMatch,
    remoteFetch: Boolean(source.remoteFetch),
    cached: Boolean(source.cached),
    runtimeBootstrapProvenance: Boolean(runtimeBootstrapProvenance),
    limitations: Object.freeze(limitations)
  });
}

function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/\/{2,}/g, '/'); }
