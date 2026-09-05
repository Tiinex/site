const BLOCKER_TOKEN = /\b(block(?:ed|er|ing)?|unavailable|missing|insufficient|waiting)\b/ig;
const NEGATED_BLOCKER = /\b(?:must|should|shall|will|would|can|could|does|do|did|is|are|was|were)?\s*(?:not|never)\s+(?:be\s+)?(?:a\s+)?(?:block(?:ed|er|ing)?|unavailable|missing|insufficient|waiting)\b/i;
const NON_BLOCKING = /\b(?:non[- ]?blocking|without\s+blocking)\b/i;

export function hasPositiveBlockingCue(value = '') {
  const text = String(value || '').trim();
  if (!text || NON_BLOCKING.test(text)) return false;
  const matches = [...text.matchAll(BLOCKER_TOKEN)];
  if (!matches.length) return false;
  for (const match of matches) {
    const start = Math.max(0, Number(match.index || 0) - 48);
    const end = Math.min(text.length, Number(match.index || 0) + String(match[0] || '').length + 16);
    if (!NEGATED_BLOCKER.test(text.slice(start, end))) return true;
  }
  return false;
}
