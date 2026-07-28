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

console.log('tiinexAppConfigSource: ok');
