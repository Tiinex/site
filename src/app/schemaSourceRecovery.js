import { qualifySchemaReadingContractMarkdown } from './schemaReadingContractQualification.js';
import { qualifyRecordCurrentSchemaDeclaration } from './schemaCurrentDeclaration.js';

export function declaredSchemaRecoveryTarget(record = {}, schemaId = '') {
  const declaration = qualifyRecordCurrentSchemaDeclaration(record, schemaId);
  if (declaration.state !== 'qualified') return { ok: false, reason: declaration.reason || 'declared-schema-unavailable', schemaId, href: declaration.target || '', declaration };
  const href = declaration.target || '';
  if (!href) return { ok: false, reason: 'no-declared-target', schemaId: declaration.schemaId, href: '', declaration };
  if (/^https?:\/\//i.test(href)) return absoluteSchemaTarget(href, declaration.schemaId);

  const source = record.source || {};
  const sourceQualification = qualifyGithubRecoverySource(source, record);
  if (!sourceQualification.ok) return { ok: false, reason: sourceQualification.reason, schemaId: declaration.schemaId, href, declaration };
  const pathResult = resolveRelativeRepositoryPath(sourceQualification.sourcePath, href);
  if (!pathResult.ok) return { ok: false, reason: pathResult.reason, schemaId: declaration.schemaId, href, declaration };
  return githubSchemaTarget({
    repo: sourceQualification.repo,
    ref: sourceQualification.ref,
    path: pathResult.path,
    schemaId: declaration.schemaId,
    declaredHref: href
  });
}

export async function recoverDeclaredSchemaEntry({ record = {}, schemaId = '', fetchImpl = globalThis.fetch } = {}) {
  const target = declaredSchemaRecoveryTarget(record, schemaId);
  if (!target.ok) return target;
  if (typeof fetchImpl !== 'function') return Object.assign({}, target, { ok: false, reason: 'fetch-unavailable' });
  try {
    const response = await fetchImpl(target.fetchUrl, { redirect: 'error' });
    if (!response?.ok) return Object.assign({}, target, { ok: false, reason: 'fetch-failed', status: response?.status || 0 });
    const retrieval = qualifyRetrievedTargetEvidence(target, response);
    if (!retrieval.ok) return Object.assign({}, target, retrieval, { ok: false, retrievalState: 'target-unqualified' });
    const markdown = await response.text();
    if (!String(markdown || '').trim()) return Object.assign({}, target, retrieval, { ok: false, reason: 'empty-schema-body', retrievalState: 'retrieved', retrievedBytes: String(markdown || '').length });
    const semanticQualification = qualifySchemaReadingContractMarkdown(markdown, schemaId);
    if (semanticQualification.state !== 'qualified') return Object.assign({}, target, retrieval, {
      ok: false,
      reason: 'schema-reading-contract-unqualified',
      retrievalState: 'retrieved',
      retrievedBytes: String(markdown).length,
      semanticQualification
    });
    const source = sourceWithRetrievalEvidence(target.source, target, retrieval);
    return Object.assign({}, target, retrieval, {
      ok: true,
      markdown,
      path: target.path || retrieval.finalRetrievedTarget || target.fetchUrl,
      source,
      retrievalState: 'retrieved',
      retrievedBytes: String(markdown).length,
      semanticQualification
    });
  } catch (exception) {
    return Object.assign({}, target, { ok: false, reason: 'fetch-exception', exception });
  }
}

export function schemaRecoveryRepresentationIdentity(target = {}) {
  if (!target || typeof target !== 'object' || target.ok === false) return '';
  const source = target.source || {};
  const adapterId = String(source.adapterId || target.adapterId || '').trim().toLowerCase();
  if (adapterId === 'github') {
    const repo = qualifyExactStringDimension([target.repo, target.repository, source.repo, source.repository, source.config?.repo]);
    const ref = qualifyExactStringDimension([target.ref, source.ref, source.config?.ref]);
    const path = firstExactString(target.path, target.sourceTarget?.sourceArtifactPath);
    if (repo.state !== 'qualified' || ref.state !== 'qualified' || !validRepository(repo.value) || !validGithubRef(ref.value) || !validRepositoryPath(path)) return '';
    return JSON.stringify(['github', repo.value, ref.value, path]);
  }
  const href = firstExactString(target.finalRetrievedTarget, target.effectiveRequestTarget, target.fetchUrl, target.sourceTarget?.finalRetrievedTarget, target.sourceTarget?.effectiveRequestTarget, target.inputTarget, target.sourceTarget?.inputTarget, source.finalRetrievedTarget, source.effectiveRequestTarget, source.permalink);
  const effective = effectiveHttpRequestTarget(href);
  return effective ? JSON.stringify(['url', effective]) : '';
}

export function qualifySchemaRecordRecoveryRepresentation(record = {}) {
  if (!record || typeof record !== 'object') return frozenRepresentation('unavailable', '', [], 'record-unavailable');
  const source = record.source || {};
  const adapterId = String(source.adapterId || '').trim().toLowerCase();
  const concreteTargets = qualifiedConcreteTargetIdentities(record);
  if (concreteTargets.state === 'ambiguous') return frozenRepresentation('ambiguous', '', concreteTargets.identities, concreteTargets.reason);
  if (concreteTargets.state === 'unavailable' && concreteTargets.assertedCount > 0) return frozenRepresentation('unavailable', '', concreteTargets.identities, concreteTargets.reason);

  if (adapterId === 'github') {
    const repo = qualifyExactStringDimension([source.repo, source.repository, source.config?.repo]);
    if (repo.state === 'ambiguous') return frozenRepresentation('ambiguous', '', [], 'github-record-repository-aliases-conflict');
    const ref = qualifyExactStringDimension([source.ref, source.config?.ref]);
    if (ref.state === 'ambiguous') return frozenRepresentation('ambiguous', '', [], 'github-record-ref-aliases-conflict');
    const path = firstExactString(record.sourceTarget?.sourceArtifactPath, record.sourcePath, record.path);
    const target = repo.state === 'qualified' && ref.state === 'qualified' ? githubSchemaTarget({ repo: repo.value, ref: ref.value, path }) : { ok: false, reason: 'github-record-source-unavailable' };
    const identity = target.ok ? schemaRecoveryRepresentationIdentity(target) : '';
    if (!identity) return frozenRepresentation('unavailable', '', [], target.reason || 'github-record-target-unavailable');
    if (concreteTargets.state === 'qualified' && concreteTargets.identity !== identity) {
      return frozenRepresentation('ambiguous', '', uniqueExactStrings([identity, ...concreteTargets.identities]), 'github-record-source-target-conflict');
    }
    return frozenRepresentation('qualified', identity, [identity], '');
  }

  if (concreteTargets.state === 'qualified') return frozenRepresentation('qualified', concreteTargets.identity, concreteTargets.identities, '');
  return frozenRepresentation('unavailable', '', [], 'record-representation-target-unavailable');
}

function absoluteSchemaTarget(href = '', schemaId = '') {
  if (!href || href !== href.trim() || !isWellFormedUnicodeScalarString(href)) return { ok: false, reason: 'absolute-target-invalid', schemaId, href };
  const github = exactGithubAbsoluteTarget(href, schemaId);
  if (github) return github;
  const effectiveRequestTarget = effectiveHttpRequestTarget(href);
  if (!effectiveRequestTarget) return { ok: false, reason: 'absolute-target-invalid', schemaId, href };
  const url = new URL(effectiveRequestTarget);
  return {
    ok: true,
    schemaId,
    declaredHref: href,
    declaredLocator: href,
    effectiveRequestTarget,
    fetchUrl: effectiveRequestTarget,
    browseUrl: effectiveRequestTarget,
    path: effectiveRequestTarget,
    source: {
      id: `schema-url:${effectiveRequestTarget}`,
      label: url.hostname || 'Declared schema source',
      adapterId: 'http',
      sourceKind: 'http.file',
      kind: 'http-file',
      permalink: effectiveRequestTarget,
      declaredLocator: href,
      effectiveRequestTarget,
      boundary: 'explicit Current Schema URL; source-backed reading contract',
      sourceBacked: true
    }
  };
}

function exactGithubAbsoluteTarget(href = '', schemaId = '') {
  const blob = href.match(/^https:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/blob\/([^/?#]+)\/(.+)$/u);
  if (blob) {
    const tuple = decodedGithubUrlTuple(blob[1], blob[2], blob[3], blob[4]);
    if (!tuple) return null;
    return githubSchemaTarget({ repo: tuple.repo, ref: tuple.ref, path: tuple.path, schemaId, declaredHref: href });
  }
  const raw = href.match(/^https:\/\/raw\.githubusercontent\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)\/([^/?#]+)\/(.+)$/u);
  if (raw) {
    const tuple = decodedGithubUrlTuple(raw[1], raw[2], raw[3], raw[4]);
    if (!tuple) return null;
    return githubSchemaTarget({ repo: tuple.repo, ref: tuple.ref, path: tuple.path, schemaId, declaredHref: href });
  }
  return null;
}

function decodedGithubUrlTuple(owner = '', repo = '', encodedRef = '', encodedPath = '') {
  if (!validRepository(`${owner}/${repo}`)) return null;
  const ref = decodeCanonicalUrlSegment(encodedRef);
  if (!ref || ref === '.' || ref === '..') return null;
  const segments = String(encodedPath || '').split('/');
  if (!segments.length || segments.some((segment) => !segment)) return null;
  const decoded = [];
  for (const segment of segments) {
    const value = decodeCanonicalUrlSegment(segment);
    if (!value || value === '.' || value === '..' || value.includes('/') || value.includes('\\')) return null;
    decoded.push(value);
  }
  return { repo: `${owner}/${repo}`, ref, path: decoded.join('/') };
}

function qualifyGithubRecoverySource(source = {}, record = {}) {
  if (String(source.adapterId || '') !== 'github') return { ok: false, reason: 'relative-target-without-verified-source' };
  const repo = qualifyExactStringDimension([source.repo, source.repository, source.config?.repo]);
  if (repo.state === 'ambiguous') return { ok: false, reason: 'github-source-repository-ambiguous', values: repo.values };
  if (repo.state !== 'qualified' || !validRepository(repo.value)) return { ok: false, reason: 'github-source-repository-invalid' };
  const ref = qualifyExactStringDimension([source.ref, source.config?.ref]);
  if (ref.state === 'ambiguous') return { ok: false, reason: 'github-source-ref-ambiguous', values: ref.values };
  if (ref.state !== 'qualified' || !validGithubRef(ref.value)) return { ok: false, reason: 'github-source-ref-invalid' };
  const sourcePath = firstExactString(record.sourceTarget?.sourceArtifactPath, record.sourcePath, record.path);
  if (!validRepositoryPath(sourcePath)) return { ok: false, reason: 'github-source-path-invalid' };
  return { ok: true, repo: repo.value, ref: ref.value, sourcePath };
}

function resolveRelativeRepositoryPath(sourcePath = '', href = '') {
  if (!validRelativeSchemaHref(href)) return { ok: false, reason: 'relative-target-invalid' };
  const base = sourcePath.split('/');
  base.pop();
  const out = base.slice();
  for (const part of href.split('/')) {
    if (part === '.') continue;
    if (part === '..') {
      if (!out.length) return { ok: false, reason: 'relative-target-escapes-repository' };
      out.pop();
      continue;
    }
    if (!part) return { ok: false, reason: 'relative-target-invalid' };
    out.push(part);
  }
  const path = out.join('/');
  return validRepositoryPath(path) ? { ok: true, path } : { ok: false, reason: 'relative-target-invalid' };
}

function githubSchemaTarget({ repo = '', ref = '', path = '', schemaId = '', declaredHref = '' } = {}) {
  if (!validRepository(repo) || !validGithubRef(ref) || !validRepositoryPath(path)) return { ok: false, reason: 'github-target-invalid', schemaId, declaredHref };
  const encodedRef = encodeExactUrlComponent(ref);
  const encodedPathSegments = path.split('/').map(encodeExactUrlComponent);
  if (!encodedRef || encodedPathSegments.some((segment) => !segment)) return { ok: false, reason: 'github-target-unrepresentable', schemaId, declaredHref };
  const encodedPath = encodedPathSegments.join('/');
  const fetchUrl = `https://raw.githubusercontent.com/${repo}/${encodedRef}/${encodedPath}`;
  const browseUrl = `https://github.com/${repo}/blob/${encodedRef}/${encodedPath}`;
  return {
    ok: true, schemaId, declaredHref, declaredLocator: declaredHref, repo, ref, path, fetchUrl, browseUrl, effectiveRequestTarget: fetchUrl,
    source: {
      id: `github-exact:${repo.toLowerCase()}:${ref || 'default'}:${schemaRootPath(path)}`,
      label: repo,
      kind: 'github-tree', adapterId: 'github', sourceKind: 'github.repo', repo, repository: repo, ref, rootPath: schemaRootPath(path),
      boundary: 'configured exact-target GitHub source; broad discovery remains explicit', sourceBacked: true, loadable: true,
      repoDiscovery: false, issueDiscovery: false, issueUrls: '', explicitFileRefs: [path],
      config: { repo, ref, rootPath: schemaRootPath(path), issueUrls: '', explicitFileRefs: [path] },
      requestedSurfaces: { repoFiles: { requested: false }, explicitFiles: { requested: true, requestedCount: 1 }, issueSnapshots: { requested: false } },
      count: 1, recordCount: 1
    }
  };
}

function validRepository(value = '') {
  const raw = String(value ?? '');
  if (!raw || raw !== raw.trim() || !isWellFormedUnicodeScalarString(raw)) return false;
  const parts = raw.split('/');
  return parts.length === 2 && parts.every((part) => /^[A-Za-z0-9_.-]+$/.test(part) && part !== '.' && part !== '..');
}

function validGithubRef(value = '') {
  const raw = String(value ?? '');
  if (!raw || raw !== raw.trim() || !isWellFormedUnicodeScalarString(raw) || /[\\?#\0\r\n%]/.test(raw)) return false;
  const parts = raw.split('/');
  return parts.every((part) => Boolean(part) && part !== '.' && part !== '..');
}

function validRepositoryPath(value = '') {
  const raw = String(value ?? '');
  if (!raw || raw !== raw.trim() || !isWellFormedUnicodeScalarString(raw) || raw.startsWith('/') || raw.endsWith('/') || /[\\?#\0\r\n]/.test(raw)) return false;
  const parts = raw.split('/');
  return parts.length > 0 && parts.every((part) => Boolean(part) && part !== '.' && part !== '..');
}

function validRelativeSchemaHref(value = '') {
  const raw = String(value ?? '');
  if (!raw || raw !== raw.trim() || !isWellFormedUnicodeScalarString(raw) || raw.startsWith('/') || raw.endsWith('/') || /[\\?#\0\r\n%]/.test(raw)) return false;
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/u.test(raw)) return false;
  return raw.split('/').every((part) => Boolean(part) || part === '.');
}

function decodeCanonicalUrlSegment(segment = '') {
  const raw = String(segment ?? '');
  if (!raw || !isWellFormedUnicodeScalarString(raw)) return '';
  try {
    const decoded = decodeURIComponent(raw);
    if (!isWellFormedUnicodeScalarString(decoded)) return '';
    return encodeExactUrlComponent(decoded) === raw ? decoded : '';
  } catch { return ''; }
}

function encodeExactUrlComponent(value = '') {
  const raw = String(value ?? '');
  if (!raw || !isWellFormedUnicodeScalarString(raw)) return '';
  try {
    return encodeURIComponent(raw).replace(/[!'()*]/g, (character) => `%${character.charCodeAt(0).toString(16).toUpperCase()}`);
  } catch { return ''; }
}

function qualifyRetrievedTargetEvidence(target = {}, response = {}) {
  const effectiveRequestTarget = effectiveHttpRequestTarget(target.effectiveRequestTarget || target.fetchUrl || '');
  if (!effectiveRequestTarget) return { ok: false, reason: 'effective-request-target-unavailable' };
  const responseUrlRaw = response?.url === undefined || response?.url === null ? '' : String(response.url);
  const responseTarget = responseUrlRaw ? effectiveHttpRequestTarget(responseUrlRaw) : '';
  if (responseUrlRaw && !responseTarget) return { ok: false, reason: 'retrieved-target-invalid', effectiveRequestTarget, responseTarget: responseUrlRaw };
  if (response?.redirected === true) return { ok: false, reason: 'redirected-retrieval-disallowed', effectiveRequestTarget, finalRetrievedTarget: responseTarget || responseUrlRaw };
  if (responseTarget && responseTarget !== effectiveRequestTarget) return { ok: false, reason: 'retrieved-target-mismatch', effectiveRequestTarget, finalRetrievedTarget: responseTarget };
  return {
    ok: true,
    effectiveRequestTarget,
    finalRetrievedTarget: responseTarget || effectiveRequestTarget,
    transportTargetEvidence: responseTarget ? 'response-url' : 'requested-target'
  };
}

function sourceWithRetrievalEvidence(source = {}, target = {}, retrieval = {}) {
  const next = Object.assign({}, source || {}, {
    declaredLocator: target.declaredHref || target.declaredLocator || '',
    effectiveRequestTarget: retrieval.effectiveRequestTarget || target.effectiveRequestTarget || target.fetchUrl || '',
    finalRetrievedTarget: retrieval.finalRetrievedTarget || retrieval.effectiveRequestTarget || target.fetchUrl || ''
  });
  if (String(next.adapterId || '').toLowerCase() === 'http') next.permalink = next.finalRetrievedTarget;
  return next;
}

function qualifiedConcreteTargetIdentities(record = {}) {
  const source = record.source || {};
  const rawTargets = uniqueExactStrings([
    record.sourceTarget?.finalRetrievedTarget,
    record.sourceTarget?.effectiveRequestTarget,
    record.sourceTarget?.inputTarget,
    record.sourceTarget?.rawUrl,
    record.sourceTarget?.browseUrl,
    source.finalRetrievedTarget,
    source.effectiveRequestTarget,
    source.permalink
  ]);
  const identities = [];
  const invalid = [];
  for (const href of rawTargets) {
    const target = absoluteSchemaTarget(href, '');
    const identity = target.ok ? schemaRecoveryRepresentationIdentity(target) : '';
    if (!identity) invalid.push(href);
    else if (!identities.includes(identity)) identities.push(identity);
  }
  if (invalid.length) return { state: 'unavailable', identity: '', identities, assertedCount: rawTargets.length, reason: 'record-representation-target-invalid', invalid };
  if (identities.length === 1) return { state: 'qualified', identity: identities[0], identities, assertedCount: rawTargets.length, reason: '' };
  if (identities.length > 1) return { state: 'ambiguous', identity: '', identities, assertedCount: rawTargets.length, reason: 'record-representation-targets-conflict' };
  return { state: 'unavailable', identity: '', identities: [], assertedCount: rawTargets.length, reason: 'record-representation-target-unavailable' };
}

function qualifyExactStringDimension(values = []) {
  const exact = uniqueExactStrings(values);
  if (exact.length === 1) return Object.freeze({ state: 'qualified', value: exact[0], values: Object.freeze(exact) });
  if (exact.length > 1) return Object.freeze({ state: 'ambiguous', value: '', values: Object.freeze(exact) });
  return Object.freeze({ state: 'unavailable', value: '', values: Object.freeze([]) });
}

function frozenRepresentation(state, identity, identities, reason) {
  return Object.freeze({ state, identity, identities: Object.freeze(Array.from(identities || [])), reason });
}

function effectiveHttpRequestTarget(href = '') {
  if (!href || !isWellFormedUnicodeScalarString(href)) return '';
  try {
    const url = new URL(href);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : '';
  } catch { return ''; }
}

function firstExactString(...values) {
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const raw = String(value);
    if (raw) return raw;
  }
  return '';
}

function uniqueExactStrings(values = []) {
  const out = [];
  for (const value of values) {
    if (value === undefined || value === null) continue;
    const raw = String(value);
    if (raw && !out.includes(raw)) out.push(raw);
  }
  return out;
}

function schemaRootPath(path = '') {
  if (path === '.topics' || path.startsWith('.topics/')) return '.topics';
  return path.split('/').filter(Boolean)[0] || '.';
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
