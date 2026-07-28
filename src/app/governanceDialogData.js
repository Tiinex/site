import { buildGovernanceBoundaryForSource } from '../governance/governance.boundary.js';
import { readGithubCachedTextForSourcePath } from '../sources/github/github.transport.js';

export function sourceGovernanceDialogData(source = {}, workspace = {}, env = {}) {
  const boundary = source.governanceBoundary?.schema
    ? source.governanceBoundary
    : buildGovernanceBoundaryForSource(source, {
        records: (workspace.records || []).filter((record) => String(record?.source?.id || '') === String(source.id || '')),
        assets: (workspace.assets || []).filter((asset) => String(asset?.source?.id || '') === String(source.id || '')),
        rootChecked: false,
        discoveredFrom: 'source-governance-dialog'
      });
  const storage = env.storage || (typeof window !== 'undefined' ? window.localStorage : null);
  const documents = [boundary?.policy, boundary?.notice]
    .filter((item) => item && item.path)
    .map((file) => {
      const cached = readGithubCachedTextForSourcePath(source, file.path, { storage });
      return {
        kind: file.kind || file.path,
        path: file.path,
        url: file.url || cached?.url || '',
        markdown: cached?.body || '',
        cacheState: cached?.cache ? `source-cache:${cached.cache}` : (file.contentAvailable ? 'content-not-in-route-state' : 'metadata-only')
      };
    });
  return { boundary, documents };
}
