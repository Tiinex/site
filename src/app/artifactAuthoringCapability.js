import { transitionDefinitionsForRecord } from '../transitions/transition.definitions.js';
import { canDiscardLocalDraft, canEditLocalDraft } from '../artifacts/artifact.localDraft.js';
import { durableLocalMutationDecision, DurableLocalMutationOperation } from './durableLocalMutationPolicy.js';

export const ARTIFACT_AUTHORING_CAPABILITY_SCHEMA_ID = 'tiinex.artifact.authoring-capability.v1';
export const ArtifactAuthoringOperation = Object.freeze({
  createFromTransition: 'createFromTransition',
  createRoot: 'createRoot',
  editLocalDraft: 'editLocalDraft',
  discardLocalDraft: 'discardLocalDraft'
});

export function projectArtifactAuthoringCapability(record = {}, options = {}) {
  const transitions = transitionDefinitionsForRecord(record, options.transitionOptions || {});
  const createAuthority = durableLocalMutationDecision(options.persistenceOwnership, DurableLocalMutationOperation.localDraftCreate);
  const discardAuthority = durableLocalMutationDecision(options.persistenceOwnership, DurableLocalMutationOperation.localDraftDelete);
  const editEligible = canEditLocalDraft(record);
  const discardEligible = canDiscardLocalDraft(record);
  return Object.freeze({
    schema: ARTIFACT_AUTHORING_CAPABILITY_SCHEMA_ID,
    recordId: String(record?.id || ''),
    operations: Object.freeze({
      createFromTransition: operation({
        available: Boolean(transitions.length && createAuthority.ok),
        known: Boolean(transitions.length),
        owner: 'schema-transition/createContinuationDraft',
        reason: transitions.length ? (createAuthority.ok ? 'Schema-owned transition creation is available.' : createAuthority.notice) : 'No schema-owned authoring transition is available for this artifact.'
      }),
      createRoot: operation({ available: false, known: true, owner: 'not-yet-owned', reason: 'Standalone/root artifact creation is not implemented in M4-A.' }),
      editLocalDraft: operation({
        available: Boolean(editEligible && createAuthority.ok),
        known: editEligible,
        owner: 'local-draft-update-command',
        reason: !editEligible ? 'Only supported browser-local draft schemas can be edited.' : (createAuthority.ok ? 'This browser-local draft can be edited.' : createAuthority.notice)
      }),
      discardLocalDraft: operation({
        available: Boolean(discardEligible && discardAuthority.ok),
        known: discardEligible,
        owner: 'local-draft-discard-command',
        reason: !discardEligible ? 'Only browser-local drafts can be discarded.' : (discardAuthority.ok ? 'This browser-local draft can be discarded.' : discardAuthority.notice)
      })
    }),
    transitions: Object.freeze(transitions.slice())
  });
}

function operation({ available = false, known = false, owner = '', reason = '' } = {}) {
  return Object.freeze({ available: Boolean(available), known: Boolean(known), owner: String(owner || ''), reason: String(reason || '') });
}
