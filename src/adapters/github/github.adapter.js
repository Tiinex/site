import { AdapterAvailability, makeAdapterDefinition, makeAdapterResult } from '../adapter.contracts.js';
import { loadGithubFilesForSource } from '../../sources/github/github.loader.js';

export const GITHUB_ADAPTER_ID = 'github';

export function createGithubAdapter() {
  return makeAdapterDefinition({
    id: GITHUB_ADAPTER_ID,
    label: 'GitHub',
    availability: AdapterAvailability.available,
    sourceKinds: ['github.repo', 'github.file', 'github.issue-snapshot'],
    capabilities: {
      registerSource: true,
      materialize: true,
      discover: false,
      resolveAsset: true,
      openExternal: true,
      requiresBridge: false
    },
    configShape: {
      repo: 'owner/name',
      ref: 'branch | tag | commit',
      rootPath: 'repo-relative root path',
      fileRefs: 'explicit Markdown paths or raw/blob URLs'
    },
    boundary: 'explicit GitHub source boundary; public raw/blob file reads only in browser viewer',
    notes: ['No repo crawl, auth, issue crawl, or mirror snapshot in this adapter slice.']
  });
}

export async function materializeGithubFiles(source, fileRefs = [], options = {}) {
  const result = await loadGithubFilesForSource(source, fileRefs, options);
  return makeAdapterResult({
    adapterId: GITHUB_ADAPTER_ID,
    sourceId: source?.id || '',
    records: result.records,
    errors: result.errors,
    okCount: result.okCount,
    failCount: result.failCount,
    diagnostics: {
      transport: 'public-raw-github',
      fileRefs: Array.isArray(fileRefs) ? fileRefs.length : 0
    }
  });
}
