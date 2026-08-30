import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { packageFileBytes, sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';
import { exportFileMapZipUint8Array } from '../../../export/package.zip.js';
import { sealC14nV2Self, validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { auditHandoffPackageContextCarriage } from './contextAudit.js';
import { orientColdConsumerFromHandoffPackage } from './coldConsumerEntrypoint.js';
import { groundPortableColdConsumer } from './coldStartQualification.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { selectRecipientFacingV2Delivery } from './recipientV2.delivery.js';
import { buildHandoffWorkspaceByteProvider, inspectStoredWorkspaceArchive, resolveHandoffWorkspaceEntry } from './workspaceByteProvider.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { projectHandoffHumanOutput } from './carrierProjection.js';
import { materializeHandoffManufactureCliOutput } from '../adapters/cli/cli.handoff-manufacture.js';
import { projectPortableHandoffCarrierOutputFromPackage, recipientV2StandardInvocation } from './recipientV2.humanOutput.js';
import { buildRecipientV2TransportManifestFile, RECIPIENT_V2_TRANSPORT_MANIFEST_PATH } from './recipientV2.transportManifest.js';

const ROOT_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md';
const HANDOFF_SCHEMA_TARGET = 'https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md';
const WORKSPACE_SCHEMA_TARGET = 'site-local:.topics/.schemas/tiinex.workspace.v1.schema.md';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-archive-carrier-v2-'));
try {
  const runtimeRoot = path.join(root, 'runtime');
  await makeRuntime(runtimeRoot);
  const siteRoot = path.join(root, 'site');
  await makeWorkspace(siteRoot, { title: 'Site', to: 'Anchor', blob: [0, 1, 2, 255, 128] });

  const input = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: siteRoot,
    workspaceId: 'site',
    workspaceTitle: 'Site',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    toolingBootstrap: 'embedded',
    runtimeRoot,
    verifyRoundtrip: true
  });

  const v2 = manufactureRecipientRelativeHandoffPackage(input, { legacyRecipientV2Compatibility: true, verifyRoundtrip: true, packageInput: { builtAt: '2026-08-24T20:00:00.000Z' } });
  assert.equal(v2.status, 'ready');

  const bindingOnlyRoot = path.join(root, 'binding-only');
  await makeWorkspace(bindingOnlyRoot, {
    title: 'Binding only',
    to: 'Sigma',
    blob: [3, 4, 5],
    requiredContext: `- ctx
  - Material: exact bound local context without source Material Reference
  - Purpose: prove transport manufacture may bind exact required bytes without mutating the source Handoff to invent a locator
  - Availability: available`
  });
  const bindingOnlyInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: bindingOnlyRoot,
    workspaceId: 'binding-only',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    materialBindings: { ctx: { workspaceId: 'binding-only', path: '.topics/context.md' } },
    toolingBootstrap: 'embedded',
    runtimeRoot,
    verifyRoundtrip: true
  });
  const bindingOnlyV2 = manufactureRecipientRelativeHandoffPackage(bindingOnlyInput, { legacyRecipientV2Compatibility: true, verifyRoundtrip: true, packageInput: { builtAt: '2026-08-24T20:00:00.000Z' } });
  assert.equal(bindingOnlyV2.status, 'ready', 'explicit exact material binding must survive recipient-v2 transport when source Handoff intentionally omits optional Material Reference');
  assert.equal(bindingOnlyV2.inspection.status, 'valid');
  assert.equal(bindingOnlyV2.carrierProjection.routes[0].requiredClosure.state, 'qualified');
  assert.equal(bindingOnlyV2.carrierProjection.routes[0].requiredClosure.requirements[0].resolution.kind, 'workspace-archive-entry');
  assert.equal(v2.verification.roundtrip, 'passed');
  assert.equal(v2.descriptor.schema, 'tiinex.transport.handoff-material-closure-descriptor.v2');
  assert.equal(v2.migration.manufacturePath, 'direct-qualified-workspace-to-archive');
  assert.equal(v2.migration.removedExplodedWorkspaceFiles, 0, 'direct v2 must not emit then remove exploded workspace files');
  assert.equal(v2.migration.avoidedExplodedWorkspaceFiles, 4, 'direct v2 must account for the qualified workspace entries it archived without outer carriage');
  assert.equal(v2.migration.deduplicatedDetachedMaterialFiles, 1, 'workspace-backed Required Context should dedup only after exact archive-entry proof');
  assert(v2.bundle.files.every((file) => !String(file.path || '').includes('/')), 'recipient-facing v2 must expose a flat root');
  assert(v2.bundle.files.some((file) => file.path === '001-1-READ-BEFORE-PROCEEDING.trace.md'));
  assert(v2.bundle.files.some((file) => file.path === '001-site-handoff-package.trace.md'));
  assert(v2.bundle.files.some((file) => file.path === '001-2-bootstrap.trace.md'));
  assert(v2.bundle.files.some((file) => file.path === '001-2-bootstrap.zip'));
  assert(v2.bundle.files.some((file) => file.path === '001-3-site.workspace.md'));
  assert(v2.bundle.files.some((file) => file.path === '001-3-site.workspace.zip'));
  assert(v2.bundle.files.some((file) => file.path === '001-3-1-handoff-pointer.trace.md'));
  assert(v2.bundle.files.some((file) => /workspace-representation-payload\.trace\.md$/i.test(String(file.path || ''))), 'recipient-v2 exposes one explicit External Payload artifact for each Workspace archive representation');
  assert(v2.bundle.files.some((file) => /workspace-representation\.trace\.md$/i.test(String(file.path || ''))), 'recipient-v2 exposes one canonical Workspace Representation binding rather than hiding provider authority in transport metadata');
  assert(v2.bundle.files.some((file) => /\.workspace\.md$/i.test(file.path)));
  assert(v2.bundle.files.some((file) => /\.workspace\.zip$/i.test(file.path)));
  assert.equal(v2.bundle.files.some((file) => /^(?:context|handoff\.workspaces|tiinex\.bootstrap|tiinex\.package)\//.test(String(file.path || ''))), false);
  assert.equal(v2.bundle.files.some((file) => /^handoff-entrypoint-/i.test(String(file.path || ''))), false);
  assert.equal(v2.bundle.files.some((file) => file.path.startsWith('handoff.material/')), false);
  const generatedSurfaceMarkdown = v2.bundle.files
    .filter((file) => /\.md$/i.test(String(file.path || '')))
    .map((file) => ({ path: file.path, markdown: new TextDecoder('utf-8').decode(packageFileBytes(file)) }));
  assert(generatedSurfaceMarkdown.length >= 4, 'recipient-facing v2 should expose its generated Tiinex control surface as Markdown artifacts');
  for (const item of generatedSurfaceMarkdown) {
    assert.equal(item.markdown.startsWith(`# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n`), true, `generated recipient artifact ${item.path} must use the exact maintained Root schema locator when it is available`);
    assert.match(item.markdown, /\n---\n\n# Continuity Integrity\n\n/, `generated recipient artifact ${item.path} must preserve the canonical body/footer divider before Continuity Integrity`);
    assert.match(item.markdown, /\n  - Value: [A-Za-z0-9_-]{43}\n?$/, `generated recipient artifact ${item.path} must use canonical readable c14n-v2 Value spacing`);
    assert.doesNotMatch(item.markdown, /\n  - Value:[^ \n]/, `generated recipient artifact ${item.path} must not collapse Value spacing`);
  }
  const workspaceSurface = generatedSurfaceMarkdown.find((item) => /001-3-site\.workspace\.md$/i.test(String(item.path || '')));
  assert(workspaceSurface, 'recipient-facing v2 must expose one readable package-local Workspace lineage node');
  assert.equal(workspaceSurface.markdown.includes('transportCorrelationKey'), false, 'recipient-facing semantic artifact must not expose manufacture-internal transport correlation control metadata');
  assert(workspaceSurface.markdown.length < 20_000, 'package-local Workspace node must stay human-readable rather than embedding large manufacture-internal control metadata');
  const recipientInspection = inspectRecipientFacingV2Topology(v2.bundle);
  assert.equal(recipientInspection.status, 'valid');
  assert.equal(recipientInspection.rootArtifact.path, '001-site-handoff-package.trace.md');
  assert.equal(recipientInspection.workspaces[0].workspaceArtifactPath, '001-3-site.workspace.md');
  assert.equal(recipientInspection.workspaceByteProvider.status, 'ready');
  assert.match(recipientInspection.workspaceByteProvider.workspaces[0].authority.bindingAuthority, /^schema-valid-tiinex\.workspace\.representation\.v1-visible-binding/);
  const representationPath = recipientInspection.workspaces[0].workspaceRepresentationArtifactPath;
  const workspacePayloadPath = recipientInspection.workspaces[0].workspacePayloadArtifactPath;
  const staleBindingInspection = inspectRecipientFacingV2Topology(mutateRecipientV2Markdown(v2.bundle, representationPath, (markdown) => markdown.replace('- Binding State: verified', '- Binding State: stale')));
  assert.equal(staleBindingInspection.workspaceByteProvider.status, 'blocked', 'schema-valid stale Workspace Representation must not activate a provider');
  assert(staleBindingInspection.findings.some((item) => item.code === 'portable.handoff-v2-surface.workspace-provider.workspace-representation-not-verified-complete'));
  const wrongIntegrityTargetInspection = inspectRecipientFacingV2Topology(mutateRecipientV2Markdown(v2.bundle, workspacePayloadPath, (markdown) => markdown.replace('- Integrity Target: exact payload bytes as carried at the declared local Location', '- Integrity Target: digest string only')));
  assert.equal(wrongIntegrityTargetInspection.workspaceByteProvider.status, 'blocked', 'payload digest strings with the wrong integrity target must fail closed');
  const competingBindingInspection = inspectRecipientFacingV2Topology(addCompetingWorkspaceRepresentation(v2.bundle, representationPath));
  assert.equal(competingBindingInspection.status, 'invalid', 'competing canonical Workspace Representation bindings must fail closed');
  assert(competingBindingInspection.findings.some((item) => item.code === 'portable.handoff-v2-surface.workspace-representation.ambiguous'));
  const lineageMarkdown = Object.fromEntries(generatedSurfaceMarkdown.map((item) => [item.path, item.markdown]));
  assert.match(lineageMarkdown['001-1-READ-BEFORE-PROCEEDING.trace.md'], /- Trace: \[001-site-handoff-package\.trace\.md\]\(001-site-handoff-package\.trace\.md\)/);
  assert.match(lineageMarkdown['001-2-bootstrap.trace.md'], /- Trace: \[001-site-handoff-package\.trace\.md\]\(001-site-handoff-package\.trace\.md\)/);
  assert.match(lineageMarkdown['001-3-site.workspace.md'], /- Trace: \[001-site-handoff-package\.trace\.md\]\(001-site-handoff-package\.trace\.md\)/);
  assert.match(lineageMarkdown['001-3-1-handoff-pointer.trace.md'], /- Trace: \[001-3-site\.workspace\.md\]\(001-3-site\.workspace\.md\)/);
  for (const [pathName, markdown] of Object.entries(lineageMarkdown)) {
    const entries = [...markdown.matchAll(/^- \[sha256-base64url-c14n-v2\]/gm)].length;
    assert.equal(entries, pathName === '001-site-handoff-package.trace.md' ? 1 : 2, `generated package-local lineage artifact ${pathName} must carry self plus Parent-target c14n-v2 when Parent exists`);
  }
  const provider = buildHandoffWorkspaceByteProvider(providerBundle(v2), v2.descriptor);
  assert.equal(provider.status, 'ready');
  assert.equal(provider.workspaces[0].mode, 'archive');
  const route = resolveHandoffWorkspaceEntry(provider, 'site', '.topics/015-handoff.trace.md');
  assert.equal(route.state, 'qualified');
  assert.equal(route.providerMode, 'archive');
  assert.equal(v2.carrierProjection.status, 'ready');
  assert.match(v2.carrierProjection.routes[0].packagePath, /\.workspace\.zip$/);
  assert.match(v2.carrierProjection.routes[0].pointerTarget, /#tiinex-workspace-entry=/);
  const audit = auditHandoffPackageContextCarriage({ bundle: v2.bundle });
  assert.equal(audit.status, 'ready');
  assert.equal(audit.coverage.state, 'qualified');
  assert.equal(audit.workspaceMaterializations[0].carrierMode, 'archive');
  const orientation = orientColdConsumerFromHandoffPackage({ bundle: v2.bundle });
  assert.equal(orientation.status, 'ready');
  assert.equal(orientation.entrypoint.path, '001-1-READ-BEFORE-PROCEEDING.trace.md');
  const rejectedLegacySurface = inspectRecipientFacingV2Topology({ files: [
    { path: 'context/workspace.json', content: '{}' },
    { path: 'handoff.workspaces/site/workspace.artifact.md', content: '# legacy' },
    { path: 'handoff.workspaces/site/workspace.snapshot.zip', data: new Uint8Array([1]) },
    { path: 'tiinex.bootstrap/manifest.json', content: '{}' },
    { path: 'tiinex.package/file-map.json', content: '{}' },
    { path: 'handoff-entrypoint-site.trace.md', content: '# legacy' }
  ] });
  assert.equal(rejectedLegacySurface.status, 'invalid');
  assert(rejectedLegacySurface.findings.some((item) => item.code === 'portable.handoff-v2-surface.legacy-envelope-exposed'));

  const v2Again = manufactureRecipientRelativeHandoffPackage(input, { legacyRecipientV2Compatibility: true, verifyRoundtrip: false, packageInput: { builtAt: '2026-08-24T20:00:00.000Z' } });
  assert.equal(v2Again.status, 'ready');
  assert.equal(archiveBinding(v2Again).representation.digest.value, archiveBinding(v2).representation.digest.value, 'workspace archive bytes must be deterministic for the same exact workspace entry set');

  const scaleRoot = path.join(root, 'scale-site');
  await makeWorkspace(scaleRoot, { title: 'Scale Site', to: 'Anchor', blob: [31, 32], scaleFiles: 1300 });
  const scaleInput = await prepareNodeHandoffManufacturingInput({ workspaceRoot: scaleRoot, workspaceId: 'scale-site', workspaceTargetPath: 'workspace.workspace.md', handoffPath: '.topics/015-handoff.trace.md', toolingBootstrap: 'embedded', runtimeRoot, verifyRoundtrip: false, maxFiles: 2000 });
  const scaleV2 = manufactureRecipientRelativeHandoffPackage(scaleInput, { legacyRecipientV2Compatibility: true, verifyRoundtrip: false, packageInput: { builtAt: '2026-08-24T20:00:00.000Z' } });
  assert.equal(scaleV2.status, 'ready');
  assert(scaleV2.descriptor.workspaceArchiveBindings[0].entryMap.count >= 1300, 'direct v2 scale pressure must cover at least 1,300 workspace files');
  assert.equal(scaleV2.bundle.files.filter((file) => /\.workspace\.zip$/i.test(String(file.path || ''))).length, 1, 'scale direct v2 must expose one archive payload rather than exploded workspace carriers');
  assert(scaleV2.migration.avoidedExplodedWorkspaceFiles >= 1300, 'scale direct v2 must account for avoided exploded workspace carriage');
  assert(scaleV2.descriptor.workspaceArchiveBindings[0].completeness.totalBytes > 2_000_000, 'scale pressure must include mixed non-trivial workspace payload volume');
  assert.equal(inspectRecipientFacingV2Topology(scaleV2.bundle).workspaceByteProvider.status, 'ready', 'mixed scale archive must re-qualify through the canonical Workspace Representation provider');

  const binding = archiveBinding(v2);
  assertProviderBlocked(v2, mutateDescriptor(v2.descriptor, (d) => { d.workspaceArchiveBindings[0].representation.digest.value = '0'.repeat(64); }), 'workspace-archive-digest-mismatch');
  assertProviderBlocked(v2, mutateDescriptor(v2.descriptor, (d) => { d.workspaceArchiveBindings[0].entryMap.entries[0].sha256 = '0'.repeat(64); }), 'workspace-archive-entry-map-mismatch');
  assertProviderBlocked(v2, mutateDescriptor(v2.descriptor, (d) => { d.workspaceArchiveBindings[0].entryMap.entries[0].path = '../escape.md'; }), 'workspace-inner-path-traversal');
  assertProviderBlocked(v2, mutateDescriptor(v2.descriptor, (d) => { d.workspaceArchiveBindings[0].entryMap.entries[1].path = d.workspaceArchiveBindings[0].entryMap.entries[0].path; }), 'workspace-inner-path-duplicate');
  assertProviderBlocked(v2, mutateDescriptor(v2.descriptor, (d) => { d.workspaceArchiveBindings[0].provider.state = 'unavailable'; }), 'workspace-archive-provider-unavailable');
  assertProviderBlocked(v2, mutateDescriptor(v2.descriptor, (d) => { d.workspaceArchiveBindings[0].representation.codec = 'deflate-raw'; }), 'workspace-archive-decoder-unavailable');
  assertProviderBlocked(v2, mutateDescriptor(v2.descriptor, (d) => { d.workspaceArchiveBindings[0].completeness.state = 'stale'; }), 'workspace-archive-completeness-unqualified');
  assertProviderBlocked(v2, mutateDescriptor(v2.descriptor, (d) => { d.workspaceArchiveBindings[0].transportCorrelationKey = 'stale-correlation'; }), 'workspace-archive-binding-stale');
  assertProviderBlocked(v2, mutateDescriptor(v2.descriptor, (d) => { d.workspaceArchiveBindings[0].workspaceTarget.packagePath = 'missing/workspace.md'; }), 'workspace-target-unresolvable');
  assertProviderBlocked(v2, mutateDescriptor(v2.descriptor, (d) => { d.workspaceArchiveBindings.push(structuredClone(d.workspaceArchiveBindings[0])); }), 'workspace-archive-binding-ambiguous');

  const matchingPreparedProvider = providerWithMatchingUnverifiedTarget(v2, provider);
  assert.equal(matchingPreparedProvider.status, 'blocked', 'matching stored/recomputed prepared self state must never qualify a Workspace target');
  assert(matchingPreparedProvider.workspaces[0].reasons.includes('workspace-target-self-integrity-unverified'));
  assert(matchingPreparedProvider.workspaces[0].reasons.includes('workspace-target-self-integrity-descriptor-unverified'));

  const archivePath = binding.representation.packagePath;
  const tamperedArchiveBundle = mutateBundleFile(v2.bundle, archivePath, (bytes) => { const out = bytes.slice(); out[Math.min(40, out.length - 1)] ^= 1; return out; });
  const tamperedProvider = buildHandoffWorkspaceByteProvider(providerBundle(v2, v2.descriptor, tamperedArchiveBundle), v2.descriptor);
  assert.equal(tamperedProvider.status, 'blocked');
  assert(tamperedProvider.workspaces[0].reasons.includes('workspace-archive-digest-mismatch'));
  assert.equal(inspectRecipientFacingV2Topology(tamperedArchiveBundle).status, 'invalid', 'visible Workspace-node/archive identity must independently reject archive byte tamper without an outer file map');
  const workspaceNodePath = v2.bundle.files.find((file) => /001-3-site\.workspace\.md$/i.test(String(file.path || '')))?.path;
  const tamperedWorkspaceNodeBundle = mutateBundleFile(v2.bundle, workspaceNodePath, (bytes) => { const out = bytes.slice(); out[Math.max(0, out.length - 8)] ^= 1; return out; });
  assert.equal(inspectRecipientFacingV2Topology(tamperedWorkspaceNodeBundle).status, 'invalid', 'package-local Workspace node self-integrity tamper must fail closed');
  const routePointerPath = v2.bundle.files.find((file) => /handoff-pointer\.trace\.md$/i.test(String(file.path || '')))?.path;
  const tamperedPointerBundle = mutateBundleFile(v2.bundle, routePointerPath, (bytes) => { const out = bytes.slice(); out[Math.max(0, out.length - 8)] ^= 1; return out; });
  assert.equal(inspectRecipientFacingV2Topology(tamperedPointerBundle).status, 'invalid', 'route Pointer self-integrity tamper must fail closed');

  const missingTargetRoot = path.join(root, 'missing-target');
  await makeWorkspace(missingTargetRoot, { title: 'Missing target', to: 'Anchor', includeWorkspaceArtifact: false, blob: [3, 4] });
  const missingTargetInput = await prepareNodeHandoffManufacturingInput({ workspaceRoot: missingTargetRoot, workspaceId: 'missing-target', handoffPath: '.topics/015-handoff.trace.md', toolingBootstrap: 'embedded', runtimeRoot, verifyRoundtrip: false });
  const missingTarget = manufactureRecipientRelativeHandoffPackage(missingTargetInput, { legacyRecipientV2Compatibility: true, verifyRoundtrip: false });
  assert.equal(missingTarget.status, 'blocked');
  assert(missingTarget.findings.some((item) => item.code === 'portable.handoff-v2.workspace-target.missing'));
  assert.equal(missingTarget.migration.state, 'blocked-before-representation-switch');

  const duplicateTargetRoot = path.join(root, 'duplicate-target');
  await makeWorkspace(duplicateTargetRoot, { title: 'Duplicate target', to: 'Anchor', workspaceArtifactCount: 2, blob: [5, 6] });
  const duplicateTargetInput = await prepareNodeHandoffManufacturingInput({ workspaceRoot: duplicateTargetRoot, workspaceId: 'duplicate-target', workspaceTargetPath: 'workspace.workspace.md', workspaceTargets: [{ workspaceId: 'duplicate-target', path: 'workspace-2.workspace.md' }], handoffPath: '.topics/015-handoff.trace.md', toolingBootstrap: 'embedded', runtimeRoot, verifyRoundtrip: false });
  const duplicateTarget = manufactureRecipientRelativeHandoffPackage(duplicateTargetInput, { legacyRecipientV2Compatibility: true, verifyRoundtrip: false });
  assert.equal(duplicateTarget.status, 'blocked');
  assert(duplicateTarget.findings.some((item) => item.code === 'portable.handoff-v2.workspace-target.ambiguous'));

  const unverifiedTarget = await manufactureWorkspaceTargetCase(root, runtimeRoot, 'unverified-target', workspaceMarkdown('Unverified target', { selfMode: 'prepared' }));
  assert.equal(unverifiedTarget.status, 'blocked');
  assert(unverifiedTarget.findings.some((item) => item.code === 'portable.handoff-v2.workspace-target-self-integrity-unverified'));

  const mismatchedTarget = await manufactureWorkspaceTargetCase(root, runtimeRoot, 'mismatched-target', workspaceMarkdown('Mismatched target', { selfMode: 'mismatch' }));
  assert.equal(mismatchedTarget.status, 'blocked');
  assert(mismatchedTarget.findings.some((item) => item.code === 'portable.handoff-v2.workspace-target-self-integrity-mismatch'));

  const rootInvalidTarget = await manufactureWorkspaceTargetCase(root, runtimeRoot, 'root-invalid-target', workspaceMarkdown('Root invalid target', { omitEnvelopeSchema: true }));
  assert.equal(rootInvalidTarget.status, 'blocked');
  assert(rootInvalidTarget.findings.some((item) => item.code === 'portable.handoff-v2.workspace-target-artifact-conformance-unqualified'));

  const parentMarkdown = qualifiedHandoffFixture({ title: 'Workspace target Parent fixture', to: 'Loom', createdAt: '2026-08-24 19:00:00' });
  const parentDigest = validatedC14nV2PrimarySelfDigest(parentMarkdown);
  assert.equal(parentDigest.state, 'verified');
  const parentInvalidTarget = await manufactureWorkspaceTargetCase(root, runtimeRoot, 'parent-invalid-target', workspaceMarkdown('Parent invalid target', { parent: { targetValue: 'A'.repeat(43) } }), { 'parent.trace.md': parentMarkdown });
  assert.equal(parentInvalidTarget.status, 'blocked');
  assert(parentInvalidTarget.findings.some((item) => item.code === 'portable.handoff-v2.workspace-target-parent-continuity-unqualified'));

  const externalRoot = path.join(root, 'external');
  await makeWorkspace(externalRoot, { title: 'External', to: 'Anchor', requiredTarget: 'https://authority.example/exact', blob: [7, 8] });
  const externalInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: externalRoot,
    workspaceId: 'external',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    toolingBootstrap: 'embedded',
    runtimeRoot,
    verifyRoundtrip: false,
    materialBindings: { ctx: { content: 'external-exact-bytes', providerId: 'fixture-external', providerKind: 'supplied-material' } }
  });
  const externalV2 = manufactureRecipientRelativeHandoffPackage(externalInput, { legacyRecipientV2Compatibility: true, verifyRoundtrip: false });
  assert.equal(externalV2.status, 'ready');
  assert.equal(externalV2.migration.deduplicatedDetachedMaterialFiles, 0);
  assert(externalV2.bundle.files.some((file) => /cache\.trace\.md$/i.test(String(file.path || ''))) && externalV2.bundle.files.some((file) => /cache\.zip$/i.test(String(file.path || ''))), 'non-workspace-qualified material must remain explicit through the qualified recipient cache artifact + payload');

  const docsRoot = path.join(root, 'docs');
  await makeWorkspace(docsRoot, { title: 'Docs', to: 'Loom', blob: [9, 10, 11] });
  const multiInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: siteRoot,
    workspaceId: 'site',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    additionalWorkspaces: [{ id: 'docs', root: docsRoot, title: 'Docs', workspaceTargetPath: 'workspace.workspace.md' }],
    handoffRoutes: [{ workspaceId: 'site', path: '.topics/015-handoff.trace.md' }, { workspaceId: 'docs', path: '.topics/015-handoff.trace.md' }],
    toolingBootstrap: 'embedded',
    runtimeRoot,
    verifyRoundtrip: false
  });
  const multi = manufactureRecipientRelativeHandoffPackage(multiInput, { legacyRecipientV2Compatibility: true, verifyRoundtrip: false });
  assert.equal(multi.status, 'ready');
  const multiInspection = inspectRecipientFacingV2Topology(multi.bundle);
  assert.equal(multiInspection.workspaceByteProvider.status, 'ready');
  const multiProvider = multiInspection.workspaceByteProvider;
  const siteRoute = resolveHandoffWorkspaceEntry(multiProvider, 'site', '.topics/015-handoff.trace.md');
  const docsRoute = resolveHandoffWorkspaceEntry(multiProvider, 'docs', '.topics/015-handoff.trace.md');
  assert.equal(siteRoute.state, 'qualified');
  assert.equal(docsRoute.state, 'qualified');
  assert.notEqual(siteRoute.sha256, docsRoute.sha256, 'same inner relative path across workspaces must remain workspace-qualified and isolated');
  assert.equal(multi.carrierProjection.routes.length, 2);
  assert.equal(multi.pointerEntrypointProjection.entries.length, 2);
  const sharedZipBytes = exportFileMapZipUint8Array((multi.bundle.files || []).map((file) => ({ path: String(file.path || ''), data: packageFileBytes(file) })), 'fixture.shared-v2.path.invalid');
  const sharedZipSha256 = sha256Hex(sharedZipBytes);
  const siteQualifiedRoute = multi.carrierProjection.routes.find((item) => item.workspaceId === 'site');
  const docsQualifiedRoute = multi.carrierProjection.routes.find((item) => item.workspaceId === 'docs');
  const siteInvocation = recipientV2StandardInvocation(projectHandoffHumanOutput({ projection: multi.carrierProjection, route: siteQualifiedRoute.id }), multi.inspection);
  const docsInvocation = recipientV2StandardInvocation(projectHandoffHumanOutput({ projection: multi.carrierProjection, route: docsQualifiedRoute.id }), multi.inspection);
  const sitePointerPath = multi.inspection.routes.find((item) => item.workspaceId === 'site')?.pointerPath || '';
  const docsPointerPath = multi.inspection.routes.find((item) => item.workspaceId === 'docs')?.pointerPath || '';
  assert(sitePointerPath && docsPointerPath && sitePointerPath !== docsPointerPath);
  assert(siteInvocation.includes(`Start:\n001-1-READ-BEFORE-PROCEEDING.trace.md\nContinue from (do not read native; pass to Tiinex after bootstrap):\n${sitePointerPath}\n`));
  assert(docsInvocation.includes(`Start:\n001-1-READ-BEFORE-PROCEEDING.trace.md\nContinue from (do not read native; pass to Tiinex after bootstrap):\n${docsPointerPath}\n`));
  assert.equal(siteInvocation.includes('.topics/015-handoff.trace.md'), false, 'v2 transport address must not duplicate semantic Handoff path from the route Pointer');
  assert.notEqual(siteInvocation, docsInvocation, 'parallel recipients use route-specific outer invocation over the same shared v2 ZIP bytes');
  assert.equal(siteInvocation.includes('Workspace:'), false, 'recipient-v2 outer routing must not expose Workspace as an alternate ingress hint');
  const regeneratedSiteOutput = projectPortableHandoffCarrierOutputFromPackage({ ...multi.bundle, route: siteQualifiedRoute.id });
  const regeneratedDocsOutput = projectPortableHandoffCarrierOutputFromPackage({ ...multi.bundle, route: docsQualifiedRoute.id });
  assert.equal(regeneratedSiteOutput.status, 'ready', 'recipient-v2 human output must regenerate from package truth without the legacy carrier JSON projection');
  assert.equal(regeneratedDocsOutput.status, 'ready');
  assert.equal(regeneratedSiteOutput.humanOutput.normalInlineRouting.content, siteInvocation);
  assert.equal(regeneratedDocsOutput.humanOutput.normalInlineRouting.content, docsInvocation);
  assert(Buffer.byteLength(JSON.stringify(regeneratedSiteOutput), 'utf8') < 60_000, 'recipient-v2 package-truth human-output regeneration must remain bounded and not serialize Workspace/archive provider bytes');
  assert.equal(sha256Hex(sharedZipBytes), sharedZipSha256, 'route selection must not mutate the shared recipient-v2 carrier bytes');
  const siteSharedGrounding = groundPortableColdConsumer({ bundle: multi.bundle, route: siteQualifiedRoute.id, toolingAvailable: true, interaction: { mode: 'orientation' } });
  const docsSharedGrounding = groundPortableColdConsumer({ bundle: multi.bundle, route: docsQualifiedRoute.id, toolingAvailable: true, interaction: { mode: 'orientation' } });
  assert.notEqual(siteSharedGrounding.status, 'blocked');
  assert.notEqual(docsSharedGrounding.status, 'blocked');
  assert.equal(siteSharedGrounding.handoff.workspaceId, 'site');
  assert.equal(docsSharedGrounding.handoff.workspaceId, 'docs');
  const sharedOutputPath = path.join(root, regeneratedSiteOutput.humanOutput.primary.filename);
  const sharedCliOutput = await materializeHandoffManufactureCliOutput(multi, { route: siteQualifiedRoute.id, output: sharedOutputPath });
  assert.equal(sharedCliOutput.humanOutput.status, 'ready');
  assert(sharedCliOutput.humanOutput.normalInlineRouting.content.includes(`Continue from (do not read native; pass to Tiinex after bootstrap):\n${sitePointerPath}\n`));
  const sharedOutputArchive = inspectStoredWorkspaceArchive(await readFile(sharedOutputPath), { ownedBytes: true });
  assert.equal(sharedOutputArchive.state, 'qualified');
  const sharedOutputInspection = inspectRecipientFacingV2Topology({ files: (sharedOutputArchive.entries || []).map((entry) => ({ path: entry.path, data: entry.data })) });
  assert.equal(sharedOutputInspection.status, 'valid');
  assert.equal(sharedOutputInspection.carrierProjection.routes.length, 2, 'normal v2 CLI output must preserve sibling qualified routes so the exact same ZIP can be reused across parallel recipient invocations');
  const selectedSite = selectRecipientFacingV2Delivery(multi.bundle, siteQualifiedRoute);
  assert.equal(selectedSite.status, 'ready');
  assert.equal(selectedSite.inspection.carrierProjection.routes.length, 1, 'selected cold delivery must not leak sibling Handoff routes');
  assert.deepEqual(selectedSite.inspection.workspaces.map((item) => item.workspaceId), ['site'], 'selected cold delivery must not leak sibling Workspace payloads');
  const selectedColdGrounding = groundPortableColdConsumer({ bundle: selectedSite.bundle, route: selectedSite.routeId, toolingAvailable: true, interaction: { mode: 'orientation' } });
  assert.notEqual(selectedColdGrounding.status, 'blocked', 'recipient-v2 cold grounding must resolve Handoff Markdown through the qualified Workspace archive instead of decoding the ZIP carrier as Markdown');
  assert.equal(selectedColdGrounding.handoff.schemaId, 'tiinex.handoff.v1');
  assert.equal(selectedColdGrounding.handoff.workspaceId, 'site');
  assert.equal(selectedColdGrounding.handoff.workspaceRelativePath, '.topics/015-handoff.trace.md');
  assert.equal(selectedColdGrounding.findings.some((item) => item.code === 'portable.cold-start.handoff.route-bytes.unreadable'), false);

  const participantRoot = path.join(root, 'participant-route');
  await makeWorkspace(participantRoot, { title: 'Participant route', to: 'Loom', blob: [31, 32] });
  await writeFile(path.join(participantRoot, '.topics', 'sigma-role.trace.md'), participantRoleMarkdown('Sigma'), 'utf8');
  const participantInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: participantRoot,
    workspaceId: 'participant-route',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    handoffRoutes: [{ workspaceId: 'participant-route', path: '.topics/015-handoff.trace.md', participantRoles: [{ workspaceId: 'participant-route', path: '.topics/sigma-role.trace.md', label: 'Sigma' }] }],
    toolingBootstrap: 'embedded', runtimeRoot, verifyRoundtrip: false
  });
  const participantPackage = manufactureRecipientRelativeHandoffPackage(participantInput, { legacyRecipientV2Compatibility: true, verifyRoundtrip: false });
  assert.equal(participantPackage.status, 'ready');
  assert.equal(participantPackage.inspection.participantRoles.length, 1);
  assert.equal(participantPackage.inspection.caches.length, 0, 'participant Role already present in a carried Workspace must not be duplicated into cache');
  const participantRoute = participantPackage.inspection.routes[0];
  assert.equal(participantRoute.participantRolePointers.length, 1);
  const participantRolePointer = participantPackage.bundle.files.find((file) => file.path === participantRoute.participantRolePointers[0]);
  assert(participantRolePointer, 'participant Role must be represented by one package-local Pointer ancestor');
  const participantGrounding = groundPortableColdConsumer({ bundle: participantPackage.bundle, route: participantPackage.carrierProjection.routes[0].id, toolingAvailable: true, interaction: { mode: 'orientation' } });
  assert.equal(participantGrounding.participation.packageRoleParticipants.length, 1, 'cold consumer must derive additional participant Role grounding from selected package-local Role Pointer ancestry');
  assert.deepEqual(participantGrounding.participation.packageRoleParticipants[0].roles, ['Sigma']);
  assert.equal(participantGrounding.participation.packageRoleParticipants[0].identities.length, 0, 'package participant Role grounding must not invent holder identity');

  const externalParticipantRoot = path.join(root, 'external-participant-route');
  await makeWorkspace(externalParticipantRoot, { title: 'External participant route', to: 'Loom', blob: [33, 34] });
  const detachedRolePath = path.join(root, 'detached-sigma-role.trace.md');
  await writeFile(detachedRolePath, participantRoleMarkdown('Sigma'), 'utf8');
  const externalParticipantInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: externalParticipantRoot,
    workspaceId: 'external-participant-route',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    handoffRoutes: [{ workspaceId: 'external-participant-route', path: '.topics/015-handoff.trace.md', participantRoles: [{ reference: 'external://roles/sigma', label: 'Sigma' }] }],
    materialBindings: { Sigma: { sourcePath: detachedRolePath, referenceTarget: 'external://roles/sigma' } },
    toolingBootstrap: 'embedded', runtimeRoot, verifyRoundtrip: false
  });
  const externalParticipantPackage = manufactureRecipientRelativeHandoffPackage(externalParticipantInput, { legacyRecipientV2Compatibility: true, verifyRoundtrip: false });
  assert.equal(externalParticipantPackage.status, 'ready');
  assert.equal(externalParticipantPackage.inspection.caches.length, 1, 'external participant Role must be carried by the owning Workspace cache');
  assert.equal(externalParticipantPackage.inspection.participantRoles.length, 1);
  assert.equal(externalParticipantPackage.inspection.participantRoles[0].targetCarrierKind, 'workspace-cache-entry');
  assert.equal(externalParticipantPackage.inspection.routes[0].participantRolePointers.length, 1);
  const externalParticipantGrounding = groundPortableColdConsumer({ bundle: externalParticipantPackage.bundle, route: externalParticipantPackage.carrierProjection.routes[0].id, toolingAvailable: true, interaction: { mode: 'orientation' } });
  assert.equal(externalParticipantGrounding.participation.packageRoleParticipants.length, 1, 'cold consumer must resolve participant Role bytes from the owning Workspace cache');
  assert.deepEqual(externalParticipantGrounding.participation.packageRoleParticipants[0].roles, ['Sigma']);

  const pointerDependencyRoot = path.join(root, 'pointer-dependency-route');
  await makeWorkspace(pointerDependencyRoot, { title: 'Pointer dependency route', to: 'Loom', requiredTarget: 'dependency-pointer.trace.md', blob: [35, 36] });
  await writeFile(path.join(pointerDependencyRoot, '.topics', 'dependency-pointer.trace.md'), pointerDependencyMarkdown('external://dependency/exact-asset'), 'utf8');
  const pointerDependencyInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: pointerDependencyRoot,
    workspaceId: 'pointer-dependency-route',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    materialBindings: { 'external://dependency/exact-asset': { content: 'external-pointer-target-bytes', providerId: 'fixture-external-pointer-target', providerKind: 'supplied-material', referenceTarget: 'external://dependency/exact-asset' } },
    toolingBootstrap: 'embedded', runtimeRoot, verifyRoundtrip: false
  });
  const pointerDependencyPackage = manufactureRecipientRelativeHandoffPackage(pointerDependencyInput, { legacyRecipientV2Compatibility: true, verifyRoundtrip: false });
  assert.equal(pointerDependencyPackage.status, 'ready', 'external target of a carried Pointer must be closed into the owning Workspace cache');
  assert.equal(pointerDependencyPackage.inspection.caches.length, 1);
  const pointerDependencyCache = pointerDependencyPackage.inspection.caches[0];
  assert(pointerDependencyCache.materials.some((item) => item.classification === 'pointer-target' && item.referenceTarget === 'external://dependency/exact-asset'), 'Pointer target exact bytes must be independently represented in the Workspace-scoped cache');
  assert.equal(pointerDependencyCache.materials.some((item) => item.referenceTarget === 'dependency-pointer.trace.md'), false, 'Pointer artifact already inside the Workspace must not be duplicated into cache');

  const recursivePointerRoot = path.join(root, 'recursive-pointer-route');
  await makeWorkspace(recursivePointerRoot, { title: 'Recursive pointer route', to: 'Loom', requiredTarget: 'dependency-pointer.trace.md', blob: [37, 38] });
  await writeFile(path.join(recursivePointerRoot, '.topics', 'dependency-pointer.trace.md'), pointerDependencyMarkdown('external://dependency/nested-pointer'), 'utf8');
  const detachedNestedPointerPath = path.join(root, 'detached-nested-pointer.trace.md');
  await writeFile(detachedNestedPointerPath, pointerDependencyMarkdown('external://dependency/final-asset'), 'utf8');
  const recursivePointerInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: recursivePointerRoot,
    workspaceId: 'recursive-pointer-route',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    materialBindings: {
      'external://dependency/nested-pointer': { sourcePath: detachedNestedPointerPath, providerId: 'fixture-nested-pointer', providerKind: 'supplied-material', referenceTarget: 'external://dependency/nested-pointer' },
      'external://dependency/final-asset': { content: 'recursive-final-target-bytes', providerId: 'fixture-final-pointer-target', providerKind: 'supplied-material', referenceTarget: 'external://dependency/final-asset' }
    },
    toolingBootstrap: 'embedded', runtimeRoot, verifyRoundtrip: false
  });
  const recursivePointerPackage = manufactureRecipientRelativeHandoffPackage(recursivePointerInput, { legacyRecipientV2Compatibility: true, verifyRoundtrip: false });
  assert.equal(recursivePointerPackage.status, 'ready', 'recursive Pointer dependency closure must qualify when every exact target is supplied');
  assert.equal(recursivePointerPackage.inspection.caches.length, 1);
  const recursivePointerCache = recursivePointerPackage.inspection.caches[0];
  assert(recursivePointerCache.materials.some((item) => item.referenceTarget === 'external://dependency/nested-pointer'), 'detached nested Pointer bytes must enter the owning Workspace cache');
  assert(recursivePointerCache.materials.some((item) => item.referenceTarget === 'external://dependency/final-asset'), 'recursive target of a detached cached Pointer must also enter the owning Workspace cache');

  const cacheScopeARoot = path.join(root, 'cache-scope-a');
  const cacheScopeBRoot = path.join(root, 'cache-scope-b');
  await makeWorkspace(cacheScopeARoot, { title: 'Cache scope A', to: 'Loom', blob: [39] });
  await makeWorkspace(cacheScopeBRoot, { title: 'Cache scope B', to: 'Loom', blob: [40] });
  const detachedRoleA = path.join(root, 'detached-role-a.trace.md');
  const detachedRoleB = path.join(root, 'detached-role-b.trace.md');
  await writeFile(detachedRoleA, participantRoleMarkdown('Participant A'), 'utf8');
  await writeFile(detachedRoleB, participantRoleMarkdown('Participant B'), 'utf8');
  const scopedCacheInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: cacheScopeARoot,
    workspaceId: 'cache-scope-a',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    additionalWorkspaces: [{ id: 'cache-scope-b', root: cacheScopeBRoot, title: 'Cache scope B', workspaceTargetPath: 'workspace.workspace.md' }],
    handoffRoutes: [
      { workspaceId: 'cache-scope-a', path: '.topics/015-handoff.trace.md', participantRoles: [{ reference: 'external://roles/participant-a', label: 'Participant A' }] },
      { workspaceId: 'cache-scope-b', path: '.topics/015-handoff.trace.md', participantRoles: [{ reference: 'external://roles/participant-b', label: 'Participant B' }] }
    ],
    materialBindings: {
      'external://roles/participant-a': { sourcePath: detachedRoleA, referenceTarget: 'external://roles/participant-a' },
      'external://roles/participant-b': { sourcePath: detachedRoleB, referenceTarget: 'external://roles/participant-b' }
    },
    toolingBootstrap: 'embedded', runtimeRoot, verifyRoundtrip: false
  });
  const scopedCachePackage = manufactureRecipientRelativeHandoffPackage(scopedCacheInput, { legacyRecipientV2Compatibility: true, verifyRoundtrip: false });
  assert.equal(scopedCachePackage.status, 'ready');
  assert.equal(scopedCachePackage.inspection.caches.length, 2, 'detached dependencies owned by different route Workspaces must produce separate Workspace-scoped caches');
  const cacheByWorkspace = new Map(scopedCachePackage.inspection.caches.map((cache) => [cache.workspaceId, cache]));
  assert(cacheByWorkspace.get('cache-scope-a')?.materials.some((item) => item.referenceTarget === 'external://roles/participant-a'));
  assert.equal(cacheByWorkspace.get('cache-scope-a')?.materials.some((item) => item.referenceTarget === 'external://roles/participant-b'), false, 'Workspace cache A must not absorb Workspace B material');
  assert(cacheByWorkspace.get('cache-scope-b')?.materials.some((item) => item.referenceTarget === 'external://roles/participant-b'));
  assert.equal(cacheByWorkspace.get('cache-scope-b')?.materials.some((item) => item.referenceTarget === 'external://roles/participant-a'), false, 'Workspace cache B must not absorb Workspace A material');

  const invalidRoot = path.join(root, 'invalid-route');
  await makeWorkspace(invalidRoot, { title: 'Invalid route', to: 'Anchor', invalidHandoff: true, blob: [12] });
  const invalidInput = await prepareNodeHandoffManufacturingInput({ workspaceRoot: invalidRoot, workspaceId: 'invalid-route', workspaceTargetPath: 'workspace.workspace.md', handoffPath: '.topics/015-handoff.trace.md', toolingBootstrap: 'embedded', runtimeRoot, verifyRoundtrip: false });
  const invalid = manufactureRecipientRelativeHandoffPackage(invalidInput, { legacyRecipientV2Compatibility: true, verifyRoundtrip: false });
  assert.equal(invalid.status, 'blocked');
  assert.notEqual(invalid.carrierProjection?.routes?.[0]?.conformance?.status, 'qualified');

  console.log('✓ Tooling 027-5 archive-backed Handoff carrier v2 qualification, isolation, dedup, tamper, and fail-closed regressions passed');
} finally {
  await rm(root, { recursive: true, force: true });
}

function archiveBinding(result) { return result.descriptor.workspaceArchiveBindings[0]; }
function assertProviderBlocked(result, descriptor, reason) {
  const provider = buildHandoffWorkspaceByteProvider(providerBundle(result, descriptor), descriptor);
  assert.equal(provider.status, 'blocked');
  assert(provider.workspaces.some((workspace) => workspace.reasons.includes(reason)), `expected provider reason ${reason}; got ${provider.workspaces.flatMap((workspace) => workspace.reasons).join(', ')}`);
}

function providerBundle(result, descriptor = result.descriptor, baseBundle = result.bundle) {
  const virtual = [];
  const providerWorkspaces = result.inspection?.workspaceByteProvider?.workspaces || [];
  for (const binding of descriptor?.workspaceArchiveBindings || []) {
    const providerWorkspace = providerWorkspaces.find((item) => String(item.id || '') === String(binding.workspaceId || ''));
    const sourceBinding = (result.descriptor?.workspaceArchiveBindings || []).find((item) => String(item.workspaceId || '') === String(binding.workspaceId || ''));
    if (!providerWorkspace?.workspaceTarget?.data || !sourceBinding?.workspaceTarget?.packagePath) continue;
    virtual.push({ path: sourceBinding.workspaceTarget.packagePath, data: providerWorkspace.workspaceTarget.data });
  }
  return { ...baseBundle, files: [...(baseBundle?.files || []), ...virtual] };
}
function mutateDescriptor(descriptor, mutate) { const value = structuredClone(descriptor); mutate(value); return value; }
function mutateBundleFile(bundle, targetPath, mutate) {
  return { ...bundle, files: bundle.files.map((file) => String(file.path || '') === targetPath ? { ...file, data: mutate(packageFileBytes(file)) } : file) };
}
async function makeWorkspace(rootPath, options = {}) {
  const title = options.title || 'Workspace';
  const to = options.to || 'Anchor';
  await mkdir(path.join(rootPath, '.topics'), { recursive: true });
  await mkdir(path.join(rootPath, 'content'), { recursive: true });
  const count = options.includeWorkspaceArtifact === false ? 0 : Number(options.workspaceArtifactCount || 1);
  for (let index = 0; index < count; index += 1) await writeFile(path.join(rootPath, index ? `workspace-${index + 1}.workspace.md` : 'workspace.workspace.md'), workspaceMarkdown(`${title}${index ? ` ${index + 1}` : ''}`), 'utf8');
  await writeFile(path.join(rootPath, '.topics', 'context.md'), '# context\n', 'utf8');
  const target = options.requiredTarget || 'context.md';
  const requiredContext = options.requiredContext || `- ctx\n  - Material: exact context\n  - Material Reference: [Context](${target})\n  - Purpose: grounding\n  - Availability: available`;
  let handoff = qualifiedHandoffFixture({
    title: `${title} handoff`, to, purpose: 'archive carrier v2 fixture', createdAt: '2026-08-24 20:00:00',
    requiredContext
  });
  if (options.invalidHandoff) handoff = handoff.replace(/Current Schema:\s*\[tiinex\.handoff\.v1\]/, 'Current Schema: [tiinex.note.v1]');
  await writeFile(path.join(rootPath, '.topics', '015-handoff.trace.md'), handoff, 'utf8');
  await writeFile(path.join(rootPath, 'content', 'blob.bin'), Uint8Array.from(options.blob || [1, 2, 3]));
  const scaleFiles = Number(options.scaleFiles || 0);
  if (scaleFiles > 0) {
    const scaleRoots = ['topics', 'schemas', 'src', 'styles', 'assets']
      .map((name) => path.join(rootPath, 'scale', name));
    await Promise.all(scaleRoots.map((directory) => mkdir(directory, { recursive: true })));
    await Promise.all(Array.from({ length: scaleFiles }, (_, index) => {
      const slot = index % 5;
      const id = String(index).padStart(4, '0');
      const payload = 'x'.repeat(512 + ((index * 97) % 3584));
      if (slot === 0) return writeFile(path.join(scaleRoots[0], `entry-${id}.trace.md`), `# Scale trace ${index}\n\n- Current Schema: tiinex.note.v1\n\n${payload}\n`, 'utf8');
      if (slot === 1) return writeFile(path.join(scaleRoots[1], `entry-${id}.schema.runtime.json`), `${JSON.stringify({ schema: 'tiinex.scale.fixture.v1', index, payload })}\n`, 'utf8');
      if (slot === 2) return writeFile(path.join(scaleRoots[2], `entry-${id}.js`), `export const scaleEntry${index} = ${JSON.stringify(payload)};\n`, 'utf8');
      if (slot === 3) return writeFile(path.join(scaleRoots[3], `entry-${id}.css`), `.scale-${index}{--fixture:${JSON.stringify(payload)}}\n`, 'utf8');
      return writeFile(path.join(scaleRoots[4], `entry-${id}.bin`), Uint8Array.from({ length: 512 + ((index * 31) % 3584) }, (_, offset) => (index + offset) & 0xff));
    }));
  }
}
function workspaceMarkdown(title, options = {}) {
  const envelope = options.omitEnvelopeSchema ? '' : `- Envelope Schema: [tiinex.root.v1](${ROOT_SCHEMA_TARGET})\n`;
  const parent = options.parent || null;
  const parentBlock = parent ? `- Parent\n  - Parent Schema: [tiinex.handoff.v1](${HANDOFF_SCHEMA_TARGET})\n  - Created At: 2026-08-24 19:00:00\n  - Trace: [Parent](parent.trace.md)\n  - Origin:\n    - [relative](parent.trace.md)\n    - [browse + git](https://github.com/Tiinex/site/blob/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/.topics/parent.trace.md)\n` : '';
  const parentIntegrity = parent ? `- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: [Parent](https://github.com/Tiinex/site/blob/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/.topics/parent.trace.md)\n  - Value: ${String(parent.targetValue || '')}\n\n` : '';
  const unsigned = `# Continuity Context\n\n${envelope}${parentBlock}- Current\n  - Current Schema: [tiinex.workspace.v1](${WORKSPACE_SCHEMA_TARGET})\n  - Created At: 2026-08-24 20:00:00\n  - Authors: Fixture\n  - Why: Exercise archive-backed Workspace target qualification.\n  - Summary: ${title}\n  - Status: active/local\n\n---\n\n# ${title}\n\nWorkspace fixture body.\n\n# Continuity Integrity\n\n${parentIntegrity}- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: `;
  if (options.selfMode === 'prepared') return `${unsigned}\n`;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  const markdown = options.selfMode === 'mismatch' ? sealed.markdown.replace('Workspace fixture body.', 'Workspace fixture body CORRUPTED.') : sealed.markdown;
  return `${markdown}\n`;
}

function pointerDependencyMarkdown(target) {
  return `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.pointer.v1
  - Created At: 2026-08-24 20:00:00

---

# Dependency Pointer

## Destinations

- Exact dependency: [target](${target})

## Interpretation Limits

- This fixture declares one exact dependency target.

# Continuity Integrity
`;
}

function participantRoleMarkdown(label) {
  return `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: tiinex.party.role.v1\n  - Created At: 2026-08-24 20:00:00\n\n---\n\n# ${label}\n\n## Role Identity\n\n- Role Label: ${label}\n- Role Kind: bounded participant role\n\n## Role Boundary\n\n- In Scope: bounded interaction grounding\n- Out Of Scope: inferred holder identity\n\n## Authority And Responsibility Boundary\n\n- May Do: participate within declared Role boundary\n- Does Not Authorize: transport identity inference\n\n## Holder Relationship\n\n- Holder State: unproven\n\n## Interpretation Limits\n\n- Does Not Prove: holder identity\n- Must Not Be Treated As: Handoff endpoint promotion\n\n# Continuity Integrity\n`;
}

async function manufactureWorkspaceTargetCase(root, runtimeRoot, id, markdown, extraFiles = {}) {
  const rootPath = path.join(root, id);
  await makeWorkspace(rootPath, { title: id, to: 'Anchor', blob: [21, 22] });
  await writeFile(path.join(rootPath, 'workspace.workspace.md'), markdown, 'utf8');
  for (const [relative, content] of Object.entries(extraFiles)) {
    const absolute = path.join(rootPath, relative);
    await mkdir(path.dirname(absolute), { recursive: true });
    await writeFile(absolute, content, 'utf8');
  }
  const input = await prepareNodeHandoffManufacturingInput({ workspaceRoot: rootPath, workspaceId: id, workspaceTargetPath: 'workspace.workspace.md', handoffPath: '.topics/015-handoff.trace.md', toolingBootstrap: 'embedded', runtimeRoot, verifyRoundtrip: false });
  return manufactureRecipientRelativeHandoffPackage(input, { legacyRecipientV2Compatibility: true, verifyRoundtrip: false });
}

function providerWithMatchingUnverifiedTarget(result, readyProvider) {
  const descriptor = structuredClone(result.descriptor);
  const binding = descriptor.workspaceArchiveBindings[0];
  const targetInnerPath = binding.workspaceTarget.innerPath;
  const entries = readyProvider.workspaces[0].entries.map((entry) => ({ path: entry.path, referenceTarget: entry.referenceTarget, data: packageFileBytes({ data: entry.data }) }));
  const target = entries.find((entry) => entry.path === targetInnerPath);
  const original = new TextDecoder().decode(target.data);
  const originalSelf = validatedC14nV2PrimarySelfDigest(original);
  assert.equal(originalSelf.state, 'verified');
  const prepared = original.replace(originalSelf.value, ' '.repeat(originalSelf.value.length));
  target.data = new TextEncoder().encode(prepared);
  const archiveBytes = exportFileMapZipUint8Array(entries.map((entry) => ({ path: entry.path, data: entry.data })), 'fixture.archive.path.invalid');
  const targetSha = sha256Hex(target.data);
  const archiveSha = sha256Hex(archiveBytes);
  const self = validatedC14nV2PrimarySelfDigest(prepared);
  assert.equal(self.state, 'prepared');
  binding.workspaceTarget.bytes = target.data.byteLength;
  binding.workspaceTarget.sha256 = targetSha;
  binding.workspaceTarget.selfIntegrity = { state: self.state, value: self.value };
  binding.representation.bytes = archiveBytes.byteLength;
  binding.representation.digest.value = archiveSha;
  const declaredTarget = binding.entryMap.entries.find((entry) => entry.path === targetInnerPath);
  declaredTarget.bytes = target.data.byteLength;
  declaredTarget.sha256 = targetSha;
  const workspaceTarget = descriptor.workspaceMaterializations[0].includedEntries.find((entry) => entry.path === targetInnerPath);
  workspaceTarget.bytes = target.data.byteLength;
  workspaceTarget.sha256 = targetSha;
  const fingerprint = archiveEntryFingerprint(binding.entryMap.entries);
  const totalBytes = binding.entryMap.entries.reduce((sum, entry) => sum + Number(entry.bytes || 0), 0);
  binding.completeness.totalBytes = totalBytes;
  binding.completeness.entriesFingerprint = fingerprint;
  descriptor.workspaceMaterializations[0].completenessEvidence.totalBytes = totalBytes;
  descriptor.workspaceMaterializations[0].completenessEvidence.entriesFingerprint = fingerprint;
  const baseBundle = providerBundle(result, descriptor);
  const bundle = { ...baseBundle, files: baseBundle.files.map((file) => {
    if (file.path === binding.workspaceTarget.packagePath) return { ...file, data: target.data, bytes: target.data.byteLength, sha256: targetSha };
    if (file.path === binding.representation.packagePath) return { ...file, data: archiveBytes, bytes: archiveBytes.byteLength, sha256: archiveSha };
    return file;
  }) };
  return buildHandoffWorkspaceByteProvider(bundle, descriptor);
}

function archiveEntryFingerprint(entries = []) {
  const normalized = entries.map((entry) => ({ path: String(entry.path || ''), bytes: Number(entry.bytes || 0), sha256: String(entry.sha256 || '').toLowerCase(), referenceTarget: String(entry.referenceTarget || '') })).sort((a, b) => a.path.localeCompare(b.path));
  return sha256Hex(utf8Bytes(stableJson(normalized)));
}
function stableJson(value) { return JSON.stringify(sortJson(value)); }
function sortJson(value) { if (Array.isArray(value)) return value.map(sortJson); if (!value || typeof value !== 'object') return value; return Object.fromEntries(Object.keys(value).sort().map((key) => [key, sortJson(value[key])])); }
function mutateRecipientV2Markdown(bundle, targetPath, mutate) {
  return rebuildRecipientV2Manifest(bundle, (files) => files.map((file) => {
    if (String(file.path || '') !== String(targetPath || '')) return file;
    const source = new TextDecoder().decode(packageFileBytes(file));
    const sealed = sealC14nV2Self(String(mutate(source) || ''));
    assert.equal(sealed.state, 'sealed');
    return { ...file, data: utf8Bytes(sealed.markdown), content: undefined, markdown: undefined };
  }));
}
function addCompetingWorkspaceRepresentation(bundle, sourcePath) {
  return rebuildRecipientV2Manifest(bundle, (files) => {
    const source = files.find((file) => String(file.path || '') === String(sourcePath || ''));
    assert(source);
    const pathName = String(sourcePath || '').replace(/-2-workspace-representation\.trace\.md$/i, '-3-workspace-representation-duplicate.trace.md');
    assert.notEqual(pathName, sourcePath);
    return [...files, { ...source, path: pathName }];
  });
}
function rebuildRecipientV2Manifest(bundle, mutateFiles) {
  const manifestFile = (bundle.files || []).find((file) => String(file.path || '') === RECIPIENT_V2_TRANSPORT_MANIFEST_PATH);
  assert(manifestFile);
  const originalManifest = JSON.parse(new TextDecoder().decode(packageFileBytes(manifestFile)));
  const semanticFiles = (bundle.files || []).filter((file) => String(file.path || '') !== RECIPIENT_V2_TRANSPORT_MANIFEST_PATH);
  const files = mutateFiles([...semanticFiles]);
  const manifest = buildRecipientV2TransportManifestFile(files, { format: originalManifest.format, packageRootPath: originalManifest.packageRootPath, entryArtifactPath: originalManifest.entryArtifactPath });
  return { ...bundle, files: [...files, manifest] };
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
