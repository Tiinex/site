export const SourceKind = Object.freeze({
  github: 'github-source-backed',
  githubRepo: 'github.repo',
  githubFile: 'github.file',
  local: 'local-file',
  localSession: 'local.session',
  draft: 'draft',
  static: 'static-fixture',
  gitNative: 'git.native-repo',
  exportShare: 'export.share-package'
});

export const SourceAuthority = Object.freeze({ explicit: 'explicit', notGuessed: 'not-guessed', unavailable: 'unavailable' });

export function normalizeSourceRegistration(source = {}) {
  const adapterId = String(source.adapterId || inferAdapterId(source)).trim() || 'local';
  const sourceKind = String(source.sourceKind || inferSourceKind(source)).trim();
  return Object.freeze(Object.assign({}, source, {
    adapterId,
    sourceKind,
    config: Object.freeze(Object.assign({}, source.config || legacyConfig(source)))
  }));
}

export function isLocalSource(source = {}) {
  return source.id === 'local' || source.adapterId === 'local' || source.kind === 'local';
}

export function isSourceBacked(source = {}) {
  return !isLocalSource(source) && Boolean(source.adapterId || source.sourceKind || source.repo || source.permalink);
}

function inferAdapterId(source = {}) {
  if (source.adapterId) return source.adapterId;
  if (source.kind === 'github-tree' || source.kind === SourceKind.github || source.repo || source.permalink) return 'github';
  if (source.kind === 'static' || source.kind === SourceKind.static) return 'static';
  if (source.kind === 'git-native' || source.sourceKind === SourceKind.gitNative) return 'git-native';
  return 'local';
}

function inferSourceKind(source = {}) {
  if (source.sourceKind) return source.sourceKind;
  if (source.kind === 'github-tree' || source.repo) return SourceKind.githubRepo;
  if (source.kind === 'static') return SourceKind.static;
  if (source.kind === 'git-native') return SourceKind.gitNative;
  if (source.kind === 'local' || source.id === 'local') return SourceKind.localSession;
  return source.kind || SourceKind.draft;
}

function legacyConfig(source = {}) {
  const config = {};
  for (const key of ['repo', 'ref', 'rootPath', 'path', 'permalink', 'remote']) {
    if (source[key] !== undefined && source[key] !== null && String(source[key]).trim()) config[key] = source[key];
  }
  return config;
}
