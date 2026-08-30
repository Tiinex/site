import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { compilePortableSchemaContractChain } from './contract.compile.js';
import { validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { resolveSchemaModule } from '../../../schemas/resolver.js';
import { qualifiedLocalRootRuntimeProjection, portableRuntimeValidationContractForSchema } from './qualifiedLocalRoot.runtime.js';

const projection = qualifiedLocalRootRuntimeProjection();
const rootUrl = new URL('./bootstrap/qualified-local-root/tiinex.root.v1.schema.md', import.meta.url);
const markdown = await readFile(rootUrl, 'utf8');
const bytes = Buffer.from(markdown, 'utf8');
assert.equal(bytes.byteLength, projection.source.bytes);
assert.equal(createHash('sha256').update(bytes).digest('hex'), projection.source.sha256);
const self = validatedC14nV2PrimarySelfDigest(markdown);
assert.equal(self.state, 'verified');
assert.equal(self.value, projection.source.c14nV2Self);
const compiledLocalRoot = compilePortableSchemaContractChain([markdown]);
assert.equal(compiledLocalRoot.lineageQualification.state, 'valid');
const localParentOrigin = compiledLocalRoot.validation.conditionalRequirements.find((entry) => entry.name === 'Parent Origin');
assert.deepEqual(localParentOrigin.requiredFields, []);
assert.deepEqual(localParentOrigin.allowedLabels, ['relative', 'absolute', 'browse + git']);

const taskModule = resolveSchemaModule({ schemaId: 'tiinex.task.v1' }).module;
const publishedQualification = taskModule.schemaSource.qualify();
const publishedContract = publishedQualification.compiledContract.validationContract;
const publishedParentOrigin = publishedContract.validation.conditionalRequirements.find((entry) => entry.name === 'Parent Origin');
assert(publishedParentOrigin.requiredFields.includes('browse + git'), 'historical published Root projection must remain byte-/binding-truthful until actual publication repins it');
const bindingBefore = JSON.stringify(taskModule.binding);
const runtime = portableRuntimeValidationContractForSchema('tiinex.task.v1');
assert.equal(runtime.state, 'qualified');
const runtimeParentOrigin = runtime.compiledContract.validation.conditionalRequirements.find((entry) => entry.name === 'Parent Origin');
assert.deepEqual(runtimeParentOrigin.requiredFields, []);
assert.deepEqual(runtimeParentOrigin.allowedLabels, ['relative', 'absolute', 'browse + git']);
assert.equal(runtime.compiledContract.portableRuntimeProjection.state, 'qualified-local');
assert.equal(runtime.compiledContract.portableRuntimeProjection.source.sha256, projection.source.sha256);
assert.equal(JSON.stringify(taskModule.binding), bindingBefore, 'portable local runtime projection must not rewrite the published schema-source binding');

console.log('qualifiedLocalRoot.runtime.test.mjs: ok');
