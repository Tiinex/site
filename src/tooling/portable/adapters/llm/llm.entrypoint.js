import { listPortableOperations, runPortableOperation } from '../../operation.catalog.js';
import { openPortableSession, restorePortableSession } from '../../session/portable.session.js';

export const TIINEX_LLM_ENTRYPOINT_SCHEMA_ID = 'tiinex.llm.entrypoint.v1';

export function openTiinexLlmSession(input = {}) {
  return openPortableSession(input);
}

export function restoreTiinexLlmSession(snapshot = {}) {
  return restorePortableSession(snapshot);
}

export async function runTiinexLlmOperation(operation, input = {}, options = {}) {
  return runPortableOperation(operation, input, options);
}

export function describeTiinexLlmEntrypoint() {
  return Object.freeze({
    schema: TIINEX_LLM_ENTRYPOINT_SCHEMA_ID,
    boundary: Object.freeze({
      material: 'supplied attachments, project sources, or explicit records',
      sourceProvenance: 'explicit-only; local material is never guessed as GitHub-backed',
      remoteFetch: false,
      remoteWrite: false,
      sourceMutation: false,
      receivedCodeExecution: false
    }),
    operations: listPortableOperations().operations,
    bootstrap: 'src/tooling/portable/bootstrap/tiinex.llm.bootstrap.md'
  });
}
