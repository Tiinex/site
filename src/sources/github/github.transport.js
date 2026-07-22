const DEFAULT_ORDER = Object.freeze(['cache', 'mirror', 'proxy', 'direct']);
const SOURCE_CACHE_PREFIX = 'tiinex.source-cache.v1:';

export function normalizeGithubRepoIdentity(repo = '') {
  const value = String(repo || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '');
  const parts = value.split('/').filter(Boolean);
  if (parts.length < 2) return '';
  return `${parts[0]}/${parts[1]}`.toLowerCase();
}

export function buildGithubTransportPlan(source = {}, options = {}) {
  const repo = normalizeGithubRepoIdentity(source.repo || source.repository || options.repo || '');
  const workspaceConfig = options.workspaceConfig || {};
  const order = normalizeOrder(options.transportOrder || options.preferredTransports || DEFAULT_ORDER);
  const mirrors = configuredMirrorsFor(repo, workspaceConfig, options);
  const proxies = configuredProxiesFor(repo, workspaceConfig, options);
  const allow = {
    cache: options.allowCache !== false,
    mirror: options.allowMirror !== false,
    proxy: options.allowProxy !== false,
    direct: options.allowDirect !== false
  };
  const configured = {
    cache: true,
    mirror: Boolean(mirrors.length || options.mirrorFetchImpl || options.mirrorRawUrl || options.mirrorApiUrl),
    proxy: Boolean(proxies.length || options.proxyFetchImpl || options.proxyRawUrl || options.proxyApiUrl),
    direct: true
  };
  const tiers = order
    .filter((tier) => allow[tier])
    .concat(order.includes('direct') || !allow.direct ? [] : ['direct'])
    .filter((tier, index, array) => array.indexOf(tier) === index);
  return Object.freeze({
    schema: 'tiinex.github.transport.plan.v1',
    repo,
    order: Object.freeze(order),
    tiers: Object.freeze(tiers),
    allow: Object.freeze(allow),
    configured: Object.freeze(configured),
    mirrors: Object.freeze(mirrors),
    proxies: Object.freeze(proxies),
    label: tiers.join(' → ') || 'unavailable',
    boundary: 'GitHub source transport tries explicit configured/cache tiers in order. It must not infer source provenance or silently invent proxy/mirror transports.'
  });
}

export function createGithubTransportFetch(source = {}, options = {}) {
  const directFetch = options.fetchImpl || (typeof fetch !== 'undefined' ? fetch : null);
  const plan = options.transportPlan?.schema === 'tiinex.github.transport.plan.v1'
    ? options.transportPlan
    : buildGithubTransportPlan(source, options);
  const events = [];
  const cache = createSourceTextCache(options);

  function emit(event) {
    const enriched = Object.assign({ adapterId: 'github', sourceId: source?.id || '', repo: plan.repo || '' }, event);
    events.push(enriched);
    if (typeof options.onTransportEvent === 'function') options.onTransportEvent(enriched);
  }

  async function transportFetch(url, init = {}) {
    const resource = classifyGithubResource(url, init);
    const cacheKey = cacheKeyFor(url, resource);
    for (const tier of plan.tiers) {
      if (tier === 'cache') {
        const cached = cache.get(cacheKey);
        if (cached) {
          emit({ tier, code: 'github.transport.cache.hit', severity: 'info', url, resource });
          return makeResponse(cached.body, { url, tier, contentType: cached.contentType || contentTypeFor(resource) });
        }
        emit({ tier, code: 'github.transport.cache.miss', severity: 'info', url, resource });
        continue;
      }
      if (tier === 'mirror') {
        const res = await tryConfiguredTransport('mirror', url, init, resource, options, emit);
        if (res) {
          await cache.put(cacheKey, await responseBodyText(res, resource), contentTypeFor(resource));
          return makeResponse(cache.get(cacheKey)?.body || '', { url, tier, contentType: contentTypeFor(resource), status: res.status || 200, statusText: res.statusText || 'OK' });
        }
        continue;
      }
      if (tier === 'proxy') {
        const res = await tryConfiguredTransport('proxy', url, init, resource, options, emit);
        if (res) {
          await cache.put(cacheKey, await responseBodyText(res, resource), contentTypeFor(resource));
          return makeResponse(cache.get(cacheKey)?.body || '', { url, tier, contentType: contentTypeFor(resource), status: res.status || 200, statusText: res.statusText || 'OK' });
        }
        continue;
      }
      if (tier === 'direct') {
        if (!directFetch) {
          emit({ tier, code: 'github.transport.direct.unavailable', severity: 'warning', url, resource });
          continue;
        }
        try {
          emit({ tier, code: 'github.transport.direct.try', severity: 'info', url, resource });
          const res = await directFetch(url, init);
          if (res?.ok) {
            emit({ tier, code: 'github.transport.direct.ok', severity: 'info', url, resource, status: res.status || 200 });
            await cache.put(cacheKey, await responseBodyText(res, resource), contentTypeFor(resource));
            return makeResponse(cache.get(cacheKey)?.body || '', { url, tier, contentType: contentTypeFor(resource), status: res.status || 200, statusText: res.statusText || 'OK' });
          }
          emit({ tier, code: 'github.transport.direct.failed', severity: 'warning', url, resource, status: res?.status || 0, message: res?.statusText || '' });
          return res;
        } catch (error) {
          emit({ tier, code: 'github.transport.direct.exception', severity: 'warning', url, resource, message: messageOf(error) });
        }
      }
    }
    emit({ tier: 'none', code: 'github.transport.exhausted', severity: 'error', url, resource });
    return makeResponse('', { ok: false, status: 503, statusText: 'Transport unavailable', url, tier: 'none', contentType: contentTypeFor(resource) });
  }

  return Object.freeze({ fetch: transportFetch, plan, events });
}


export function githubRawUrlForSourcePath(source = {}, path = '') {
  const repo = normalizeGithubRepoIdentity(source.repo || source.repository || source.config?.repo || '');
  const ref = String(source.ref || source.config?.ref || '').trim();
  const cleanPath = String(path || '').trim().replace(/^\/+/, '').replace(/\\/g, '/').replace(/\/{2,}/g, '/');
  if (!repo || !ref || !cleanPath) return '';
  const [owner, name] = repo.split('/');
  return `https://raw.githubusercontent.com/${owner}/${name}/${ref}/${cleanPath}`;
}

export function readGithubCachedTextForSourcePath(source = {}, path = '', options = {}) {
  const url = githubRawUrlForSourcePath(source, path);
  if (!url) return null;
  const key = cacheKeyFor(url, 'raw-markdown');
  const memory = options.sourceCache || moduleMemoryCache;
  const storage = options.storage || (typeof window !== 'undefined' ? window.localStorage : null);
  const mem = readObject(memory, key);
  if (mem?.body != null) return { body: String(mem.body || ''), contentType: mem.contentType || '', url, key, cache: 'memory' };
  try {
    const raw = storage?.getItem?.(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.body != null) {
      writeObject(memory, key, parsed);
      return { body: String(parsed.body || ''), contentType: parsed.contentType || '', url, key, cache: 'localStorage' };
    }
  } catch (_) {}
  return null;
}

export function hydrateGithubRecordFromSourceCache(record = {}, options = {}) {
  if (String(record.markdown || '').trim()) return record;
  const source = record.source || {};
  const adapter = String(source.adapterId || record.sourceMode || '').toLowerCase();
  if (!adapter.includes('github') && !String(record.sourceMode || '').toLowerCase().includes('source-backed')) return record;
  const cached = readGithubCachedTextForSourcePath(source, record.path || record.name || '', options);
  if (!cached?.body) return record;
  return Object.assign({}, record, {
    markdown: cached.body,
    materialAvailability: 'available',
    materialUnavailable: false,
    cacheState: `source-text-cache-hydrated:${cached.cache || 'cache'}`
  });
}

export function clearGithubSourceTextCacheForSource(source = {}, options = {}) {
  const repo = normalizeGithubRepoIdentity(source.repo || source.repository || source.config?.repo || '');
  if (!repo) return 0;
  const [owner, name] = repo.split('/');
  const rawNeedle = `raw.githubusercontent.com/${owner}/${name}/`;
  const memory = options.sourceCache || moduleMemoryCache;
  let removed = 0;
  for (const key of Object.keys(memory || {})) {
    if (key.startsWith(SOURCE_CACHE_PREFIX) && key.includes(rawNeedle)) {
      delete memory[key];
      removed += 1;
    }
  }
  const storage = options.storage || (typeof window !== 'undefined' ? window.localStorage : null);
  try {
    const keys = [];
    for (let index = 0; index < (storage?.length || 0); index += 1) {
      const key = storage.key(index);
      if (key && key.startsWith(SOURCE_CACHE_PREFIX) && key.includes(rawNeedle)) keys.push(key);
    }
    for (const key of keys) {
      storage.removeItem(key);
      removed += 1;
    }
  } catch (_) {}
  return removed;
}

function normalizeOrder(input = DEFAULT_ORDER) {
  const values = (Array.isArray(input) ? input : String(input || '').split(/[>,\s]+/))
    .map((item) => String(item || '').trim().toLowerCase())
    .filter((item) => DEFAULT_ORDER.includes(item));
  const out = values.length ? values : Array.from(DEFAULT_ORDER);
  for (const tier of DEFAULT_ORDER) if (!out.includes(tier)) out.push(tier);
  return out;
}

function configuredMirrorsFor(repo, workspaceConfig = {}, options = {}) {
  const matches = [];
  const configured = Array.isArray(workspaceConfig.repositoryMirrors) ? workspaceConfig.repositoryMirrors : [];
  for (const item of configured) {
    const itemRepo = normalizeGithubRepoIdentity(item.repository || item.repo || item.url || '');
    if (!repo || itemRepo !== repo) continue;
    matches.push({ kind: 'snapshot', label: item.label || item.name || 'Source Pages mirror', repository: repo, metadataUrl: item.metadataUrl || item.metadata || '', url: item.url || '' });
  }
  if (options.mirrorRawUrl || options.mirrorApiUrl) matches.push({ kind: 'snapshot', label: options.mirrorLabel || 'Configured mirror', repository: repo, rawUrl: options.mirrorRawUrl || '', apiUrl: options.mirrorApiUrl || '' });
  return matches;
}

function configuredProxiesFor(repo, workspaceConfig = {}, options = {}) {
  const matches = [];
  const configured = Array.isArray(workspaceConfig.repositoryTransports) ? workspaceConfig.repositoryTransports : [];
  for (const item of configured) {
    const kind = String(item.kind || '').toLowerCase();
    if (!kind.includes('proxy')) continue;
    const match = String(item.match || item.repository || item.repo || '').toLowerCase();
    const proxy = String(item.proxy || item.proxyUrl || '').trim();
    if (!proxy) continue;
    const matchesRepo = !match || match === repo || match === 'github.com/*' || match === 'github.com/**' || match.endsWith('*');
    if (matchesRepo) matches.push({ kind: 'git-proxy', label: item.label || item.name || 'Configured proxy', repository: repo, proxyUrl: proxy });
  }
  if (options.proxyRawUrl || options.proxyApiUrl) matches.push({ kind: 'proxy', label: options.proxyLabel || 'Configured proxy', repository: repo, rawUrl: options.proxyRawUrl || '', apiUrl: options.proxyApiUrl || '' });
  return matches;
}

async function tryConfiguredTransport(tier, url, init, resource, options, emit) {
  const fetcher = tier === 'mirror' ? options.mirrorFetchImpl : options.proxyFetchImpl;
  const rawBase = tier === 'mirror' ? options.mirrorRawUrl : options.proxyRawUrl;
  const apiBase = tier === 'mirror' ? options.mirrorApiUrl : options.proxyApiUrl;
  const tierUrl = rewriteTransportUrl(url, resource, rawBase, apiBase);
  if (!fetcher && !tierUrl) {
    emit({ tier, code: `github.transport.${tier}.configured-unavailable`, severity: 'info', url, resource, message: `${tier} is configured conceptually but no browser reader for this request is available.` });
    return null;
  }
  try {
    const targetUrl = tierUrl || url;
    emit({ tier, code: `github.transport.${tier}.try`, severity: 'info', url: targetUrl, originalUrl: url, resource });
    const res = await (fetcher || options.fetchImpl)(targetUrl, init);
    if (res?.ok) {
      const text = await responseBodyText(res, resource);
      emit({ tier, code: `github.transport.${tier}.ok`, severity: 'info', url: targetUrl, originalUrl: url, resource, status: res.status || 200 });
      return makeResponse(text, { url: targetUrl, tier, status: res.status || 200, statusText: res.statusText || 'OK', contentType: contentTypeFor(resource) });
    }
    emit({ tier, code: `github.transport.${tier}.failed`, severity: 'warning', url: targetUrl, originalUrl: url, resource, status: res?.status || 0, message: res?.statusText || '' });
  } catch (error) {
    emit({ tier, code: `github.transport.${tier}.exception`, severity: 'warning', url, resource, message: messageOf(error) });
  }
  return null;
}

function rewriteTransportUrl(url, resource, rawBase, apiBase) {
  const base = resource === 'api-json' ? apiBase : rawBase;
  if (!base) return '';
  const encoded = encodeURIComponent(url);
  if (String(base).includes('{url}')) return String(base).replace('{url}', encoded).replace('{rawUrl}', encoded);
  return `${String(base).replace(/\/+$/, '')}/${encoded}`;
}

function classifyGithubResource(url, init = {}) {
  const text = String(url || '');
  if (/api\.github\.com\/repos\//i.test(text)) return 'api-json';
  if (/raw\.githubusercontent\.com\//i.test(text)) return 'raw-markdown';
  if (/github\.com\/[^/]+\/[^/]+\/blob\//i.test(text)) return 'raw-markdown';
  return /json/i.test(String(init?.headers?.Accept || init?.headers?.accept || '')) ? 'api-json' : 'source-resource';
}

function cacheKeyFor(url, resource) {
  return `${SOURCE_CACHE_PREFIX}${resource}:${url}`;
}

function contentTypeFor(resource) {
  return resource === 'api-json' ? 'application/json' : 'text/markdown; charset=utf-8';
}

function createSourceTextCache(options = {}) {
  const memory = options.sourceCache || moduleMemoryCache;
  const storage = options.storage || (typeof window !== 'undefined' ? window.localStorage : null);
  const maxChars = Math.max(0, Number(options.maxCacheEntryChars || 750000));
  return {
    get(key) {
      const mem = readObject(memory, key);
      if (mem?.body != null) return mem;
      try {
        const raw = storage?.getItem?.(key);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (parsed?.body != null) {
          writeObject(memory, key, parsed);
          return parsed;
        }
      } catch (_) {}
      return null;
    },
    async put(key, body, contentType) {
      const text = String(body || '');
      if (!text || (maxChars && text.length > maxChars)) return false;
      const entry = { body: text, contentType, cachedAt: new Date().toISOString() };
      writeObject(memory, key, entry);
      try { storage?.setItem?.(key, JSON.stringify(entry)); } catch (_) {}
      return true;
    }
  };
}

const moduleMemoryCache = Object.create(null);

function readObject(store, key) {
  if (!store) return null;
  if (typeof store.get === 'function') return store.get(key) || null;
  return store[key] || null;
}

function writeObject(store, key, value) {
  if (!store) return;
  if (typeof store.set === 'function') store.set(key, value);
  else store[key] = value;
}

async function responseBodyText(response, resource = '') {
  if (resource === 'api-json') {
    try {
      const body = typeof response.clone === 'function' ? await response.clone().json() : await response.json();
      return JSON.stringify(body || {});
    } catch (_) {}
  }
  return cloneResponseText(response);
}

async function cloneResponseText(response) {
  if (!response) return '';
  if (typeof response.clone === 'function') {
    try { return await response.clone().text(); } catch (_) {}
  }
  if (typeof response.text === 'function') return response.text();
  return String(response.body || '');
}

function makeResponse(body, options = {}) {
  const text = String(body || '');
  const ok = options.ok !== false && Number(options.status || 200) >= 200 && Number(options.status || 200) < 300;
  return Object.freeze({
    ok,
    status: options.status || (ok ? 200 : 500),
    statusText: options.statusText || (ok ? 'OK' : 'Error'),
    url: options.url || '',
    transportTier: options.tier || '',
    headers: { get: (name) => String(name || '').toLowerCase() === 'content-type' ? (options.contentType || 'text/plain') : null },
    text: async () => text,
    json: async () => JSON.parse(text || '{}'),
    clone: () => makeResponse(text, options)
  });
}

function messageOf(error) {
  return String(error && error.message ? error.message : error || 'unknown error');
}
