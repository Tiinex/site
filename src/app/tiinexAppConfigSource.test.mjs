import assert from 'node:assert/strict';
import { fetchTiinexAppConfigSource, resolveTiinexAppConfigGithubInput, tiinexAppConfigUrlCandidates } from './tiinexAppConfigSource.js';
import '../workspaces/workspace.config.js';

const markdown = `# Viewer

## Viewer Identity

- Browser Title: Example Tiinex

## Workspace Entrypoints

### Docs

- Source Kind: github-tree
- Repository: Tiinex/docs
- Ref: master
- Root Path: .topics
- Repo Files Discovery: on
- Issue Discovery: on
- Issue URL: https://github.com/Tiinex/docs/issues/9
`;

{
  const urls = tiinexAppConfigUrlCandidates('https://example.test/app/');
  assert.ok(urls.includes('https://example.test/.well-known/tiinex/workspace.md'));
  assert.ok(urls.includes('https://example.test/.topics/.workspaces/viewer.workspace.md'));
}

{
  const fetched = [];
  const fetchImpl = async (url) => {
    fetched.push(url);
    if (url === 'https://example.test/app/') return { ok: true, text: async () => '<link rel="tiinex-workspace" href="/config/viewer.workspace.md">' };
    if (url === 'https://example.test/config/viewer.workspace.md') return { ok: true, text: async () => markdown };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await fetchTiinexAppConfigSource('https://example.test/app/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.configUrl, 'https://example.test/config/viewer.workspace.md');
  assert.equal(result.entrypoint.repository, 'Tiinex/docs');
  assert.ok(fetched.includes('https://example.test/app/'));
}

{
  const fetchImpl = async (url) => ({ ok: url.endsWith('/.well-known/tiinex/workspace.md'), text: async () => markdown });
  const result = await resolveTiinexAppConfigGithubInput('example.test', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.input.repository, 'Tiinex/docs');
  assert.equal(result.input.ref, 'master');
  assert.equal(result.input.repoDiscovery, true);
  assert.equal(result.input.issueDiscovery, true);
  assert.equal(result.input.issueUrls, 'https://github.com/Tiinex/docs/issues/9');
}

{
  const embedded = JSON.stringify(`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.workspace.v1\n\n---\n\n${markdown}`);
  const fetched = [];
  const fetchImpl = async (url) => {
    fetched.push(url);
    if (url === 'https://poc.example/') return { ok: true, text: async () => '<script src="./app.js"></script>' };
    if (url === 'https://poc.example/app.js') return { ok: true, text: async () => `const EMBEDDED_DEFAULT_WORKSPACE_MD = ${embedded};` };
    if (url === 'https://poc.example/.topics/.workspaces/viewer.workspace.md') return { ok: true, text: async () => markdown.replace('Tiinex/docs', 'Wrong/fallback') };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await fetchTiinexAppConfigSource('https://poc.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.configUrl, 'https://poc.example/app.js#embedded-default-workspace', 'PoC-hosted apps should prefer embedded runtime workspace over packaged dot-path fallback');
  assert.equal(result.entrypoint.repository, 'Tiinex/docs');
  assert.ok(fetched.includes('https://poc.example/app.js'));
}

{
  const rawUrl = 'https://raw.githubusercontent.com/Tiinex/docs/master/.topics/.workspaces/viewer.workspace.md';
  const fetched = [];
  const fetchImpl = async (url) => {
    fetched.push(url);
    if (url === 'https://poc.example/') return { ok: true, text: async () => '<script src="./tiinex.bundle.js"></script>' };
    if (url === 'https://poc.example/tiinex.bundle.js') {
      return { ok: true, text: async () => `const workspaceCandidates = ${JSON.stringify([{ kind: 'workspace-url', role: 'default-workspace', url: 'https://github.com/Tiinex/docs/blob/master/.topics/.workspaces/viewer.workspace.md' }], null, 2)};` };
    }
    if (url === rawUrl) return { ok: true, text: async () => markdown };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await fetchTiinexAppConfigSource('https://poc.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.configUrl, rawUrl);
  assert.equal(result.entrypoint.repository, 'Tiinex/docs');
  assert.ok(fetched.includes(rawUrl), 'GitHub blob workspace URLs must be converted to raw fetch URLs');
}

{
  const rawUrl = 'https://raw.githubusercontent.com/Tiinex/docs/master/.topics/.workspaces/viewer.workspace.md';
  const fetched = [];
  const fetchImpl = async (url) => {
    fetched.push(url);
    if (url === 'https://poc.example/') return { ok: true, text: async () => '<script src="./tiinex.bundle.js"></script>' };
    if (url === 'https://poc.example/tiinex.bundle.js') {
      return { ok: true, text: async () => `const workspaceCandidates = ${JSON.stringify([{ kind: 'github-issue-pointer', role: 'primary', url: 'https://github.com/Tiinex/site/issues/7' }], null, 2)};` };
    }
    if (url === 'https://poc.example/issues/github.com/Tiinex/site/issues/7/issue.md') return { ok: false, status: 404, text: async () => '' };
    if (url === 'https://api.github.com/repos/Tiinex/site/issues/7') return { ok: true, text: async () => JSON.stringify({ html_url: 'https://github.com/Tiinex/site/issues/7', body: '## Tiinex Workspace Pointer\n\n- Workspace URL: https://github.com/Tiinex/docs/blob/master/.topics/.workspaces/viewer.workspace.md' }) };
    if (url === rawUrl) return { ok: true, text: async () => markdown };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await fetchTiinexAppConfigSource('https://poc.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.configUrl, rawUrl);
  assert.equal(result.entrypoint.repository, 'Tiinex/docs');
  assert.ok(fetched.includes('https://api.github.com/repos/Tiinex/site/issues/7'));
}

{
  const discoveryMarkdown = `# Viewer

## Workspace Discovery

- [Hosted workspaces](https://github.com/Tiinex/site)
  - Kind: github-tree
  - Root Path: .topics
  - Match: *.workspace.md
  - Label: Hosted workspace catalog
  - Open Behavior: chooser

## Workspace Entrypoints

### Docs

- Source Kind: github-tree
- Repository: Tiinex/docs
- Ref: master
- Root Path: .topics
- Repo Files Discovery: on
`;
  const fetchImpl = async (url) => ({ ok: url.endsWith('/viewer.workspace.md'), text: async () => discoveryMarkdown });
  const result = await resolveTiinexAppConfigGithubInput('https://hosted.example/viewer.workspace.md', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.selectedPlan, 'workspace-discovery');
  assert.equal(result.input.repository, 'Tiinex/site');
  assert.equal(result.input.label, 'Hosted workspace catalog');
  assert.equal(result.input.repoDiscovery, true);
  assert.equal(result.input.issueDiscovery, false);
  assert.equal(result.input.workspaceMatch, '*.workspace.md');
  assert.equal(result.input.preserveView, true);
}


{
  const embedded = JSON.stringify(`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.workspace.v1\n\n---\n\n${markdown.replace('Tiinex/docs', 'Wrong/embedded')}`);
  const fetched = [];
  const fetchImpl = async (url) => {
    fetched.push(url);
    if (url === 'https://poc.example/') return { ok: true, text: async () => '<script src="./tiinex.bundle.js"></script>' };
    if (url === 'https://poc.example/tiinex.bundle.js') return { ok: true, text: async () => `
      const defaultGitNative = ${JSON.stringify({ enabled: true, loadFromUnpkg: true, repo: 'Tiinex/site', ref: 'main', rootPaths: ['.topics'] }, null, 2)};
      window.TIINEX_VIEWER_OPTIONS = Object.assign({ "browserTitle": "Tiinex" }, window.TIINEX_VIEWER_OPTIONS || {});
      window.TIINEX_VIEWER_OPTIONS.gitNative = Object.assign({}, defaultGitNative, window.TIINEX_VIEWER_OPTIONS.gitNative || {});
      const EMBEDDED_DEFAULT_WORKSPACE_MD = ${embedded};
    ` };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await resolveTiinexAppConfigGithubInput('https://poc.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.selectedPlan, 'workspace-entrypoint');
  assert.equal(result.input.repository, 'Tiinex/site', 'hosted PoC gitNative config should outrank embedded docs fallback');
  assert.equal(result.input.ref, 'main');
  assert.equal(result.input.rootPath, '.topics');
  assert.equal(result.input.repoDiscovery, true);
  assert.equal(result.input.issueDiscovery, false);
  assert.equal(result.diagnostics.selectedConvention, 'defaultGitNative');
  assert.ok(fetched.includes('https://poc.example/tiinex.bundle.js'));
}


{
  const embedded = JSON.stringify(`# Continuity Context

- Current
  - Current Schema: tiinex.workspace.v1

---

${markdown.replace('Tiinex/docs', 'Wrong/embedded')}`);
  const fetchImpl = async (url) => {
    if (url === 'https://poc-literal.example/') return { ok: true, text: async () => '<script src="./tiinex.bundle.js"></script>' };
    if (url === 'https://poc-literal.example/tiinex.bundle.js') return { ok: true, text: async () => `
      const defaultGitNative = {
        enabled: true,
        loadFromUnpkg: true,
        repo: 'Tiinex/site',
        ref: 'refactor',
        rootPaths: ['.topics'],
      };
      window.TIINEX_VIEWER_OPTIONS = Object.assign({ browserTitle: 'Tiinex' }, window.TIINEX_VIEWER_OPTIONS || {});
      window.TIINEX_VIEWER_OPTIONS.gitNative = Object.assign({}, defaultGitNative, window.TIINEX_VIEWER_OPTIONS.gitNative || {});
      const EMBEDDED_DEFAULT_WORKSPACE_MD = ${embedded};
    ` };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await resolveTiinexAppConfigGithubInput('https://poc-literal.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.selectedPlan, 'workspace-entrypoint');
  assert.equal(result.input.repository, 'Tiinex/site', 'PoC-style JS object literal defaultGitNative should outrank embedded docs fallback');
  assert.equal(result.input.ref, 'refactor');
  assert.equal(result.input.rootPath, '.topics');
  assert.equal(result.input.repoDiscovery, true);
  assert.equal(result.diagnostics.selectedConvention, 'defaultGitNative');
}

{
  const fetchImpl = async (url) => {
    if (url === 'https://poc-direct-literal.example/') return { ok: true, text: async () => '<script src="./tiinex.bundle.js"></script>' };
    if (url === 'https://poc-direct-literal.example/tiinex.bundle.js') return { ok: true, text: async () => `
      window.TIINEX_VIEWER_OPTIONS = {
        browserTitle: 'Tiinex',
        gitNative: {
          enabled: true,
          repository: 'Tiinex/direct-literal',
          ref: 'main',
          rootPaths: ['.topics', '.notes'],
        },
      };
    ` };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await resolveTiinexAppConfigGithubInput('https://poc-direct-literal.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.input.repository, 'Tiinex/direct-literal');
  assert.equal(result.input.rootPath, '.topics\n.notes');
  assert.equal(result.diagnostics.selectedConvention, 'window.TIINEX_VIEWER_OPTIONS.gitNative');
}


{
  const embedded = JSON.stringify(`# Continuity Context

- Current
  - Current Schema: tiinex.workspace.v1

---

${markdown.replace('Tiinex/docs', 'Wrong/embedded')}`);
  const fetchImpl = async (url) => {
    if (url === 'https://public-build.example/') return { ok: true, text: async () => '<script src="./tiinex.bundle.js"></script>' };
    if (url === 'https://public-build.example/tiinex.bundle.js') return { ok: true, text: async () => `
      const defaultGitNative = {
        enabled: true,
        loadFromUnpkg: true,
        allowDefaultVendorUrls: true,
        depth: 1,
      };
      const existing = window.TIINEX_VIEWER_OPTIONS || {};
      window.TIINEX_VIEWER_OPTIONS = Object.assign({
        browserTitle: 'Tiinex',
        buildIdentity: {
          repository: 'Tiinex/site',
          channel: 'public',
          builtFor: 'Tiinex/site public build',
        },
      }, existing);
      window.TIINEX_VIEWER_OPTIONS.gitNative = Object.assign({}, defaultGitNative, existing.gitNative || existing.gitNativeRuntime || {});
      const EMBEDDED_DEFAULT_WORKSPACE_MD = ${embedded};
    ` };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await resolveTiinexAppConfigGithubInput('https://public-build.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.selectedPlan, 'workspace-entrypoint');
  assert.equal(result.input.repository, 'Tiinex/site', 'public-build defaultGitNative without repo should inherit buildIdentity.repository before embedded fallback');
  assert.equal(result.input.rootPath, '.topics');
  assert.equal(result.input.repoDiscovery, true);
  assert.equal(result.input.issueDiscovery, false);
  assert.equal(result.diagnostics.selectedConvention, 'defaultGitNative+buildIdentity.repository');
}

{
  const embedded = JSON.stringify(`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.workspace.v1\n\n---\n\n${markdown.replace('Tiinex/docs', 'Wrong/embedded')}`);
  const fetchImpl = async (url) => {
    if (url === 'https://public-meta.example/') return { ok: true, text: async () => `<!doctype html>
<html>
<head>
  <title>Tiinex</title>
  <meta name="tiinex:build-source" content="Tiinex/site">
</head>
<body>
<script>
(function () {
  const defaultGitNative = {
    enabled: true,
    loadFromUnpkg: true,
    allowDefaultVendorUrls: true,
    depth: 1
  };
  const existing = window.TIINEX_VIEWER_OPTIONS || {};
  window.TIINEX_VIEWER_OPTIONS = Object.assign({ createWorkspace: true, browserTitle: 'Tiinex' }, existing);
  window.TIINEX_VIEWER_OPTIONS.gitNative = Object.assign({}, defaultGitNative, existing.gitNative || existing.gitNativeRuntime || {});
})();
</script>
<script src="./tiinex.bundle.js"></script>
</body>
</html>` };
    if (url === 'https://public-meta.example/tiinex.bundle.js') return { ok: true, text: async () => `const EMBEDDED_DEFAULT_WORKSPACE_MD = ${embedded};` };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await resolveTiinexAppConfigGithubInput('https://public-meta.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.selectedPlan, 'workspace-entrypoint');
  assert.equal(result.input.repository, 'Tiinex/site', 'public index meta tiinex:build-source must bind defaultGitNative before embedded fallback');
  assert.equal(result.input.rootPath, '.topics');
  assert.equal(result.input.repoDiscovery, true);
  assert.equal(result.input.issueDiscovery, false);
  assert.equal(result.diagnostics.selectedConvention, 'defaultGitNative+meta[tiinex:build-source]');
}


{
  const embedded = JSON.stringify(`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.workspace.v1\n\n---\n\n${markdown.replace('Tiinex/docs', 'Wrong/embedded')}`);
  const fetchImpl = async (url) => {
    if (url === 'https://public-meta-only.example/') return { ok: true, text: async () => `<!doctype html>
<html>
<head>
  <title>Tiinex Lineage Viewer</title>
  <meta name="description" content="Tiinex Lineage Viewer is a static client-side viewer for portable markdown provenance, lineage, and workspace artifacts.">
  <meta name="tiinex:build-source" content="Tiinex/site">
</head>
<body>
  <div id="app"></div>
  <script src="./tiinex.bundle.js"></script>
</body>
</html>` };
    if (url === 'https://public-meta-only.example/tiinex.bundle.js') return { ok: true, text: async () => `const EMBEDDED_DEFAULT_WORKSPACE_MD = ${embedded};` };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await resolveTiinexAppConfigGithubInput('https://public-meta-only.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.selectedPlan, 'workspace-entrypoint');
  assert.equal(result.input.repository, 'Tiinex/site', 'Tiinex public build-source meta alone should outrank embedded docs fallback when the page is a Tiinex viewer');
  assert.equal(result.input.rootPath, '.topics');
  assert.equal(result.input.repoDiscovery, true);
  assert.equal(result.input.issueDiscovery, false);
  assert.equal(result.diagnostics.selectedConvention, 'meta[tiinex:build-source]+viewer-page-default');
}


{
  const embedded = JSON.stringify(`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.workspace.v1\n\n---\n\n${markdown.replace('Tiinex/docs', 'Wrong/embedded')}`);
  const fallbackMarkdown = markdown.replace('Tiinex/docs', 'Wrong/fallback');
  const fetched = [];
  const fetchImpl = async (url) => {
    fetched.push(url);
    if (url === 'https://public-build-json.example/') return { ok: true, text: async () => '<script src="./tiinex.bundle.js"></script>' };
    if (url === 'https://public-build-json.example/tiinex.bundle.js') return { ok: true, text: async () => `const EMBEDDED_DEFAULT_WORKSPACE_MD = ${embedded};` };
    if (url === 'https://public-build-json.example/tiinex.build.json') return { ok: true, text: async () => JSON.stringify({
      type: 'tiinex.public.build.identity.v1',
      repository: 'Tiinex/site',
      commitSha: '6691491f0450f115ecf806342afec86b3c6a4df4',
      buildId: 'public-1'
    }) };
    if (url === 'https://public-build-json.example/.well-known/tiinex/workspace.md') return { ok: true, text: async () => fallbackMarkdown };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await resolveTiinexAppConfigGithubInput('https://public-build-json.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.selectedPlan, 'workspace-entrypoint');
  assert.equal(result.input.repository, 'Tiinex/site', 'tiinex.build.json should outrank embedded/default workspace fallback');
  assert.equal(result.input.ref, '6691491f0450f115ecf806342afec86b3c6a4df4');
  assert.deepEqual(result.input.hostedRepoMirrorBaseUrls, ['https://public-build-json.example']);
  assert.equal(result.diagnostics.selectedConvention, 'tiinex.public.build.identity');
  assert.ok(fetched.includes('https://public-build-json.example/tiinex.build.json'));
}

{
  const fallbackMarkdown = markdown.replace('Tiinex/docs', 'Wrong/fallback');
  const fetched = [];
  const fetchImpl = async (url) => {
    fetched.push(url);
    if (url === 'https://public-build-json-cors.example/') return { ok: false, status: 0, text: async () => '' };
    if (url === 'https://public-build-json-cors.example/tiinex.build.json') return { ok: true, text: async () => JSON.stringify({ repository: 'Tiinex/site', commitSha: 'abc123' }) };
    if (url === 'https://public-build-json-cors.example/.well-known/tiinex/workspace.md') return { ok: true, text: async () => fallbackMarkdown };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await resolveTiinexAppConfigGithubInput('https://public-build-json-cors.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.input.repository, 'Tiinex/site', 'public build identity should be used even when hosted HTML cannot be inspected');
  assert.equal(result.diagnostics.publicBuildIdentity.ok, true);
  assert.equal(result.diagnostics.selectedConvention, 'tiinex.public.build.identity');
}


{
  const advertisedDocsConfig = `# Viewer

## Workspace Entrypoints

### Docs

- Source Kind: github-tree
- Repository: Tiinex/docs
- Ref: master
- Root Path: .topics
`;
  const embedded = JSON.stringify(`# Continuity Context\n\n- Current\n  - Current Schema: tiinex.workspace.v1\n\n---\n\n${advertisedDocsConfig}`);
  const fetched = [];
  const fetchImpl = async (url) => {
    fetched.push(url);
    if (url === 'https://published-react.example/') return { ok: true, text: async () => `<!doctype html>
<html data-tiinex-app="v272-react">
<head>
  <title>Tiinex</title>
  <meta name="tiinex:runtime" content="react-v297-public-build-identity-config-source">
  <meta name="tiinex:build-source" content="Tiinex/site">
  <link rel="tiinex-workspace" type="text/markdown" href="./.topics/.workspaces/viewer.workspace.md">
  <meta name="tiinex-workspace" content="./.topics/.workspaces/viewer.workspace.md">
</head>
<body>
  <div id="root"></div>
  <script src="./tiinex.bundle.js"></script>
</body>
</html>` };
    if (url === 'https://published-react.example/.topics/.workspaces/viewer.workspace.md') return { ok: true, text: async () => advertisedDocsConfig };
    if (url === 'https://published-react.example/tiinex.bundle.js') return { ok: true, text: async () => `const EMBEDDED_DEFAULT_WORKSPACE_MD = ${embedded};` };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await resolveTiinexAppConfigGithubInput('https://published-react.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.selectedPlan, 'workspace-entrypoint');
  assert.equal(result.input.repository, 'Tiinex/site', 'hosted app source declaration must outrank a bundled generic viewer.workspace.md fallback');
  assert.equal(result.input.rootPath, '.topics');
  assert.equal(result.diagnostics.selectedConvention, 'meta[tiinex:build-source]+viewer-page-default');
  assert.equal(fetched.includes('https://published-react.example/.topics/.workspaces/viewer.workspace.md'), false, 'hosted source should be selected before fetching bundled workspace fallback');
}


{
  const strongMarkdown = markdown.replace('Tiinex/docs', 'Tiinusen/config');
  const fetched = [];
  const fetchImpl = async (url) => {
    fetched.push(url);
    if (url === 'https://tiinusen-like.example/') return { ok: true, text: async () => `<!doctype html>
<html data-tiinex-app="poc">
<head>
  <title>Tiinusen</title>
  <meta name="tiinex:build-source" content="Wrong/build-source">
  <link rel="tiinex-workspace" href="/config/tiinusen.workspace.md">
</head>
<body><script src="./tiinex.bundle.js"></script></body>
</html>` };
    if (url === 'https://tiinusen-like.example/config/tiinusen.workspace.md') return { ok: true, text: async () => strongMarkdown };
    if (url === 'https://tiinusen-like.example/tiinex.bundle.js') return { ok: true, text: async () => 'const defaultGitNative = { enabled: true, rootPath: ".topics" };' };
    if (url === 'https://tiinusen-like.example/tiinex.build.json') return { ok: true, text: async () => JSON.stringify({ reason: 'issue-sync', repository: 'Wrong/build-source' }) };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await resolveTiinexAppConfigGithubInput('https://tiinusen-like.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.input.repository, 'Tiinusen/config', 'strong declared config must outrank hosted build-source heuristics');
  assert.equal(result.diagnostics.selectedConvention, 'html-declared-config');
  assert.ok(fetched.includes('https://tiinusen-like.example/config/tiinusen.workspace.md'));
}

{
  const weakDocsConfig = `# Viewer

## Workspace Discovery

- [Tiinex docs workspaces](https://github.com/Tiinex/docs)
  - Kind: github-tree
  - Ref: master
  - Root Path: .topics
  - Match: *.workspace.md
  - Label: Tiinex docs workspaces
  - Open Behavior: chooser

## Workspace Entrypoints

### Docs

- Source Kind: github-tree
- Repository: Tiinex/docs
- Ref: master
- Root Path: .topics
`;
  const issueWorkspace = `# Start

## Workspace Discovery

- [Tiinex docs workspaces](https://github.com/Tiinex/docs)
  - Kind: github-tree
  - Ref: master
  - Root Path: .topics
  - Match: *.workspace.md
  - Label: Tiinex docs workspaces
  - Open Behavior: chooser

## Workspace Entrypoints

### Tiinex

- Source Kind: github-tree
- Workspace Label: Tiinex
- Repository: Tiinex/site
- Ref: master
- Root Path: .topics
- Repo Files Discovery: off
- Issue Discovery: off
- Issue URL: https://github.com/Tiinex/site/issues/1
- Issue URL: https://github.com/Tiinex/site/issues/2
`;
  const fetched = [];
  const fetchImpl = async (url) => {
    fetched.push(url);
    if (url === 'https://issue-sync.example/') return { ok: true, text: async () => `<!doctype html>
<html data-tiinex-app="poc">
<head>
  <title>Tiinex Lineage Viewer</title>
  <meta name="tiinex:build-source" content="Tiinex/site">
  <link rel="tiinex-workspace" type="text/markdown" href="./.topics/.workspaces/viewer.workspace.md">
</head>
<body><div id="app"></div><script src="./tiinex.bundle.js"></script></body>
</html>` };
    if (url === 'https://issue-sync.example/.topics/.workspaces/viewer.workspace.md') return { ok: true, text: async () => weakDocsConfig };
    if (url === 'https://issue-sync.example/tiinex.bundle.js') return { ok: true, text: async () => '' };
    if (url === 'https://issue-sync.example/tiinex.build.json') return { ok: true, text: async () => JSON.stringify({
      type: 'tiinex.public.build.identity.v1',
      reason: 'issue-sync',
      repository: 'Tiinex/site',
      commitSha: '6691491f0450f115ecf806342afec86b3c6a4df4',
      releaseCacheKey: 'issue-sync-Tiinex-site-6691491f0450'
    }) };
    if (url === 'https://api.github.com/repos/Tiinex/site/issues/1') return { ok: true, text: async () => JSON.stringify({ body: issueWorkspace, html_url: 'https://github.com/Tiinex/site/issues/1' }) };
    return { ok: false, status: 404, text: async () => '' };
  };
  const result = await resolveTiinexAppConfigGithubInput('https://issue-sync.example/', { fetchImpl, parseWorkspaceConfig: globalThis.TiinexWorkspaceConfig.parseWorkspaceConfig });
  assert.equal(result.ok, true);
  assert.equal(result.selectedPlan, 'workspace-entrypoint', 'issue-sync root workspace should apply the active/source entrypoint, not chooser discovery');
  assert.equal(result.input.repository, 'Tiinex/site');
  assert.equal(result.input.repoDiscovery, false);
  assert.equal(result.input.issueDiscovery, false, 'issue discovery stays off; explicit issue URLs still request issue snapshots');
  assert.equal(result.input.issueUrls, 'https://github.com/Tiinex/site/issues/1\nhttps://github.com/Tiinex/site/issues/2');
  assert.equal(result.diagnostics.selectedConvention, 'github-issue-embedded-workspace');
  assert.equal(fetched.includes('https://issue-sync.example/.topics/.workspaces/viewer.workspace.md'), false, 'weak packaged workspace fallback must not be fetched before issue-sync root pointer');
}

console.log('tiinexAppConfigSource: ok');
