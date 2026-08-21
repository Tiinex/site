export const EXACT_GITHUB_SCHEMA_SOURCE_TARGET_SCHEMA_ID = 'tiinex.site.exact-github-schema-source-target.v1';
export const GITHUB_SCHEMA_SOURCE_PROVIDER_QUALIFICATION_SCHEMA_ID = 'tiinex.site.github-schema-source-provider-qualification.v1';

export function canonicalGithubSchemaSourceTargets(sourceAuthority = null) {
  const sourceInputFindings = exactGithubSchemaSourceInputFindings(sourceAuthority);
  const qualified = exactGithubSchemaSourceIdentity(sourceAuthority);
  if (!qualified) return Object.freeze({
    schema: EXACT_GITHUB_SCHEMA_SOURCE_TARGET_SCHEMA_ID,
    state: 'unavailable',
    repository: '',
    commit: '',
    path: '',
    blobUrl: '',
    rawUrl: '',
    targets: Object.freeze([]),
    findings: Object.freeze(sourceInputFindings.length ? sourceInputFindings : ['Exact GitHub schema-source repository, commit, and path authority is unavailable.'])
  });
  const { blobUrl, rawUrl } = canonicalTargetsForTuple(qualified);
  const commit = qualified.commit;
  return Object.freeze({
    schema: EXACT_GITHUB_SCHEMA_SOURCE_TARGET_SCHEMA_ID,
    state: 'qualified',
    repository: qualified.repository,
    commit,
    path: qualified.path,
    blobUrl,
    rawUrl,
    targets: Object.freeze([blobUrl, rawUrl]),
    findings: Object.freeze([])
  });
}

export function qualifyExactGithubSchemaSourceTarget(candidate = '', sourceAuthority = null) {
  const canonical = canonicalGithubSchemaSourceTargets(sourceAuthority);
  const raw = String(candidate ?? '');
  const target = raw === raw.trim() ? raw : '';
  const index = canonical.state === 'qualified' ? canonical.targets.indexOf(target) : -1;
  const qualified = index >= 0;
  return Object.freeze({
    schema: EXACT_GITHUB_SCHEMA_SOURCE_TARGET_SCHEMA_ID,
    state: qualified ? 'qualified' : 'unavailable',
    target: qualified ? canonical.targets[index] : '',
    surface: qualified ? (index === 0 ? 'github-blob' : 'github-raw') : '',
    canonical,
    findings: Object.freeze([
      ...(raw && raw !== raw.trim() ? ['Exact schema-source target must not contain outer whitespace.'] : []),
      ...(canonical.state !== 'qualified' ? canonical.findings : []),
      ...(canonical.state === 'qualified' && !qualified ? ['Candidate is not an exact canonical GitHub schema-source target.'] : [])
    ])
  });
}

export function qualifyGithubSchemaSourceProvider(binding = {}, sourceAuthority = null) {
  const tuple = exactGithubSchemaSourceTuple(sourceAuthority);
  if (!tuple) {
    const sourceInputFindings = exactGithubSchemaSourceInputFindings(sourceAuthority);
    return Object.freeze({ schema: GITHUB_SCHEMA_SOURCE_PROVIDER_QUALIFICATION_SCHEMA_ID, state: 'unavailable', provider: '', evidenceTarget: '', findings: Object.freeze(sourceInputFindings.length ? sourceInputFindings : ['Exact schema-source tuple is unavailable.']) });
  }
  const canonical = canonicalTargetsForTuple(tuple);
  const declaredTargets = [binding?.permalink, binding?.rawUrl, binding?.exactReferenceTarget].map((item) => String(item ?? '')).filter(Boolean);
  const evidenceTarget = declaredTargets.find((item) => canonical.targets.includes(item)) || '';
  return Object.freeze({
    schema: GITHUB_SCHEMA_SOURCE_PROVIDER_QUALIFICATION_SCHEMA_ID,
    state: evidenceTarget ? 'qualified' : 'unavailable',
    provider: evidenceTarget ? 'github' : '',
    evidenceTarget,
    repository: tuple.repository,
    commit: tuple.commit,
    path: tuple.path,
    findings: Object.freeze(evidenceTarget ? [] : ['No explicit exact canonical GitHub source target qualifies this schema-source tuple as GitHub-backed.'])
  });
}

function canonicalTargetsForTuple(qualified = {}) {
  const path = (qualified.pathSegments || []).map(encodeExactGithubPathSegment).join('/');
  const blobUrl = `https://github.com/${qualified.owner}/${qualified.repo}/blob/${qualified.commit}/${path}`;
  const rawUrl = `https://raw.githubusercontent.com/${qualified.owner}/${qualified.repo}/${qualified.commit}/${path}`;
  return Object.freeze({ blobUrl, rawUrl, targets: Object.freeze([blobUrl, rawUrl]) });
}

function exactGithubSchemaSourceIdentity(sourceAuthority = null) {
  if (String(sourceAuthority?.provider || '').trim().toLowerCase() !== 'github') return null;
  return exactGithubSchemaSourceTuple(sourceAuthority);
}

function exactGithubSchemaSourceTuple(sourceAuthority = null) {
  const repository = String(sourceAuthority?.repository || '').trim();
  const commit = String(sourceAuthority?.commit || '').trim();
  const path = String(sourceAuthority?.path || '');
  const repoParts = repository.split('/');
  if (repoParts.length !== 2 || repoParts.some((part) => !/^[A-Za-z0-9_.-]+$/.test(part) || part === '.' || part === '..')) return null;
  if (!/^[0-9a-f]{40}$/i.test(commit)) return null;
  if (!path || !isWellFormedUnicodeScalarString(path) || path !== path.trim() || path.startsWith('/') || path.endsWith('/') || path.includes('\\') || /[\0\r\n?#]/.test(path)) return null;
  const pathSegments = path.split('/');
  if (!pathSegments.length || pathSegments.some((segment) => !segment || segment === '.' || segment === '..')) return null;
  return Object.freeze({
    repository: `${repoParts[0]}/${repoParts[1]}`,
    owner: repoParts[0],
    repo: repoParts[1],
    commit: commit.toLowerCase(),
    path,
    pathSegments: Object.freeze(pathSegments)
  });
}

function encodeExactGithubPathSegment(segment = '') {
  const text = String(segment);
  if (!isWellFormedUnicodeScalarString(text)) return '';
  return encodeURIComponent(text).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
}

function exactGithubSchemaSourceInputFindings(sourceAuthority = null) {
  const path = String(sourceAuthority?.path || '');
  if (path && !isWellFormedUnicodeScalarString(path)) return ['Exact GitHub schema-source path contains an unpaired UTF-16 surrogate and is not representable as a canonical URL target.'];
  return [];
}

function isWellFormedUnicodeScalarString(value = '') {
  const text = String(value);
  for (let index = 0; index < text.length; index += 1) {
    const unit = text.charCodeAt(index);
    if (unit >= 0xD800 && unit <= 0xDBFF) {
      const next = text.charCodeAt(index + 1);
      if (!(next >= 0xDC00 && next <= 0xDFFF)) return false;
      index += 1;
      continue;
    }
    if (unit >= 0xDC00 && unit <= 0xDFFF) return false;
  }
  return true;
}
