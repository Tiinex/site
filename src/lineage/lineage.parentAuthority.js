import { LineageResolutionStatus } from './lineage.model.js';

export function exactUnloadedParent(recoveryTarget = '', method = 'declared-parent-unloaded') {
  return { unresolvedExact: true, recoveryTarget: String(recoveryTarget || '').trim(), method, status: LineageResolutionStatus.missing };
}
