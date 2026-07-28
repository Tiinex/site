import { portableOperationResult as operationResult } from '../operation.result.js';
import { createPortableLocalArtifactSet } from '../draft/draft.set.js';
import { prepareEpistemicMaterialization } from './epistemic.plan.js';

export function preparePortableMaterialization(input = {}, options = {}) {
  const result = prepareEpistemicMaterialization(input, options);
  return operationResult('prepare-materialization', {
    status: result.status,
    material: result.material,
    candidateSchemas: result.candidateSchemas,
    parentCandidates: result.parentCandidates,
    proposals: result.proposals,
    clarificationNeeds: result.clarificationNeeds,
    lineage: result.lineage,
    epistemicBoundary: result.epistemicBoundary,
    findings: result.findings
  });
}

export function createPortableArtifactSet(input = {}, options = {}) {
  const result = createPortableLocalArtifactSet(input, options);
  return operationResult('create-local-artifact-set', {
    status: result.status,
    plan: result.plan,
    artifacts: result.artifacts,
    lineageClosure: result.lineageClosure,
    boundary: result.boundary,
    findings: result.findings
  });
}
