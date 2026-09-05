import { projectSchemaFactoryViewerCreateAction, projectSchemaFactoryViewerCreateActions } from '../schemas/schema.factory.viewerProjection.js';

export const SCHEMA_FACTORY_VIEWER_PROOF_SCHEMA_IDS = Object.freeze([
  'tiinex.decision.v1',
  'tiinex.evidence.v1',
  'tiinex.handoff.v1',
  'tiinex.validation.finding.v1',
  'tiinex.validation.method.v1',
  'tiinex.validation.report.v1'
]);

export function schemaFactoryViewerProofCapabilities() {
  return Object.freeze(SCHEMA_FACTORY_VIEWER_PROOF_SCHEMA_IDS.map(projectSchemaFactoryViewerCreateAction));
}

export function schemaFactoryViewerProofActions() {
  return projectSchemaFactoryViewerCreateActions(SCHEMA_FACTORY_VIEWER_PROOF_SCHEMA_IDS);
}

export const SCHEMA_FACTORY_VIEWER_PROOF_BOUNDARY = 'Task-bounded Viewer qualification set only. Membership is product-proof scope, not schema semantics, transition applicability, companion policy, or catalog-wide creatability authority. Generation descriptors remain visible even when no invocable Create transition is qualified.';
