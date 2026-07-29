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

console.log('tiinexAppConfigSource: ok');
