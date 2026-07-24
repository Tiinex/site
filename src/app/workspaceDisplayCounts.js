import { buildWorkspaceAuditView } from '../workspaces/workspace.auditView.js';
import { buildDiscoveryDisplayOptionCounts } from '../workspaces/workspace.discoveryView.js';

export function buildDisplayOptionCounts(workspace = {}) {
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const audit = buildWorkspaceAuditView(workspace, { records, query: '' });
  const auditById = new Map((audit.items || []).map((item) => [item.id, item]));
  return buildDiscoveryDisplayOptionCounts(workspace, { records, auditById });
}
