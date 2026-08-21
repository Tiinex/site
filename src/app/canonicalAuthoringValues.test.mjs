import assert from 'node:assert/strict';
import { canonicalAuthoringSubmissionValues } from './canonicalAuthoringValues.js';
const action={authoring:{requiredInputs:['Summary','Opaque Payload','Fixed'],fixedInputs:{Fixed:'  authority exact  '}}};
const opaque='  exact prefix\n  code:  value  \nexact suffix  ';
const values=canonicalAuthoringSubmissionValues(action,{Summary:'  Topic title  ', 'Opaque Payload':opaque,Fixed:'caller override'});
assert.equal(values.Summary,'  Topic title  ','generic authoring plumbing preserves caller text instead of imposing universal trimming');
assert.equal(values['Opaque Payload'],opaque,'opaque/multiline exact-style input is not silently normalized by generic authoring plumbing');
assert.equal(values.Fixed,'  authority exact  ','authority-owned fixed inputs remain exact and override caller values');
console.log('✓ canonical authoring values preserve caller semantics');
