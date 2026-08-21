import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildArtifactCreationContract } from '../schemas/creation.contracts.js';
import { qualifyBundledSchemaSource, qualifiedCreationAuthorityFromSchemaSource } from '../schemas/schema.source.js';
import { schemaRegistry } from '../schemas/registry.js';
import { schemaMarkdownCatalog, schemaCatalogEntryForId } from '../schemas/schemaMarkdownCatalog.js';
import { relationSchemaModule } from '../schemas/core/relation/tiinex.relation.v1.schema.js';

const creationSource = fs.readFileSync('src/schemas/creation.capability.js', 'utf8');
const companionSource = fs.readFileSync('src/schemas/companion.js', 'utf8');
const navigationSource = fs.readFileSync('src/app/schemaNavigationRuntimeCatalog.js', 'utf8');
const markdownCatalogSource = fs.readFileSync('src/schemas/schemaMarkdownCatalog.js', 'utf8');

assert.equal(buildArtifactCreationContract({ schemaId: relationSchemaModule.id, module: relationSchemaModule }).status, 'blocked', 'Relation local materialization must not create ordinary Relation Create authority');
for (const module of schemaRegistry.modules) {
  const source = qualifyBundledSchemaSource(module.schemaSource);
  assert.equal(source.state, 'qualified', `${module.id} bundled source projection must match its exact binding`);
  assert.equal(source.schemaId, module.id);
  assert.equal(source.checksum, module.binding.checksum.value);
  const expectedAuthority = (source.compiledContract?.creation?.groups || []).length > 0;
  assert.equal(qualifiedCreationAuthorityFromSchemaSource(module).state === 'qualified', expectedAuthority, `${module.id} creation authority must project exact generated source contract`);
}
const readableModules = schemaRegistry.modules.filter((module) => module.schemaSource?.readable === true);
assert.equal(Object.keys(schemaMarkdownCatalog).length, readableModules.length, 'catalog is a derived projection of readable installed modules');
for (const module of readableModules) assert(schemaCatalogEntryForId(module.id), `${module.id} readable installed source must be discoverable`);
assert(schemaCatalogEntryForId('tiinex.relation.v1'), 'Relation must not be omitted from bundled schema reading source');
assert(markdownCatalogSource.includes('schemaRegistry.modules'));
assert.equal(/tiinex\.relation\.v1/.test(markdownCatalogSource), false);
assert.equal(/tiinex\.relation\.v1/.test(navigationSource), false);
assert.equal(/schema\s*===\s*['"]tiinex\.(topic|evidence)\.v1/.test(companionSource), false);
assert(companionSource.includes('redundantIdentitySections'));
assert.equal(/tiinex\.(topic|task|evidence|relation|interpretation|preservation)\.v1/.test(creationSource), false);
console.log('post-v453 creation authority + schema source ownership correction: PASS');
