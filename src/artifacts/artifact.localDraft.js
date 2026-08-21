import { schemaIdForRecord } from '../schemas/schema.identity.js';

export const LOCAL_DRAFT_ARTIFACT_POLICY_ID = 'tiinex.artifact.local-draft-policy.v1';
export const EDITABLE_LOCAL_DRAFT_SCHEMA_IDS = Object.freeze(['tiinex.task.v1']);

export function localDraftArtifactPolicy(record = {}) {
  const source = record?.source || {};
  const sourceMode = String(record?.sourceMode || '').trim().toLowerCase();
  const status = String(record?.status || record?.lifecycleStatus || record?.currentStatus || record?.envelope?.current?.status || '').trim().toLowerCase();
  const schemaId = artifactSchemaId(record);
  const localSource = source.adapterId === 'local' || source.kind === 'local-session' || source.kind === 'local' || source.sourceKind === 'local.session';
  const draftLike = sourceMode.startsWith('local-transition') || sourceMode.startsWith('local-reference') || sourceMode.startsWith('local-draft') || status === 'draft' || status === 'local' || status === 'draft/local';
  const localDraft = Boolean(localSource && draftLike && record?.id);
  return Object.freeze({
    schema: LOCAL_DRAFT_ARTIFACT_POLICY_ID,
    localDraft,
    schemaId,
    editLocalDraft: Boolean(localDraft && EDITABLE_LOCAL_DRAFT_SCHEMA_IDS.includes(schemaId)),
    discardLocalDraft: localDraft,
    sourceBacked: !localSource
  });
}

export function canEditLocalDraft(record = {}) { return localDraftArtifactPolicy(record).editLocalDraft; }
export function canDiscardLocalDraft(record = {}) { return localDraftArtifactPolicy(record).discardLocalDraft; }

export function artifactSchemaId(record = {}) { return schemaIdForRecord(record); }
