import { ShareAccessStatus, ShareScope, ShareTargetStatus } from './shareProjection.js';

export const ShareActionKind = Object.freeze({
  publicUrl: 'copy-public-url',
  exactStateUrl: 'copy-exact-state-url'
});

export async function executeShareProjectionAction({ projection = null, clipboard = null, label = '', action = '' } = {}) {
  const selectedAction = chooseAllowedAction(projection, action);
  if (!selectedAction) return Object.freeze({ ok: false, copied: false, action: '', url: '', notice: unavailableNotice(projection, label) });
  const url = selectedAction === ShareActionKind.publicUrl ? String(projection?.publicUrl || '') : String(projection?.exactStateUrl || '');
  if (!url) return Object.freeze({ ok: false, copied: false, action: selectedAction, url: '', notice: unavailableNotice(projection, label) });
  if (typeof clipboard?.writeText !== 'function') return Object.freeze({ ok: false, copied: false, action: selectedAction, url, notice: 'Clipboard access is unavailable. No share link was copied.' });
  try {
    await clipboard.writeText(url);
    return Object.freeze({ ok: true, copied: true, action: selectedAction, url, notice: successNotice(projection, label, selectedAction) });
  } catch (_) {
    return Object.freeze({ ok: false, copied: false, action: selectedAction, url, notice: 'Could not copy the share link. Clipboard access may be blocked.' });
  }
}

function chooseAllowedAction(projection, requested = '') {
  const allowed = new Set(Array.isArray(projection?.allowedActions) ? projection.allowedActions : []);
  const explicit = String(requested || '').trim();
  if (explicit && allowed.has(explicit)) return explicit;
  if (allowed.has(ShareActionKind.publicUrl)) return ShareActionKind.publicUrl;
  if (allowed.has(ShareActionKind.exactStateUrl)) return ShareActionKind.exactStateUrl;
  return '';
}

function successNotice(projection, label, action) {
  if (action === ShareActionKind.exactStateUrl) return 'Copied an exact link to the current view. Some material may be unavailable to the recipient.';
  const subject = shareSubject(projection?.scope, label);
  const notes = [`Copied a reconstructive link for ${subject}.`];
  if (projection?.localMaterialWarning) notes.push('Browser-local material is not included.');
  if (projection?.accessStatus === ShareAccessStatus.accessBound) notes.push('The recipient may need access to the source.');
  else if (projection?.accessStatus === ShareAccessStatus.unknown) notes.push('Recipient access to the source is not known.');
  return notes.join(' ');
}

function unavailableNotice(projection, label) {
  const subject = shareSubject(projection?.scope, label, true);
  if (projection?.targetStatus === ShareTargetStatus.localOnly) return `${subject} is browser-local and has no reconstructive share link.`;
  if ((projection?.warnings || []).some((warning) => warning?.code === 'share.public-target-unsupported')) return `${subject} has a source target, but the current public viewer cannot reconstruct it.`;
  if (projection?.scope === ShareScope.current) return 'An exact link to the current view is unavailable.';
  return `${subject} does not have a truthful reconstructive share link.`;
}

function shareSubject(scope, label = '', sentenceStart = false) {
  const clean = String(label || '').trim();
  if (scope === ShareScope.workspace) return clean ? `workspace “${clean}”` : 'this workspace';
  if (scope === ShareScope.workspaceSet) return clean ? `workspace set “${clean}”` : 'this workspace set';
  if (scope === ShareScope.artifact) return clean ? `artifact “${clean}”` : (sentenceStart ? 'This artifact' : 'this artifact');
  return 'the current view';
}
