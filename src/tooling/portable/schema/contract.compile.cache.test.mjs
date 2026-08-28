import assert from 'node:assert/strict';
import { compilePortableSchemaContract, compilePortableSchemaContractChain } from './contract.compile.js';

const parent = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: example.cache.parent.v1
  - Created At: 2026-08-28 00:00:00

---

# Cache Parent

## Artifact Creation Contract

### Inputs

Required Fields

- Parent Input
`;

const child = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: example.cache.parent.v1
  - Trace: parent.trace.md
  - Origin: parent.trace.md
- Current
  - Current Schema: example.cache.child.v1
  - Created At: 2026-08-28 00:00:00

---

# Cache Child

## Artifact Creation Contract

### Inputs

Required Fields

- Child Input
`;

const first = compilePortableSchemaContractChain([parent, child]);
const repeated = compilePortableSchemaContractChain([parent, child]);
assert.deepEqual(repeated, first, 'identical schema Markdown preserves compiled chain semantics across cache reuse');
assert.deepEqual(first.creation.requiredInputs, ['Parent Input', 'Child Input']);

const changedChild = child.replace('- Child Input', '- Changed Child Input');
const changed = compilePortableSchemaContractChain([parent, changedChild]);
assert.deepEqual(changed.creation.requiredInputs, ['Parent Input', 'Changed Child Input'], 'changed schema Markdown must compile changed authority rather than reuse stale cached content');
assert.notDeepEqual(changed.creation.requiredInputs, first.creation.requiredInputs);

const directFirst = compilePortableSchemaContract(child);
const directSecond = compilePortableSchemaContract(child);
assert.notEqual(directSecond, directFirst, 'direct compile API retains uncached object-identity behavior');
assert.deepEqual(directSecond, directFirst, 'direct compile API retains equivalent semantics');

console.log('portable schema chain exact-Markdown cache regression: PASS');
