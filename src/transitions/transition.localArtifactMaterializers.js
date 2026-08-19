import {
  CANONICAL_TOPIC_SCHEMA_ID,
  qualifyCanonicalTopicLocalArtifact,
  renderCanonicalTopicLocalArtifact
} from './transition.topicMaterializer.js';
import {
  CANONICAL_TASK_SCHEMA_ID,
  qualifyCanonicalTaskLocalArtifact,
  renderCanonicalTaskLocalArtifact
} from './transition.taskMaterializer.js';
import {
  CANONICAL_RELATION_SCHEMA_ID,
  qualifyCanonicalRelationLocalArtifact,
  renderCanonicalRelationLocalArtifact
} from './transition.relationMaterializer.js';
import {
  CANONICAL_INTERPRETATION_SCHEMA_ID,
  qualifyCanonicalInterpretationLocalArtifact,
  renderCanonicalInterpretationLocalArtifact
} from './transition.interpretationMaterializer.js';

const registry = Object.freeze({
  [CANONICAL_TOPIC_SCHEMA_ID]: Object.freeze({
    schemaId: CANONICAL_TOPIC_SCHEMA_ID,
    label: 'Topic',
    render: renderCanonicalTopicLocalArtifact,
    qualify: qualifyCanonicalTopicLocalArtifact,
    fixedInputs: () => Object.freeze({}),
    continuityModes: Object.freeze(['root'])
  }),
  [CANONICAL_TASK_SCHEMA_ID]: Object.freeze({
    schemaId: CANONICAL_TASK_SCHEMA_ID,
    label: 'Task',
    render: renderCanonicalTaskLocalArtifact,
    qualify: qualifyCanonicalTaskLocalArtifact,
    fixedInputs: () => Object.freeze({}),
    continuityModes: Object.freeze(['parent', 'root'])
  }),
  [CANONICAL_RELATION_SCHEMA_ID]: Object.freeze({
    schemaId: CANONICAL_RELATION_SCHEMA_ID,
    label: 'Relation',
    render: renderCanonicalRelationLocalArtifact,
    qualify: qualifyCanonicalRelationLocalArtifact,
    fixedInputs: () => Object.freeze({}),
    continuityModes: Object.freeze(['root'])
  }),
  [CANONICAL_INTERPRETATION_SCHEMA_ID]: Object.freeze({
    schemaId: CANONICAL_INTERPRETATION_SCHEMA_ID,
    label: 'Interpretation',
    render: renderCanonicalInterpretationLocalArtifact,
    qualify: qualifyCanonicalInterpretationLocalArtifact,
    fixedInputs: ({ parent = {} } = {}) => Object.freeze({ 'Source Target': canonicalSourceTargetForParent(parent) }),
    continuityModes: Object.freeze(['parent'])
  })
});

export function localArtifactMaterializerForSchema(schemaId = '') {
  return registry[String(schemaId || '').trim()] || null;
}

export function localArtifactMaterializerAuthoringFixedInputs(schemaId = '', context = {}) {
  const materializer = localArtifactMaterializerForSchema(schemaId);
  return materializer?.fixedInputs ? materializer.fixedInputs(context) : Object.freeze({});
}

export function supportedLocalArtifactMaterializerSchemaIds() { return Object.freeze(Object.keys(registry)); }

export function canonicalSourceTargetForParent(parent = {}) {
  const traceTarget = String(parent.traceTarget || '').trim();
  const originTarget = String(parent.originTarget || '').trim();
  const kind = String(parent.representationKind || '').trim();
  if ((kind === 'github-issue-embedded' || kind === 'github-comment-embedded') && traceTarget && originTarget) return `${traceTarget} @ ${originTarget}`;
  return traceTarget || originTarget;
}
