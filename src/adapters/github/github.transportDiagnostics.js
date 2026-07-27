import { normalizeGithubTransportTier } from '../../sources/github/github.transport.js';

export function summarizeTransportTiers(events = []) {
  const counts = { cache: 0, mirror: 0, proxy: 0, direct: 0, skipped: 0, failed: 0 };
  for (const event of Array.isArray(events) ? events : []) {
    const tier = String(event.tier || '').toLowerCase();
    if (counts[tier] != null && /\.ok$|\.hit$/u.test(String(event.code || ''))) counts[tier] += 1;
    if (/configured-unavailable|unavailable/u.test(String(event.code || ''))) counts.skipped += 1;
    if (/failed|exception|exhausted/u.test(String(event.code || ''))) counts.failed += 1;
  }
  return counts;
}

export function summarizeTransportOutcome(events = [], plan = {}, options = {}) {
  const attempted = new Set();
  const winning = new Set();
  const skipped = [];
  const failed = [];
  let activeTier = '';
  let activeStatus = 'idle';
  for (const event of Array.isArray(events) ? events : []) {
    const tier = String(event.tier || '').toLowerCase();
    const code = String(event.code || '');
    if (!tier || !['cache', 'mirror', 'proxy', 'direct'].includes(tier)) continue;
    if (/\.try$|\.miss$|\.hit$|\.ok$|configured-unavailable|unavailable|failed|exception/u.test(code)) {
      attempted.add(tier);
      activeTier = tier;
      activeStatus = 'attempted';
    }
    if (/\.ok$|\.hit$/u.test(code)) {
      winning.add(tier);
      activeTier = tier;
      activeStatus = 'ok';
    }
    if (/configured-unavailable|unavailable/u.test(code)) {
      skipped.push({ tier, code, resource: event.resource || '', message: event.message || '' });
      activeTier = tier;
      activeStatus = 'unavailable';
    }
    if (/failed|exception|exhausted/u.test(code)) {
      failed.push({ tier, code, resource: event.resource || '', status: event.status || 0, message: event.message || '' });
      activeTier = tier;
      activeStatus = 'failed';
    }
  }
  const requestedTier = Array.isArray(options.preferredTransports) && options.preferredTransports.length === 1
    ? normalizeGithubTransportTier(options.preferredTransports[0] || '')
    : '';
  const winningList = Array.from(winning);
  const attemptedList = Array.from(attempted);
  const sequenceTier = winningList[winningList.length - 1]
    || (activeStatus === 'failed' || activeStatus === 'unavailable' ? activeTier : '')
    || requestedTier
    || '';
  return {
    schema: 'tiinex.github.transport.outcome.v1',
    configuredPlan: Array.isArray(plan.tiers) ? plan.tiers.slice() : [],
    configured: plan.configured ? Object.assign({}, plan.configured) : {},
    requestedTier,
    sequenceTier,
    activeTier,
    activeStatus,
    attemptedTiers: attemptedList,
    winningTiers: winningList,
    skipped,
    failed
  };
}
