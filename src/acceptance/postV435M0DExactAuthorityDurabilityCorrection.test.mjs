import assert from 'node:assert/strict';
import fs from 'node:fs';
import { sealC14nV2Self } from '../integrity/integrity.c14nV2.js';
import { qualifyExactAuthorityRepresentation, verifyExactAuthorityRepresentation } from '../transitions/transition.authorityRepresentation.js';

// Re-run the full functional Reference family first; it now includes exact authority fields in
// persistence/re-ingest assertions rather than proving durability from path strings alone.
await import('./postV434M0DDurableReferenceIntegrationClosure.test.mjs');

const cases = [
  {
    label: 'Transition',
    path: 'src/schemas/core/relation/.transitions/topic-references-task-transition-definition.trace.md'
  },
  {
    label: 'Generation',
    path: 'src/schemas/core/relation/.generation/reference-relation-generation-authority.trace.md'
  }
];

for (const item of cases) {
  const reference = `site-local:${item.path}`;
  const originalMarkdown = fs.readFileSync(item.path, 'utf8');
  const exact = qualifyExactAuthorityRepresentation({ reference, path: item.path, markdown: originalMarkdown });
  assert.equal(exact.state, 'qualified', `${item.label}: bundled authority has exact c14n-v2 representation identity`);
  assert.equal(exact.method, 'sha256-base64url-c14n-v2');
  assert(exact.value);
  assert.equal(verifyExactAuthorityRepresentation(exact, { reference, path: item.path, markdown: originalMarkdown }).state, 'qualified');

  // Same site-local path plus changed bytes with stale identity is not exact authority.
  const changedStale = originalMarkdown.replace('\n---\n', `\n<!-- v435 same-path changed bytes -->\n\n---\n`);
  assert.notEqual(changedStale, originalMarkdown);
  const staleQualification = qualifyExactAuthorityRepresentation({ reference, path: item.path, markdown: changedStale });
  assert.notEqual(staleQualification.state, 'qualified', `${item.label}: changed bytes with stale footer fail exact qualification`);
  assert.equal(verifyExactAuthorityRepresentation(exact, { reference, path: item.path, markdown: changedStale }).state, 'mismatch');

  // Even if future changed bytes are legitimately re-sealed at the same path, they become a
  // different exact representation value and cannot verify as the original authority.
  const resealed = sealC14nV2Self(changedStale);
  assert.equal(resealed.state, 'sealed');
  const future = qualifyExactAuthorityRepresentation({ reference, path: item.path, markdown: resealed.markdown });
  assert.equal(future.state, 'qualified');
  assert.notEqual(future.value, exact.value, `${item.label}: changed same-path representation receives a different exact value`);
  const oldAgainstFuture = verifyExactAuthorityRepresentation(exact, { reference, path: item.path, markdown: resealed.markdown });
  assert.equal(oldAgainstFuture.state, 'mismatch', `${item.label}: original identity cannot be mistaken for future same-path bytes`);
}

console.log('post-v435 M0-D exact authority durability correction: PASS');
