import { AdapterAvailability, makeAdapterDefinition, makeAdapterResult } from '../adapter.contracts.js';
import { createRecordFromMarkdown } from '../../artifacts/artifact.record.js';
import { explicitWebArtifactSourceTarget, normalizeExternalWebArtifactUrl } from '../../sources/source.explicitTargets.js';

export const STATIC_ADAPTER_ID = 'static';

export function createStaticAdapter() {
  return makeAdapterDefinition({
    id: STATIC_ADAPTER_ID,
    label: 'Static bundle',
    availability: AdapterAvailability.available,
    sourceKinds: ['static.fixture', 'static.public-build'],
    capabilities: {
      registerSource: true,
      materialize: true,
      openExternal: false,
      requiresBridge: false
    },
    configShape: {
      path: 'bundled/public path',
      buildId: 'optional public build id'
    },
    boundary: 'static bundled material; provenance must be declared by the bundle',
    notes: ['Static adapter describes packaged material; it does not guess GitHub origin.']
  });
}

export function createStaticAdapterResult(records = [], diagnostics = {}) {
  return makeAdapterResult({ adapterId: STATIC_ADAPTER_ID, records, diagnostics });
}


function normalizeReadableUrl(value) {
  const raw = String(value || '').trim();
  const url = new URL(raw);
  if (!/^https?:$/i.test(url.protocol)) throw new Error('non-http(s) URL');
  if (url.hostname === 'github.com' && url.pathname.includes('/blob/')) {
    const [owner, repo, , ref, ...path] = url.pathname.split('/').filter(Boolean);
    if (!owner || !repo || !ref || !path.length) throw new Error('invalid github blob URL');
    return `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path.join('/')}`;
  }
  return url.href;
}

function fileNameFromUrl(value) {
  try {
    return new URL(value).pathname.split('/').filter(Boolean).pop() || value;
  } catch {
    return value;
  }
}

export async function materializeExplicitUrls(urls = [], options = {}) {
  const fetchImpl = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  if (!fetchImpl) throw new Error('fetchImpl not available');
  const refs = (Array.isArray(urls) ? urls : String(urls || '').split(/\r?\n/)).map((line) => String(line || '').trim()).filter(Boolean);
  const records = [];
  const errors = [];
  const seenTargets = new Set();
  let duplicateCount = 0;
  for (const ref of refs) {
    let fetchUrl;
    try {
      const inputTarget = normalizeExternalWebArtifactUrl(ref);
      if (!inputTarget) throw new Error('non-http(s) URL');
      if (seenTargets.has(inputTarget)) { duplicateCount += 1; continue; }
      seenTargets.add(inputTarget);
      fetchUrl = normalizeReadableUrl(inputTarget);
      const response = await fetchImpl(fetchUrl, { cache: 'no-store' });
      if (!response || !response.ok) throw new Error(`${response?.status || 'ERR'} ${response?.statusText || ''}`.trim());
      const markdown = await response.text();
      const sourceTarget = explicitWebArtifactSourceTarget(inputTarget, fetchUrl);
      records.push(Object.assign(createRecordFromMarkdown(markdown, { path: fileNameFromUrl(inputTarget), name: fileNameFromUrl(inputTarget), sourceMode: 'explicit-url' }), { sourceTarget }));
    } catch (error) {
      errors.push({ code: 'url.load-failed', ref, message: String(error && error.message ? error.message : error) });
    }
  }
  return makeAdapterResult({
    adapterId: STATIC_ADAPTER_ID,
    records,
    errors,
    diagnostics: { transport: 'explicit-url', requestedCount: refs.length, distinctTargetCount: seenTargets.size, duplicateCount }
  });
}
