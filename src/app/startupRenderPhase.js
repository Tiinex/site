export function initialStartupRenderPhase({ locationLike = null, routeResolved = false } = {}) {
  const hash = String(locationLike?.hash || '');
  if (!hash.startsWith('#state=')) return 'resolving';
  return routeResolved ? 'resolved' : 'resolving';
}

export function shouldRenderProductStage(startupPhase = 'resolving') {
  return startupPhase === 'resolved' || startupPhase === 'failed';
}
