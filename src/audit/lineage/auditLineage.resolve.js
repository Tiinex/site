import { resolveLineage } from '../../lineage/lineage.resolve.js';

export function resolveAuditLineage(nodes = []) {
  const result = resolveLineage(nodes, { depth: 'loaded-audit' });
  return {
    schema: 'tiinex.audit.lineage.resolve.v1',
    nodes: result.nodes,
    edges: result.edges,
    findings: result.findings,
    stats: result.stats
  };
}
