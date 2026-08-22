import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';
import { canonicalC14nV2SelfState } from '../../../integrity/integrity.c14nV2.js';
import { validatePortableArtifactDraft } from '../engine.facade.js';

const ROOT = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md';
const TASK = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md';
const TOPIC = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md';
const METHOD = 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md';
const SITE_COMMIT = '32c7c291101b2a6a72c12241f3107d4a56af81fc';

const cases = [
  ['.topics/development/tooling/dogfood/001-site-tooling-v471-portable-lineage-authoring-closure.trace.md','tiinex.task.v1','Architect','2026-08-21 15:23:00','7123f0412fc58d4d9bb67795f4c35cba8eb18ccbb0c2a6b1966898f1cc754239','9c69c769a62a6990b3cd94ea0d39a79388a0770e',''],
  ['.topics/development/tooling/dogfood/001-1-site-tooling-v471-portable-lineage-authoring-closure-result.trace.md','tiinex.task.v1','Tooling','2026-08-21 15:37:00','c712e42877972b95c8a92d188288d445870e2b2f701d2652b0f0b6333d347099','154ff4b0c5020ca8c56cc97f7455b4f377afe671','.topics/development/tooling/dogfood/001-site-tooling-v471-portable-lineage-authoring-closure.trace.md'],
  ['.topics/development/tooling/dogfood/001-1-1-site-tooling-v472-portable-exact-authoring-fidelity-closure.trace.md','tiinex.task.v1','Architect','2026-08-21 15:58:00','cfde4e7f6580221c626237e54819fc109a5fdefc56680465d3014654559dd0bd','278084616a5b00fae1b0765cad80c605c6bf25bf','.topics/development/tooling/dogfood/001-1-site-tooling-v471-portable-lineage-authoring-closure-result.trace.md'],
  ['.topics/development/tooling/dogfood/001-1-1-1-site-tooling-v472-portable-exact-authoring-fidelity-closure-result.trace.md','tiinex.task.v1','Tooling','2026-08-21 16:25:00','71d9aaf5b29b1525d132d8abb3bdc2fa67df4d7fbfcb35a2dcefeedece47db4f','df35458394c2a94040d63a0c699148ada631affe','.topics/development/tooling/dogfood/001-1-1-site-tooling-v472-portable-exact-authoring-fidelity-closure.trace.md'],
  ['.topics/development/tooling/dogfood/001-1-1-1-1-site-tooling-v473-portable-parent-authority-coherence-metadata-fidelity-closure.trace.md','tiinex.task.v1','Architect','2026-08-21 16:34:00','f626760424e9390879d77bd5c0e08ff3c8517d574f4720391f885b7b5e7df227','6e7e54c75d4a4547befe45ed9ec3870d621e660e','.topics/development/tooling/dogfood/001-1-1-1-site-tooling-v472-portable-exact-authoring-fidelity-closure-result.trace.md'],
  ['.topics/development/tooling/dogfood/001-1-1-1-1-1-site-tooling-v473-portable-parent-authority-coherence-metadata-fidelity-closure-result.trace.md','tiinex.task.v1','Tooling','2026-08-21 16:48:00','5682e4095eff760e0349deff30a78d1f04efed0d345b3b34bd49aca2538ee0f0','33e32e6553fbe5cc09653b6d65b97167c454460f','.topics/development/tooling/dogfood/001-1-1-1-1-site-tooling-v473-portable-parent-authority-coherence-metadata-fidelity-closure.trace.md'],
  ['.topics/development/tooling/dogfood/001-1-1-1-1-1-1-site-tooling-v474-loaded-parent-identity-evidence-closure.trace.md','tiinex.task.v1','Architect','2026-08-21 17:15:00','3e09b9305c4d67a0463a7bc6f20eaf8400749642292b95556b838efcb55e9120','3fe5e9d11a1a144e912a9d814dda111302e91c82','.topics/development/tooling/dogfood/001-1-1-1-1-1-site-tooling-v473-portable-parent-authority-coherence-metadata-fidelity-closure-result.trace.md'],
  ['.topics/development/tooling/dogfood/001-1-1-1-1-1-1-1-site-tooling-v474-loaded-parent-identity-evidence-closure-result.trace.md','tiinex.task.v1','Tooling','2026-08-21 17:23:00','2439e3a53bb0b64766f5e564c74dd341f55691fb43baf2e6d80d99df54d5820f','f647d2e9ed13aed5d203ac4fdfa6f6e3c9727006','.topics/development/tooling/dogfood/001-1-1-1-1-1-1-site-tooling-v474-loaded-parent-identity-evidence-closure.trace.md'],
  ['.topics/development/collaboration/dogfood/001-tiinex-development-dogfood-collaboration-model.trace.md','tiinex.topic.v1','Tiinusen; Architect','2026-08-21 16:33:00','a18661909663ed5c330a957d5d848a7faeb042d3f4aeaf21b9fc2b8909081b88','8db25b99346cec48439a641f490c9954f3d89aa7','']
].map(([path,schemaId,authors,createdAt,bodySha256,preRepairBlob,parent])=>({path,schemaId,authors,createdAt,bodySha256,preRepairBlob,parent}));

const sha = (text) => createHash('sha256').update(text).digest('hex');
const published = (artifactPath) => `https://github.com/Tiinex/site/blob/${SITE_COMMIT}/${artifactPath}`;

for (const fixture of cases) {
  const markdown = await readFile(new URL(`../../../${fixture.path}`, import.meta.url), 'utf8').catch(async () => await readFile(fixture.path, 'utf8'));
  const parsed = parseArtifactMarkdown(markdown);
  assert.equal(sha(parsed.body.text), fixture.bodySha256, `${fixture.path}: historical body bytes/meaning drifted`);
  assert.equal(parsed.envelope.current.createdAt, fixture.createdAt, `${fixture.path}: Current Created At drifted`);
  assert.equal(parsed.envelope.current.authors, fixture.authors, `${fixture.path}: authorship must be truthful after repair`);
  assert.equal(parsed.envelope.envelopeSchema.id, 'tiinex.root.v1');
  assert.equal(parsed.envelope.envelopeSchema.target, ROOT);
  assert.equal(parsed.envelope.current.schema.id, fixture.schemaId);
  assert.equal(parsed.envelope.current.schema.target, fixture.schemaId === 'tiinex.topic.v1' ? TOPIC : TASK);
  assert.equal(parsed.envelope.repairsDeclared, true, `${fixture.path}: Repairs disclosure required`);
  assert(markdown.includes('- Repairs:\n  - Historical canonical representation repair\n'), `${fixture.path}: structured repair entry missing`);
  assert(markdown.includes(`    - Target: [pre-repair published representation](${published(fixture.path)})`), `${fixture.path}: pre-repair published representation must remain identifiable`);
  assert(markdown.includes(`pre-repair Git blob ${fixture.preRepairBlob}.`), `${fixture.path}: pre-repair blob evidence missing`);
  assert(markdown.includes('    - Note: '));
  assert(markdown.includes('    - Reason: '));
  assert.equal(markdown.includes('Trace: record:'), false, `${fixture.path}: legacy record Trace survived repair`);
  assert.equal(/\n\s+- Origin: \.topics\//.test(markdown), false, `${fixture.path}: scalar Origin survived repair`);
  assert.equal(/\n\s+- Boundary:/.test(markdown), false, `${fixture.path}: Parent Boundary survived repair`);
  assert.equal(/\]\(tiinex\.[^)]+\.schema\.md\)/.test(markdown), false, `${fixture.path}: broken basename schema target survived repair`);
  assert.equal(markdown.includes('Draft Local Integrity'), false, `${fixture.path}: Draft Local Integrity survived repair`);
  assert.equal(markdown.includes('pending-publication-or-export'), false, `${fixture.path}: pending pseudo-footer survived repair`);
  assert(markdown.includes(`- [sha256-base64url-c14n-v2](${METHOD})\n  - Towards: self\n  - Value:`), `${fixture.path}: maintained linked c14n-v2 method entry missing`);
  assert.equal(canonicalC14nV2SelfState(markdown).state, 'verified', `${fixture.path}: self integrity must verify`);
  if (fixture.parent) {
    const relative = path.relative(path.dirname(fixture.path), fixture.parent).replaceAll('\\','/') || path.basename(fixture.parent);
    assert.equal(parsed.envelope.parent.trace, relative, `${fixture.path}: Parent Trace must be exact relative reference`);
    assert.deepEqual(parsed.envelope.parent.originEntries.map(({label,target})=>[label,target]), [
      ['relative', relative],
      ['browse + git', published(fixture.parent)]
    ], `${fixture.path}: labeled Parent Origin must preserve relative + verified published evidence`);
    assert.equal(parsed.envelope.parent.schema.id, 'tiinex.task.v1');
    assert.equal(parsed.envelope.parent.schema.target, TASK);
  } else {
    assert.equal(parsed.envelope.parent.trace, '', `${fixture.path}: root artifact must remain root`);
    assert.equal(parsed.envelope.parent.originEntries.length, 0, `${fixture.path}: root artifact must not invent Parent Origin`);
  }
  const reopen = validatePortableArtifactDraft({schemaId:fixture.schemaId,path:fixture.path,markdown});
  assert.equal(reopen.validation.status, 'clean', `${fixture.path}: ordinary reopen must be clean`);
  assert.equal(reopen.validation.audit.validation.semanticContract.state, 'valid', `${fixture.path}: semantic contract must be valid`);
  assert.equal(reopen.validation.audit.validation.integrity.state, 'verified', `${fixture.path}: ordinary reopen integrity must verify`);
}

console.log('✓ v479 historical dogfood canonical repair closure: 9 artifacts preserve historical body/Created At/authorship while reopening semantic-valid with structured repair provenance and canonical continuity/integrity');
