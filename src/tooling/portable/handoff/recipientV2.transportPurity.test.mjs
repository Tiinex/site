import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { packageFileBytes } from '../../../export/package.bytes.js';
import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { auditHandoffPackageContextCarriage } from './contextAudit.js';
import { orientColdConsumerFromHandoffPackage } from './coldConsumerEntrypoint.js';
import { selectRecipientFacingV2Delivery } from './recipientV2.delivery.js';
import { RECIPIENT_V2_TRANSPORT_MANIFEST_PATH } from './recipientV2.transportManifest.js';

const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const HANDOFF_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md';
const WORKSPACE_SCHEMA_TARGET = 'site-local:.topics/.schemas/tiinex.workspace.v1.schema.md';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-recipient-v2-purity-'));
try {
  const runtimeRoot = path.join(root, 'runtime');
  await makeRuntime(runtimeRoot);
  const workspaceRoot = path.join(root, 'business');
  await makeWorkspace(workspaceRoot);
  const cachePath = path.join(workspaceRoot, '.topics', '.cache');
  assert.equal(await exists(cachePath), false, 'fixture starts without durable source Workspace cache');

  const input = await prepareNodeHandoffManufacturingInput({
    workspaceRoot,
    workspaceId: 'business',
    workspaceTitle: 'Business',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    toolingBootstrap: 'embedded',
    runtimeRoot,
    verifyRoundtrip: true,
    materialBindings: { ctx: { content: 'detached-exact-context-bytes', providerId: 'fixture-external', providerKind: 'supplied-material' } }
  });
  const result = manufactureRecipientRelativeHandoffPackage(input, { verifyRoundtrip: true, packageInput: { builtAt: '2026-08-27T00:30:00.000Z' } });
  assert.equal(result.status, 'ready');
  assert.equal(result.verification.roundtrip, 'passed');
  assert.equal(await exists(cachePath), false, 'Handoff closure manufacture must not create durable source Workspace .topics/.cache residue');

  const manifests = result.bundle.files.filter((file) => String(file.path || '') === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH);
  assert.equal(manifests.length, 1, 'recipient-v2 exposes exactly one transport-owned control manifest');
  const markdownFiles = result.bundle.files.filter((file) => /\.md$/i.test(String(file.path || '')));
  assert(markdownFiles.length >= 4);
  for (const file of markdownFiles) {
    const markdown = new TextDecoder().decode(packageFileBytes(file));
    assert.equal(markdown.includes('TIINEX-RECIPIENT-V2-FACTS'), false, `${file.path} must not expose repeated transport facts in semantic Markdown`);
  }
  assert(result.bundle.files.some((file) => /cache\.trace\.md$/i.test(String(file.path || ''))), 'detached exact context remains package-owned in a recipient cache artifact');
  assert(result.bundle.files.some((file) => /cache\.zip$/i.test(String(file.path || ''))), 'detached exact context remains package-owned in a recipient cache payload');

  const inspection = inspectRecipientFacingV2Topology(result.bundle);
  assert.equal(inspection.status, 'valid');
  assert.equal(inspection.transportManifest?.state, 'valid');
  assert.equal(auditHandoffPackageContextCarriage({ bundle: result.bundle }).status, 'ready');
  assert.equal(orientColdConsumerFromHandoffPackage({ bundle: result.bundle }).status, 'ready');

  const selected = selectRecipientFacingV2Delivery(result.bundle, result.carrierProjection.routes[0].id);
  assert.equal(selected.status, 'ready', 'selected delivery must rebuild and requalify its transport manifest after pruning sibling material');
  assert.equal(selected.bundle.files.filter((file) => String(file.path || '') === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH).length, 1);
  assert.equal(inspectRecipientFacingV2Topology(selected.bundle).status, 'valid');

  const tampered = structuredCloneBundle(result.bundle);
  const manifest = tampered.files.find((file) => String(file.path || '') === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH);
  const parsed = JSON.parse(new TextDecoder().decode(packageFileBytes(manifest)));
  parsed.entries[0].sha256 = '0'.repeat(64);
  manifest.content = `${JSON.stringify(parsed)}\n`;
  delete manifest.data;
  const tamperedInspection = inspectRecipientFacingV2Topology(tampered);
  assert.equal(tamperedInspection.status, 'invalid');
  assert(tamperedInspection.findings.some((item) => item.code === 'portable.handoff-v2-transport.manifest.byte-identity-mismatch'));

  console.log('✓ recipient-v2 transport purity: one digest-bound manifest, clean semantic Markdown, package-owned closure cache, clean source Workspace, and qualified roundtrip/orientation/delivery');
} finally {
  await rm(root, { recursive: true, force: true });
}

async function exists(target) { try { await access(target); return true; } catch { return false; } }
function structuredCloneBundle(bundle) {
  return { ...bundle, files: (bundle.files || []).map((file) => ({ ...file, ...(file.data instanceof Uint8Array ? { data: new Uint8Array(file.data) } : {}) })) };
}
async function makeWorkspace(rootPath) {
  await mkdir(path.join(rootPath, '.topics'), { recursive: true });
  await writeFile(path.join(rootPath, 'workspace.workspace.md'), workspaceMarkdown('Business'), 'utf8');
  const parentHandoff = qualifiedHandoffFixture({
    title: 'Business parent handoff', to: 'Loom', purpose: 'recipient-v2 local Parent fixture', createdAt: '2026-08-27 00:29:00'
  });
  const parentDigest = validatedC14nV2PrimarySelfDigest(parentHandoff);
  assert.equal(parentDigest.state, 'verified');
  await writeFile(path.join(rootPath, '.topics', '014-parent-handoff.trace.md'), parentHandoff, 'utf8');
  const handoff = qualifiedHandoffFixture({
    title: 'Business handoff', to: 'Anchor', purpose: 'recipient-v2 purity fixture', createdAt: '2026-08-27 00:30:00',
    parent: {
      schemaId: 'tiinex.handoff.v1', schemaTarget: HANDOFF_SCHEMA_TARGET, createdAt: '2026-08-27 00:29:00',
      trace: '014-parent-handoff.trace.md', relative: '014-parent-handoff.trace.md', includeBrowseGit: false,
      towards: '014-parent-handoff.trace.md', targetValue: parentDigest.value
    },
    requiredContext: '- ctx\n  - Material: detached exact context\n  - Material Reference: [Context](https://authority.example/exact)\n  - Purpose: grounding\n  - Availability: available'
  });
  await writeFile(path.join(rootPath, '.topics', '015-handoff.trace.md'), handoff, 'utf8');
}
function workspaceMarkdown(title) {
  const unsigned = `# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n- Current\n  - Current Schema: [tiinex.workspace.v1](${WORKSPACE_SCHEMA_TARGET})\n  - Created At: 2026-08-27 00:30:00\n  - Authors: Fixture\n  - Why: Exercise recipient-v2 purity and closure hygiene.\n  - Summary: ${title}\n  - Status: active/local\n\n---\n\n# ${title}\n\nWorkspace fixture body.\n\n---\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending\n`;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}
async function makeRuntime(rootPath) {
  await mkdir(path.join(rootPath, 'tools'), { recursive: true });
  await mkdir(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap'), { recursive: true });
  await mkdir(path.join(rootPath, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'tiinex.root.v1'), { recursive: true });
  await writeFile(path.join(rootPath, 'tools', 'tiinex-portable.mjs'), "import '../src/runtime.js';\n", 'utf8');
  await writeFile(path.join(rootPath, 'src', 'runtime.js'), "export const runtime = 'fixture';\n", 'utf8');
  await writeFile(path.join(rootPath, 'package.json'), '{"type":"module"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap', 'tiinex.llm.bootstrap.md'), '# Bootstrap\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'bootstrap', 'tiinex.llm.bootstrap.pointer.json'), '{"schema":"fixture"}\n', 'utf8');
  await writeFile(path.join(rootPath, 'src', 'tooling', 'portable', 'schema', 'bootstrap', 'tiinex.root.v1', 'schema.md'), '# Root\n', 'utf8');
}
