import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';

export function targetAuthorizedByDeclaredParent(record, step, approval, desiredTarget) {
  let parsed;
  try { parsed = parseArtifactMarkdown(record?.markdown || ''); } catch { return false; }
  const trace = String(parsed.envelope?.parent?.trace || '').trim();
  const browse = String((parsed.envelope?.parent?.originEntries || []).find((entry) => entry.label === 'browse + git')?.target || '');
  if (step?.action === 'update-parent-origin-permalink') return true;
  if (step?.action === 'review-parent-target-mismatch' && approval?.targetDisposition === 'repaired-local-parent') return Boolean(trace && desiredTarget === trace);
  return desiredTarget === (browse || trace);
}

export function providerMaterialMatches(providerEvidence = {}, target = '', parentMarkdown = '', allowHistoricalMismatch = false) {
  const locator = parseGithubBlobTarget(target);
  if (!locator) return false;
  for (const observation of providerEvidence.observations || []) {
    for (const file of observation.files || []) {
      if (file.source?.repository !== locator.repository) continue;
      if (String(file.source?.commit || file.source?.ref || '') !== locator.commit) continue;
      if (normalizePath(file.source?.path || file.path || '') !== normalizePath(locator.path)) continue;
      if (allowHistoricalMismatch || file.content === String(parentMarkdown || '')) return true;
    }
  }
  return false;
}

function parseGithubBlobTarget(value = '') {
  try {
    const url = new URL(String(value || ''));
    if (url.protocol !== 'https:' || url.hostname !== 'github.com') return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 5 || parts[2] !== 'blob' || !/^[0-9a-f]{40}$/.test(parts[3])) return null;
    return Object.freeze({ repository: `${parts[0]}/${parts[1]}`, commit: parts[3], path: parts.slice(4).join('/') });
  } catch { return null; }
}
function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\.\//, '').replace(/^\/+|\/+$/g, ''); }
