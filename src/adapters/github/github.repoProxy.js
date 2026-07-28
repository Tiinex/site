import { createRecordFromMarkdown } from '../../artifacts/artifact.record.js';
import { githubRawUrlForSourcePath, writeGithubSourceCacheEntry } from '../../sources/github/github.transport.js';
import { writeGithubRepoDiscoveryCache } from './github.repoMirror.js';

const MARKDOWN_RE = /(?:\.md|\.markdown|\.trace\.md|\.schema\.md|\.validator\.md|\.workspace\.md)$/i;

export async function materializeGithubRepoFilesViaGitProxy(source = {}, options = {}) {
  const repo = normalizeRepo(source.repo || source.repository || '');
  const runtime = options.gitNativeRuntime || (typeof window !== 'undefined' ? window.TiinexGitNativeRuntime : null) || (typeof globalThis !== 'undefined' ? globalThis.TiinexGitNativeRuntime : null);
  const proxyUrl = repoProxyUrlFor(repo, options);
  if (!repo) return emptyRepoProxyResult('github.repo.proxy.unavailable', 'Repo-file proxy transport requires a repository identity.');
  if (!runtime?.acquireSnapshot || !runtime?.ensureRuntime || !runtime?.readGitText) return emptyRepoProxyResult('github.repo.proxy.unavailable', 'Repo-file proxy transport requires the browser Git runtime bridge.');
  if (!proxyUrl) return emptyRepoProxyResult('github.repo.proxy.unavailable', 'Repo-file proxy transport requires an explicit git-proxy URL in workspace configuration.');
  const roots = rootPaths(source);
  const timeoutMs = repoProxyTimeoutMs(options);
  const proxyController = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const disconnectAbort = linkAbortSignal(options.abortSignal || options.signal || null, proxyController);
  try {
    reportProgress(options, { phase: 'repo-proxy', percent: 18, label: `Connecting to repo-file proxy for ${repo}` });
    const runtimeOptions = {
      repo,
      ref: source.ref || '',
      rootPaths: roots,
      corsProxy: proxyUrl,
      loadFromUnpkg: options.loadGitNativeVendor !== false,
      allowDefaultVendorUrls: options.allowDefaultGitNativeVendorUrls !== false,
      reuseExistingClone: true,
      reloadRuntime: true,
      refreshExistingClone: options.cacheMode === 'refresh' || options.transportOrderExact === true,
      cloneDepth: Math.max(1, Number(options.gitNativeCloneDepth || options.cloneDepth || 1)),
      transportSignal: proxyController?.signal || options.abortSignal || options.signal || null,
      requestTimeoutMs: timeoutMs,
      maxNetworkDurationMs: timeoutMs,
      responseStartTimeoutMs: repoProxyResponseStartTimeoutMs(options),
      idleTimeoutMs: repoProxyIdleTimeoutMs(options),
      lowSpeedGraceMs: repoProxyLowSpeedGraceMs(options),
      minBytesPerSecond: repoProxyMinBytesPerSecond(options),
      onTransportEvent: (event = {}) => {
        if (event?.event === 'progress') reportProgress(options, {
          phase: 'repo-proxy-network',
          percent: 30,
          label: proxyNetworkProgressLabel(event, repo)
        });
      },
      onProgress: (event = {}) => reportProgress(options, {
        phase: 'repo-proxy',
        percent: proxyProgressPercent(event),
        label: proxyProgressLabel(event, repo)
      })
    };
    const snapshot = await withTimeout(runtime.acquireSnapshot(runtimeOptions), timeoutMs, 'Repo-file proxy transport timed out.', proxyController);
    if (!snapshot?.ok) throw new Error(snapshot?.error || 'Git proxy did not produce a repository snapshot.');
    const commit = String(snapshot.commit || '').trim() || String(snapshot.ref || source.ref || '').trim();
    const runtimeHandle = await runtime.ensureRuntime(Object.assign({}, runtimeOptions, { ref: snapshot.ref || source.ref || '' }));
    const sourceForRaw = Object.assign({}, source, { ref: commit || source.ref || '' });
    const candidates = repoProxyCandidatePaths(snapshot, roots).slice(0, Math.max(1, Number(options.maxFiles || 500)));
    const records = [];
    const errors = [];
    let loaded = 0;
    for (const path of candidates) {
      try {
        const markdown = await runtime.readGitText(runtimeHandle, path, commit || snapshot.ref || 'HEAD');
        if (!String(markdown || '').trim()) continue;
        const rawUrl = githubRawUrlForSourcePath(sourceForRaw, path);
        records.push(recordFromRepoProxyMarkdown(markdown, sourceForRaw, path, rawUrl));
        if (rawUrl) await writeGithubSourceCacheEntry(rawUrl, markdown, 'text/markdown; charset=utf-8', 'raw-markdown', options);
        loaded += 1;
        if (loaded === 1 || loaded === candidates.length || loaded % 25 === 0) reportProgress(options, {
          phase: 'repo-proxy-read',
          loaded,
          total: candidates.length,
          percent: Math.min(92, 44 + Math.round((loaded / Math.max(candidates.length, 1)) * 44)),
          label: `Loaded Git proxy Markdown ${loaded}/${candidates.length}`
        });
      } catch (error) {
        errors.push({ code: 'github.repo.proxy.file-failed', severity: 'warning', surface: 'repoFiles', transportTier: 'proxy', ref: path, message: error?.message || String(error || '') });
      }
    }
    if (records.length) await writeGithubRepoDiscoveryCache(sourceForRaw, records.map((record) => record.sourceTarget?.sourceArtifactPath || '').filter(Boolean), options);
    return {
      schema: 'tiinex.github.repoFiles.materialization.v1',
      transportTier: 'proxy',
      ref: commit || snapshot.ref || '',
      records,
      warnings: [],
      errors,
      counts: { records: records.length, loaded: records.length, failed: errors.length, discovered: candidates.length },
      diagnostics: {
        proxyUrl,
        commit,
        runtime: 'tiinex.browser-git-native-runtime',
        networkOperation: snapshot.networkOperation || '',
        networkOperationSucceeded: Boolean(snapshot.networkOperationSucceeded),
        transportEvents: [{ tier: 'proxy', code: records.length ? 'github.repo.proxy.ok' : 'github.repo.proxy.empty', severity: records.length ? 'info' : 'warning', resource: 'repo-files', loaded: records.length, discovered: candidates.length, proxyUrl }]
      }
    };
  } catch (error) {
    const failure = repoProxyFailure(error);
    return emptyRepoProxyResult(failure.code, failure.message, failure.extra);
  } finally {
    disconnectAbort?.();
    abortController(proxyController, 'Repo-file proxy transport finished.');
  }
}

function recordFromRepoProxyMarkdown(markdown = '', source = {}, path = '', rawUrl = '') {
  const name = String(path || rawUrl).split('/').pop() || 'source.md';
  return Object.assign(createRecordFromMarkdown(markdown, { path: rawUrl || path, name, sourceMode: 'github-source' }), {
    sourceTarget: {
      schema: 'tiinex.source.material.target.v1',
      surface: 'repoFiles',
      targetKind: 'repo-proxy-markdown',
      inputTarget: path,
      targetIndex: 0,
      rawUrl,
      sourceArtifactPath: path,
      transportTier: 'proxy',
      loaded: true
    }
  });
}

function repoProxyCandidatePaths(snapshot = {}, roots = []) {
  const files = Array.isArray(snapshot.candidates) && snapshot.candidates.length ? snapshot.candidates : snapshot.files || [];
  return Array.from(new Set(files.map((item) => normalizePath(item)).filter((path) => path && MARKDOWN_RE.test(path) && underRoots(path, roots)))).sort((a, b) => a.localeCompare(b));
}

function repoProxyUrlFor(repo = '', options = {}) {
  const configured = Array.isArray(options.workspaceConfig?.repositoryTransports) ? options.workspaceConfig.repositoryTransports : [];
  for (const item of configured) {
    const kind = String(item.kind || '').toLowerCase();
    if (!kind.includes('proxy')) continue;
    const activation = String(item.activation || item.mode || item.use || '').trim().toLowerCase();
    const manual = ['manual', 'explicit', 'opt-in', 'optin', 'user'].includes(activation);
    const disabled = ['off', 'disabled', 'never'].includes(activation);
    if (disabled) continue;
    const exactProxy = options.transportOrderExact === true && (String(options.transportRefreshTier || '').toLowerCase() === 'proxy' || (Array.isArray(options.preferredTransports) && String(options.preferredTransports[0] || '').toLowerCase() === 'proxy'));
    if (manual && !exactProxy && options.allowManualProxy !== true) continue;
    const proxy = String(item.proxy || item.proxyUrl || item.corsProxy || '').trim();
    if (!proxy) continue;
    if (repoTransportMatches(repo, item.match || item.repository || item.repo || '')) return proxy;
  }
  return String(options.gitProxyUrl || options.corsProxy || '').trim();
}

function repoTransportMatches(repo = '', match = '') {
  const cleanRepo = normalizeRepo(repo);
  const cleanMatch = String(match || '').trim().toLowerCase();
  if (!cleanMatch || cleanMatch === cleanRepo) return true;
  if (cleanMatch === 'github.com/*' || cleanMatch === 'github.com/**') return true;
  if (cleanMatch.startsWith('github.com/') && cleanMatch.endsWith('*')) return cleanRepo.startsWith(cleanMatch.slice('github.com/'.length, -1));
  return cleanMatch.endsWith('*') && cleanRepo.startsWith(cleanMatch.slice(0, -1).replace(/^github\.com\//, ''));
}

function emptyRepoProxyResult(code = '', message = '', extra = {}) {
  return {
    schema: 'tiinex.github.repoFiles.materialization.v1',
    transportTier: 'proxy',
    records: [],
    warnings: [{ code, severity: 'warning', surface: 'repoFiles', transportTier: 'proxy', message }],
    errors: [],
    counts: { records: 0, loaded: 0, failed: 0, discovered: 0 },
    diagnostics: { transportEvents: [Object.assign({ tier: 'proxy', code, severity: 'warning', resource: 'repo-files', message }, extra || {})] }
  };
}

function rootPaths(source = {}) {
  return String(source.rootPath || '.topics').split(/\r?\n|,/).map((item) => normalizePath(item)).filter(Boolean);
}

function underRoots(path = '', roots = []) {
  if (!roots.length) return true;
  return roots.some((root) => path === root || path.startsWith(root + '/'));
}

function normalizePath(value = '') {
  return String(value || '').replace(/^\/+/, '').replace(/^\.\//, '').replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/\/+$/g, '');
}

function normalizeRepo(value = '') {
  return String(value || '').trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '').replace(/^\/+|\/+$/g, '').split('/').slice(0, 2).join('/').toLowerCase();
}

function reportProgress(options = {}, progress = {}) {
  if (typeof options.onProgress === 'function') options.onProgress(progress);
}

function repoProxyTimeoutMs(options = {}) {
  const configured = Number(options.repoProxyTimeoutMs || options.gitProxyTimeoutMs || 12000);
  return Math.max(2000, Math.min(60000, Number.isFinite(configured) ? configured : 12000));
}

function repoProxyResponseStartTimeoutMs(options = {}) {
  const configured = Number(options.repoProxyResponseStartTimeoutMs || options.gitProxyResponseStartTimeoutMs || 5000);
  return Math.max(1000, Math.min(repoProxyTimeoutMs(options), Number.isFinite(configured) ? configured : 5000));
}

function repoProxyIdleTimeoutMs(options = {}) {
  const configured = Number(options.repoProxyIdleTimeoutMs || options.gitProxyIdleTimeoutMs || 4000);
  return Math.max(1000, Math.min(repoProxyTimeoutMs(options), Number.isFinite(configured) ? configured : 4000));
}

function repoProxyLowSpeedGraceMs(options = {}) {
  const configured = Number(options.repoProxyLowSpeedGraceMs || options.gitProxyLowSpeedGraceMs || 5000);
  return Math.max(1000, Math.min(repoProxyTimeoutMs(options), Number.isFinite(configured) ? configured : 5000));
}

function repoProxyMinBytesPerSecond(options = {}) {
  const configured = Number(options.repoProxyMinBytesPerSecond || options.gitProxyMinBytesPerSecond || 8192);
  return Math.max(0, Math.min(1024 * 1024, Number.isFinite(configured) ? configured : 8192));
}

function proxyNetworkProgressLabel(event = {}, repo = '') {
  const bps = Number(event.bytesPerSecond || 0);
  const loaded = Number(event.loaded || 0);
  const kbps = Math.max(0, Math.round(bps / 1024));
  const kb = Math.max(0, Math.round(loaded / 1024));
  return `${repo} repo proxy · receiving ${kb} KB at ${kbps} KB/s`;
}

function linkAbortSignal(signal, controller) {
  if (!signal || !controller?.abort) return () => {};
  const abort = () => abortController(controller, signal.reason || 'Repo-file proxy transport superseded.');
  if (signal.aborted) abort();
  else signal.addEventListener?.('abort', abort, { once: true });
  return () => signal.removeEventListener?.('abort', abort);
}

function abortController(controller, reason = 'Repo-file proxy transport aborted.') {
  if (!controller || controller.signal?.aborted) return;
  try { controller.abort(reason instanceof Error ? reason : new DOMException(String(reason), 'AbortError')); }
  catch (_) { try { controller.abort(); } catch (_) {} }
}

function repoProxyFailure(error = {}) {
  const name = String(error?.name || '').toLowerCase();
  const kind = String(error?.transportFailureKind || '').toLowerCase();
  const message = error?.message || String(error || 'Repo-file proxy transport failed.');
  const extra = { failureKind: kind || name || 'proxy-failed' };
  if (name === 'aborterror' || kind === 'aborted') return { code: 'github.repo.proxy.aborted', message: 'Repo-file proxy transport was aborted before it could commit material.', extra };
  if (kind === 'low-throughput') return { code: 'github.repo.proxy.low-throughput', message: `${message} Try direct or configure a faster Git proxy endpoint.`, extra: Object.assign(extra, { bytesPerSecond: Number(error.bytesPerSecond || 0), loaded: Number(error.loaded || 0) }) };
  if (kind === 'idle-timeout' || kind === 'response-start-timeout' || kind === 'max-network-duration' || name === 'timeouterror') return { code: 'github.repo.proxy.timeout', message: `${message} Try direct or configure a faster Git proxy endpoint.`, extra };
  return { code: 'github.repo.proxy.failed', message: `Repo-file proxy transport failed: ${message}`, extra };
}

async function withTimeout(promise, timeoutMs = 12000, message = 'Operation timed out.', controller = null) {
  let timer = null;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => {
          const error = new Error(message);
          error.name = 'TimeoutError';
          abortController(controller, error);
          reject(error);
        }, timeoutMs);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function proxyProgressPercent(event = {}) {
  const phase = String(event.phase || '').toLowerCase();
  if (phase.includes('clone') || phase.includes('fetch')) return 32;
  if (phase.includes('list')) return 40;
  return 26;
}

function proxyProgressLabel(event = {}, repo = '') {
  const phase = String(event.phase || 'git proxy').replace(/[._-]+/g, ' ');
  return `${repo} repo proxy · ${phase}`;
}
