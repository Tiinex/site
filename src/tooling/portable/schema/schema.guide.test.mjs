import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { compilePortableSchemaGuide, planPortableArtifactCreation, readPortableSchemaSection } from '../engine.facade.js';

const evidenceSchema = await readFile(new URL('../../../schemas/core/evidence/tiinex.evidence.v1.schema.md', import.meta.url), 'utf8');
const rootSchema = await readFile(new URL('../../../schemas/tiinex.root.v1.schema.md', import.meta.url), 'utf8');
const topicSchema = await readFile(new URL('../../../schemas/core/topic/tiinex.topic.v1.schema.md', import.meta.url), 'utf8');
const material = { files: [{ path: 'schemas/tiinex.evidence.v1.schema.md', content: evidenceSchema }] };

const first = compilePortableSchemaGuide({ ...material, schemaId: 'tiinex.evidence.v1', task: 'create', detail: 'compact' });
const second = compilePortableSchemaGuide({ ...material, schemaId: 'tiinex.evidence.v1', task: 'create', detail: 'compact' });
assert.equal(first.guide.schema, 'tiinex.llm.schema-guide.v1');
assert.equal(first.guide.cacheKey, second.guide.cacheKey);
assert.equal(first.guide.requiredStructure.includes('Evidence Material'), true);
assert.equal(first.guide.requiredFields.includes('Known Source'), true);
assert.equal(first.guide.hardRules.some((rule) => /must not|does not|not silently/i.test(rule)), true);
assert.equal(first.guide.retrieval.fullSchemaAvailable, true);
assert.equal(first.guide.capability.resolvedThrough, 'tiinex.evidence.v1');

const companion = compilePortableSchemaGuide({
  ...material,
  schemaId: 'tiinex.evidence.v1',
  task: 'create',
  llmCompanion: {
    version: 'test-1',
    tasks: {
      create: {
        purpose: 'Create bounded evidence without promoting it to truth.',
        authoringSteps: ['Separate preserved material from interpretation.'],
        commonFailures: ['Calling evidence proof.']
      }
    }
  }
});
assert.equal(companion.guide.purpose.includes('bounded evidence'), true);
assert.equal(companion.guide.authoringSteps[0], 'Separate preserved material from interpretation.');
assert.equal(companion.guide.commonFailures.includes('Calling evidence proof.'), true);
assert.equal(companion.guide.cacheBasis.companionVersion, 'test-1');

const companionCollection = compilePortableSchemaGuide({
  ...material,
  schemaId: 'tiinex.evidence.v1',
  task: 'create',
  llmCompanions: {
    'tiinex.evidence.v1': {
      schema: 'tiinex.llm.schema-companion.v1',
      schemaId: 'tiinex.evidence.v1',
      version: 'collection-1',
      tasks: {
        create: {
          prioritySections: ['Artifact Creation Contract'],
          retrievalHints: ['read:Interpretation Boundaries']
        }
      }
    }
  }
});
assert.equal(companionCollection.guide.companion.source, 'supplied-collection');
assert.equal(companionCollection.guide.retrieval.recommendedNext.includes('read:Artifact Creation Contract'), true);
assert.equal(companionCollection.guide.retrieval.recommendedNext.includes('read:Interpretation Boundaries'), true);

const companionData = compilePortableSchemaGuide({
  files: [
    ...material.files,
    {
      path: 'schemas/tiinex.evidence.v1.llm.json',
      content: JSON.stringify({
        schema: 'tiinex.llm.schema-companion.v1',
        schemaId: 'tiinex.evidence.v1',
        version: 'data-1',
        tasks: { create: { commonFailures: ['Confusing evidence with attestation.'] } }
      })
    }
  ],
  schemaId: 'tiinex.evidence.v1',
  task: 'create'
});
assert.equal(companionData.guide.companion.source, 'supplied-companion-data');
assert.equal(companionData.guide.commonFailures.includes('Confusing evidence with attestation.'), true);

const section = readPortableSchemaSection({ ...material, schemaId: 'tiinex.evidence.v1', sections: ['Artifact Creation Contract'] });
assert.equal(section.matches.length, 1);
assert.equal(section.matches[0].content.includes('Creation Fields'), true);
assert.equal(section.matches[0].content.includes('Minimal Example'), false);

const plan = planPortableArtifactCreation({
  ...material,
  schemaId: 'tiinex.evidence.v1',
  inputs: {
    'Supported Claim Or Question': 'Does the recording show overflow?'
  }
});
assert.equal(plan.plan.readyToDraft, false);
assert.equal(plan.plan.missingInputs.includes('Known Source'), true);
assert.equal(plan.plan.structure[0].section, 'Supported Claim Or Question');

const rootMaterial = { files: [{ path: 'schemas/tiinex.root.v1.schema.md', content: rootSchema }] };
const rootGuide = compilePortableSchemaGuide({ ...rootMaterial, schemaId: 'tiinex.root.v1', task: 'create', detail: 'standard' });
assert.equal(rootGuide.guide.requiredFields.includes('Current Schema'), true);
assert.equal(rootGuide.guide.requiredFields.includes('Parent Schema'), false);
assert.equal(rootGuide.guide.requiredFields.includes('Trace'), false);
assert.equal(rootGuide.guide.conditionalRequirements.some((entry) => entry.group === 'Parent'), true);


const topicMaterial = { files: [{ path: 'schemas/tiinex.topic.v1.schema.md', content: topicSchema }] };
const topicGuide = compilePortableSchemaGuide({ ...topicMaterial, schemaId: 'tiinex.topic.v1', task: 'create', detail: 'standard' });
assert.deepEqual(topicGuide.guide.requiredInputs, ['Summary', 'Current Read', 'Design Direction', 'Next Artifacts']);
assert.deepEqual(topicGuide.guide.requiredStructure, ['Current Read', 'Design Direction', 'Next Artifacts']);
assert.equal(topicGuide.guide.requiredInputs.includes('version'), false);
assert.equal(topicGuide.guide.requiredInputs.includes('createTitle'), false);
assert.equal(topicGuide.guide.toolingConfiguration.authoringInputs, false);
assert.equal(topicGuide.guide.toolingConfiguration.fields.includes('summaryPrompt'), true);
const topicPlan = planPortableArtifactCreation({
  ...topicMaterial,
  schemaId: 'tiinex.topic.v1',
  inputs: {
    Summary: 'Portable topic',
    'Current Read': 'Current state.',
    'Design Direction': 'Next direction.',
    'Next Artifacts': 'Follow-up artifacts.'
  }
});
assert.equal(topicPlan.plan.readyToDraft, true);
assert.deepEqual(topicPlan.plan.missingInputs, []);

console.log('✓ portable schema guide, progressive retrieval, companion hints, and artifact plan passed');
