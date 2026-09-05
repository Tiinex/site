import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { entryFromEnumeration } from '../adapters/node/handoff.manufacture.requirements.js';
import { safeWorkspaceToken } from '../adapters/node/handoff.manufacture.multiRoot.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { groundContinuationOperationInput, materializeGroundWorkspaceCliOutput } from '../adapters/cli/cli.ground-materialize.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { qualifyPortableColdStart } from './coldStartQualification.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { zipBufferToImportEntries } from '../../../adapters/archive/archive.adapter.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { virtualCacheMaterial } from './recipientV2.inspect.helpers.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';
import { recipientFacingV2PackageZipBuffer } from '../output/recipientV2.zip.js';
import { loadNodePortableInput } from '../input/node.input.js';
import { inspectRecipientFacingV2Topology } from './recipientV2.inspect.js';
import { projectHandoffHumanOutput } from './carrierProjection.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-multi-root-'));
try {
  const siteRoot = path.join(root, 'site');
  const docsRoot = path.join(root, 'docs');
  const runtimeRoot = path.join(root, 'runtime');
  await makeWorkspace(siteRoot, 'Site', 'Loom', 'site-context.md', [10, 11, 12]);
  await makeWorkspace(docsRoot, 'Docs', 'Axiom', 'docs-context.md', [0, 1, 2, 255, 128]);
  await makeRuntime(runtimeRoot);

  const secondaryOnlyInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: siteRoot,
    workspaceId: 'site',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    additionalWorkspaces: [{ id: 'docs', root: docsRoot, title: 'Docs', workspaceTargetPath: 'workspace.workspace.md' }],
    handoffRoutes: [{ workspaceId: 'docs', path: '.topics/015-handoff.trace.md' }],
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  assert.deepEqual(secondaryOnlyInput.workspaceMaterializations.map((item) => item.id), ['site', 'docs']);
  assert.equal(secondaryOnlyInput.manufacturingEvidence.workspaceEnumerations.length, 2);
  assert.equal(secondaryOnlyInput.workspaceMaterializations[1].source.authority, 'none');
  const secondaryOnly = manufactureRecipientRelativeHandoffPackage(secondaryOnlyInput, { legacyRecipientV2Compatibility: true, packageInput: { builtAt: '2026-08-23T18:00:00.000Z' } });
  assert.equal(secondaryOnly.status, 'ready');
  assert.equal(secondaryOnly.carrierProjection.routes.length, 1);
  assert.equal(secondaryOnly.carrierProjection.routes[0].workspaceId, 'docs');
  assert.equal(secondaryOnly.carrierProjection.routes[0].workspaceRelativePath, '.topics/015-handoff.trace.md');
  assert.equal(secondaryOnly.carrierProjection.workspaces.length, 2, 'a carried workspace may intentionally have no route');
  const docsBinding = secondaryOnly.descriptor.workspaceArchiveBindings.find((binding) => binding.workspaceId === 'docs');
  assert(docsBinding, 'secondary Workspace must have one recipient-v2 archive binding');
  const docsArchive = secondaryOnly.bundle.files.find((file) => file.path === docsBinding.representation.packagePath);
  assert(docsArchive, 'secondary Workspace archive must be carried');
  const docsEntries = await zipBufferToImportEntries(packageFileBytes(docsArchive), { source: 'multi-root-docs-workspace', excludeRepositoryInternals: true });
  assert.equal(docsEntries.errors.length, 0);
  const docsBlob = docsEntries.entries.find((entry) => entry.path === 'content/blob.bin');
  assert(docsBlob, 'secondary binary bytes must remain addressable inside the Workspace archive');
  assert.deepEqual([...docsBlob.bytes], [0, 1, 2, 255, 128], 'secondary binary bytes must survive package manufacture');

  const twoRoutesInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: siteRoot,
    workspaceId: 'site',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    additionalWorkspaces: [{ id: 'docs', root: docsRoot, workspaceTargetPath: 'workspace.workspace.md' }],
    handoffRoutes: [
      { workspaceId: 'site', path: '.topics/015-handoff.trace.md' },
      { workspaceId: 'docs', path: '.topics/015-handoff.trace.md' }
    ],
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  const twoRoutes = manufactureRecipientRelativeHandoffPackage(twoRoutesInput, { legacyRecipientV2Compatibility: true, packageInput: { builtAt: '2026-08-23T18:00:00.000Z' } });
  assert.equal(twoRoutes.status, 'ready');
  assert.equal(twoRoutes.carrierProjection.mode, 'shared');
  assert.deepEqual(twoRoutes.carrierProjection.routes.map((route) => route.workspaceId).sort(), ['docs', 'site']);
  assert.equal(twoRoutes.pointerEntrypointProjection.entries.length, 2);
  const sharedHumanOutput = projectHandoffHumanOutput({ projection: twoRoutes.carrierProjection, route: 'handoff-route:site:.topics/015-handoff.trace.md' });
  assert.equal(sharedHumanOutput.status, 'ready');
  assert.match(sharedHumanOutput.primary.filename, /anchor-to-axiom-and-loom\.handoff-package\.zip$/, 'shared outer filename must include every recipient in deterministic qualified-route order');
  const sharedMultiRouteContinuedRoot = path.join(root, 'continued-shared-multi-route-site');
  const sharedMultiRouteContinued = await materializeGroundWorkspaceCliOutput({
    readiness: { state: 'grounded-to-act' },
    authority: { route: { workspaceId: 'site' } }
  }, { bundle: twoRoutes.bundle }, { continue: sharedMultiRouteContinuedRoot });
  assert.equal(sharedMultiRouteContinued.continuationMaterialization.state, 'materialized');
  assert.equal(sharedMultiRouteContinued.continuationMaterialization.workspaceId, 'site');
  assert.equal(await readFile(path.join(sharedMultiRouteContinuedRoot, '.topics', 'site-context.md'), 'utf8'), '# Site context\n', 'generic recipient-v2 multi-route continuation must materialize the explicitly selected Workspace');

  const longPrefix = 'required-context:' + 'shared-route-material-'.repeat(8);
  const longCache = {
    facts: {
      workspaceId: 'site',
      materials: [
        { requirementId: `${longPrefix}alpha`, archiveEntry: 'material/1.bin', bytes: 1, sha256: 'a' },
        { requirementId: `${longPrefix}beta`, archiveEntry: 'material/2.bin', bytes: 1, sha256: 'b' }
      ]
    },
    archive: { archive: { entries: [
      { path: 'material/1.bin', data: Uint8Array.from([1]), bytes: 1, sha256: 'a' },
      { path: 'material/2.bin', data: Uint8Array.from([2]), bytes: 1, sha256: 'b' }
    ] } }
  };
  const longCacheProjection = virtualCacheMaterial(longCache, []);
  assert.equal(longCacheProjection.files.length, 2);
  assert.notEqual(longCacheProjection.files[0].path, longCacheProjection.files[1].path, 'long route-scoped material identities must remain collision-resistant after bounded path projection');
  assert(longCacheProjection.files.every((file) => /-[0-9a-f]{12}\.bin$/.test(String(file.path || ''))), 'bounded long material paths must retain a deterministic digest suffix');
  const longRoutePrefix = `.topics/${'shared-route-segment-'.repeat(7)}`;
  const longRouteTokenA = safeWorkspaceToken(`${longRoutePrefix}alpha-handoff.trace.md`);
  const longRouteTokenB = safeWorkspaceToken(`${longRoutePrefix}beta-handoff.trace.md`);
  assert.notEqual(longRouteTokenA, longRouteTokenB, 'long route identities with the same truncated human prefix must remain distinct before route-scoped requirement ids are formed');
  assert(/-[0-9a-f]{12}$/.test(longRouteTokenA) && /-[0-9a-f]{12}$/.test(longRouteTokenB), 'bounded long route tokens must retain deterministic digest suffixes');

  const businessRoot = path.join(root, 'business');
  await makeWorkspace(businessRoot, 'Business', 'Anchor', 'business-context.md', [21, 22, 23]);
  await writeFile(path.join(businessRoot, '.topics', 'anchor-role.trace.md'), roleMarkdown('Anchor'), 'utf8');
  await writeFile(path.join(businessRoot, '.topics', 'axiom-role.trace.md'), roleMarkdown('Axiom'), 'utf8');
  await writeFile(path.join(businessRoot, '.topics', 'loom-role.trace.md'), roleMarkdown('Loom'), 'utf8');
  await mkdir(path.join(businessRoot, '.topics', 'roles'), { recursive: true });
  await writeFile(path.join(businessRoot, '.topics', 'roles', '001-6-kodax-role.trace.md'), roleMarkdown('Kodax'), 'utf8');
  const loomRoutePath = '.topics/tooling/001-1-1-1-1-1-anchor-to-loom-artifact-first-shared-carrier-hardening-handoff.trace.md';
  const axiomRoutePath = '.topics/role-authority/001-1-1-1-1-1-anchor-to-axiom-human-first-domain-neutral-canonical-clarification-handoff.trace.md';
  await mkdir(path.join(siteRoot, '.topics', 'tooling'), { recursive: true });
  await mkdir(path.join(docsRoot, '.topics', 'role-authority'), { recursive: true });
  await writeFile(path.join(siteRoot, loomRoutePath), qualifiedHandoffFixture({
    title: 'Anchor to Loom shared-carrier fixture',
    to: 'Loom',
    fromReference: 'external://roles/anchor',
    toReference: 'external://roles/loom',
    purpose: 'shared full-source Loom route',
    createdAt: '2026-08-23 18:01:00',
    requiredContext: `- loom-shared-carrier-context
  - Material: exact Site context
  - Material Reference: [Context](../site-context.md)
  - Purpose: prove Loom route-local context
  - Availability: available
- carried-docs-context
  - Material: exact Docs context already present in the carried Docs Workspace
  - Material Reference: [Docs Context](docs::.topics/docs-context.md)
  - Purpose: prove workspace-qualified Required Context resolves directly from an already-carried complete Workspace without cache duplication
  - Availability: available`
  }), 'utf8');
  await writeFile(path.join(docsRoot, '.topics', 'axiom-one.md'), '# Axiom semantic decision\n', 'utf8');
  await writeFile(path.join(docsRoot, '.topics', 'axiom-two.md'), '# Axiom boundary discovery\n', 'utf8');
  await writeFile(path.join(docsRoot, axiomRoutePath), qualifiedHandoffFixture({
    title: 'Anchor to Axiom shared-carrier fixture',
    to: 'Axiom',
    fromReference: 'external://roles/anchor',
    toReference: 'external://roles/axiom',
    purpose: 'shared full-source Axiom route',
    createdAt: '2026-08-23 18:01:00',
    requiredContext: `- anchor-semantic-clarification-decision
  - Material: exact Anchor semantic clarification decision
  - Material Reference: [Decision](../axiom-one.md)
  - Purpose: reproduce the long route-scoped material identity
  - Availability: available
- axiom-boundary-discovery
  - Material: exact Axiom boundary discovery
  - Material Reference: [Boundary](../axiom-two.md)
  - Purpose: reproduce the second long route-scoped material identity
  - Availability: available`
  }), 'utf8');
  const sharedInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: siteRoot,
    workspaceId: 'site',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: loomRoutePath,
    additionalWorkspaces: [
      { id: 'docs', root: docsRoot, workspaceTargetPath: 'workspace.workspace.md' },
      { id: 'business', root: businessRoot, workspaceTargetPath: 'workspace.workspace.md' }
    ],
    handoffRoutes: [
      { workspaceId: 'site', path: loomRoutePath },
      { workspaceId: 'docs', path: axiomRoutePath }
    ],
    materialBindings: {
      'external://roles/anchor': { workspaceId: 'business', path: '.topics/anchor-role.trace.md' },
      'external://roles/axiom': { workspaceId: 'business', path: '.topics/axiom-role.trace.md' },
      'external://roles/loom': { workspaceId: 'business', path: '.topics/loom-role.trace.md' }
    },
    toolingBootstrap: 'embedded',
    runtimeRoot,
    verifyRoundtrip: true
  });
  const shared = manufactureRecipientRelativeHandoffPackage({ ...sharedInput, recipientRouteSelector: `site:${loomRoutePath}` }, { verifyRoundtrip: true, packageInput: { builtAt: '2026-08-23T18:01:00.000Z' } });
  assert.equal(shared.status, 'ready', JSON.stringify(shared.findings, null, 2));
  assert.equal(shared.verification.roundtrip, 'passed');
  assert.equal(shared.carrierProjection.mode, 'single', 'package-v1 recipient surface carries exactly one selected Handoff route');
  assert.equal(shared.inspection.packageContract?.packageRole, 'recipient-facing-handoff-carrier');
  assert.equal(shared.inspection.packageContract?.carrierKind, 'self-contained');
  assert.deepEqual(shared.carrierProjection.workspaces.map((item) => item.id).sort(), ['business', 'docs', 'site'], 'package-v1 preserves the complete inherited Workspace source chain');
  assert.deepEqual(shared.carrierProjection.routes.map((item) => item.workspaceId), ['site'], 'unselected sibling Handoff routes are not projected into the recipient closure');
  assert.equal(shared.inspection.routes.length, 1);
  assert.equal(shared.inspection.routes[0].workspaceId, 'site');
  assert.equal(shared.inspection.routes[0].workspaceRelativeHandoffPath, loomRoutePath);
  assert.equal(shared.findings.some((item) => item.code === 'portable.handoff-v2.outer-file-map.duplicate-path'), false);
  assert.equal(shared.inspection.caches.length, 0, 'workspace-bound endpoint Roles must not be duplicated through detached caches');
  assert.equal(shared.inspection.endpointRoles.length, 2, 'selected Loom route carries only its From/To Role pointers');
  assert(shared.inspection.endpointRoles.every((item) => item.targetCarrierKind === 'workspace-archive-entry' && item.targetWorkspaceId === 'business'));
  assert.equal(shared.bundle.files.some((file) => String(file.path || '').includes('workspace-payload')), false, 'complete package-local Workspace bindings do not emit Workspace External Payload companions');
  assert.equal(shared.bundle.files.some((file) => String(file.path || '').includes('workspace-representation')), false, 'complete package-local Workspace bindings do not emit Workspace Representation companions');
  assert(recipientFacingV2PackageZipBuffer(shared.bundle, { inspection: shared.inspection }).byteLength > 0, 'package-v1 recipient bundle must serialize through the supported deterministic ZIP writer');
  const continuationInput = groundContinuationOperationInput({ includeRequiredContext: '', includeCurrentWork: false }, { continue: path.join(root, 'continued-site') });
  assert.equal(continuationInput.includeRequiredContext, '', 'common --continue path must not automatically project every qualified Required Context body');
  assert.equal(continuationInput.includeCurrentWork, true, 'common --continue path must automatically request the exact current-work body');
  const fullContinuationInput = groundContinuationOperationInput({ includeRequiredContext: '', includeCurrentWork: false }, { continue: path.join(root, 'continued-site-full'), full: true });
  assert.equal(fullContinuationInput.includeRequiredContext, 'all', 'explicit --full continuation must retain the complete qualified Required Context receipt path');
  const continuedSiteRoot = path.join(root, 'continued-site');
  const continued = await materializeGroundWorkspaceCliOutput({
    readiness: { state: 'grounded-to-act' },
    authority: { route: { workspaceId: 'site' } }
  }, { bundle: shared.bundle }, { continue: continuedSiteRoot });
  assert.equal(continued.continuationMaterialization.state, 'materialized');
  assert.equal(continued.continuationMaterialization.workspaceId, 'site');
  assert.equal(await readFile(path.join(continuedSiteRoot, '.topics', 'site-context.md'), 'utf8'), '# Site context\n', 'ground continuation must write exact qualified Workspace bytes');
  await assert.rejects(
    materializeGroundWorkspaceCliOutput({ readiness: { state: 'grounded-to-discuss' }, authority: { route: { workspaceId: 'site' } } }, { bundle: shared.bundle }, { continue: path.join(root, 'blocked-site') }),
    /requires-grounded-to-act/,
    'ground continuation must fail closed before Workspace materialization when readiness is not grounded-to-act'
  );
  for (const routeProjection of shared.carrierProjection.routes) {
    const qualification = qualifyPortableColdStart({ bundle: shared.bundle, route: routeProjection.id, preTakeover: 'minimal-bootstrap-only' });
    assert.equal(qualification.status, 'preferred-pass', JSON.stringify(qualification.findings || [], null, 2));
  }

  const packageParentPath = path.join(root, 'shared-package-parent.zip');
  await writeFile(packageParentPath, recipientFacingV2PackageZipBuffer(shared.bundle, { inspection: shared.inspection }));
  const crossWorkspaceGroundLines = [];
  const crossWorkspaceGroundCode = await runPortableCli([
    'ground', packageParentPath,
    '--route', shared.inspection.routes[0].pointerPath,
    '--holder-role', 'Loom',
    '--include-required-context', 'all',
    '--compact'
  ], { log: (value) => crossWorkspaceGroundLines.push(value), error: (value) => crossWorkspaceGroundLines.push(value) }, { runtimeRoot });
  assert.equal(crossWorkspaceGroundCode, 0, crossWorkspaceGroundLines.join('\n'));
  const crossWorkspaceGround = JSON.parse(crossWorkspaceGroundLines.at(-1));
  const docsRequiredContext = crossWorkspaceGround.requiredContext?.items?.find((item) => item.requirementId === 'required:carried-docs-context');
  assert(docsRequiredContext, 'cold ground must project the cross-workspace Required Context manufactured from the carried Docs Workspace');
  assert.equal(docsRequiredContext.state, 'qualified');
  assert.equal(docsRequiredContext.workspaceId, 'docs');
  assert.equal(docsRequiredContext.innerPath, '.topics/docs-context.md');
  assert.equal(crossWorkspaceGround.requiredContext.missingFromWorkspaceSnapshots, 0, 'manufacture and cold ground must agree on carried cross-workspace Required Context visibility');

  const parentBusinessArchivePath = shared.inspection.workspaces.find((item) => item.workspaceId === 'business')?.workspaceArchivePath;
  const parentBusinessArchive = shared.bundle.files.find((file) => file.path === parentBusinessArchivePath);
  const parentBusinessEntries = await zipBufferToImportEntries(packageFileBytes(parentBusinessArchive), { source: 'untargeted-kodax-business-workspace', excludeRepositoryInternals: true });
  assert.equal(parentBusinessEntries.errors.length, 0);
  assert.equal(parentBusinessEntries.entries.some((entry) => entry.path === '.topics/roles/001-6-kodax-role.trace.md'), true, 'complete Business Workspace must carry an untargeted Kodax Role entry before any child route references it');

  const duplicateEnumeration = { materialization: { entries: [
    { path: '.topics/roles/001-6-kodax-role.trace.md', data: Uint8Array.from([1]) },
    { path: '.topics/roles/001-6-kodax-role.trace.md', data: Uint8Array.from([2]) }
  ] } };
  assert.equal(entryFromEnumeration(duplicateEnumeration, '.topics/roles/001-6-kodax-role.trace.md'), null, 'ambiguous exact workspace/path targets must fail closed instead of selecting provider order');

  await writeFile(path.join(siteRoot, loomRoutePath), qualifiedHandoffFixture({
    title: 'Loom to Anchor package-parent return fixture',
    from: 'Loom',
    to: 'Anchor',
    fromReference: 'business::.topics/loom-role.trace.md',
    toReference: 'business::.topics/anchor-role.trace.md',
    purpose: 'prove package-parent return preserves workspace-qualified endpoint Role material without explicit rebinding',
    createdAt: '2026-08-23 18:02:00',
    requiredContext: `- carried-docs-context
  - Material: exact Docs context inherited from the parent carrier
  - Material Reference: [Docs Context](docs::.topics/docs-context.md)
  - Purpose: prove inherited cross-workspace Required Context remains cold-groundable
  - Availability: available`
  }), 'utf8');
  await writeFile(path.join(siteRoot, 'content', 'modified-site.txt'), 'current Site root must override the carried parent Site Workspace\n', 'utf8');
  const packageParentChildOutputDir = path.join(root, 'package-parent-child-output');
  const packageParentLines = [];
  const packageParentCode = await runPortableCli([
    'manufacture-handoff-package', siteRoot,
    '--handoff', loomRoutePath,
    '--workspace-id', 'site',
    '--workspace-target', 'workspace.workspace.md',
    '--package-parent', packageParentPath,
    '--output-dir', packageParentChildOutputDir,
    '--built-at', '2026-08-23T18:02:00.000Z',
    '--compact'
  ], { log: (value) => packageParentLines.push(value), error: (value) => packageParentLines.push(value) }, { runtimeRoot });
  assert.equal(packageParentCode, 0, packageParentLines.join('\n'));
  const packageParentCli = JSON.parse(packageParentLines.at(-1));
  assert.equal(packageParentCli.status, 'ready');
  assert.equal(packageParentCli.verification.roundtrip, 'passed');
  assert.deepEqual(packageParentCli.planSummary.workspaces.map((item) => item.id).sort(), ['business', 'docs', 'site']);
  const packageParentWorkspaceSummary = new Map(packageParentCli.planSummary.workspaces.map((item) => [item.id, item]));
  assert.equal(packageParentWorkspaceSummary.get('business')?.completenessProof, 'qualified-package-parent-workspace-reuse-v1');
  assert.equal(packageParentWorkspaceSummary.get('docs')?.completenessProof, 'qualified-package-parent-workspace-reuse-v1');
  assert.equal(packageParentWorkspaceSummary.get('site')?.completenessProof, 'deterministic-node-enumeration-v1');
  assert.equal(packageParentCli.manufacturingEvidence?.packageParentWorkspaceReuse?.state, 'qualified');
  assert.deepEqual(packageParentCli.manufacturingEvidence?.packageParentWorkspaceReuse?.inheritedWorkspaceIds?.slice().sort(), ['business', 'docs']);

  const childPath = packageParentCli.primaryOutput.path;
  const [parentBundle, childBundle] = await Promise.all([loadNodePortableInput([packageParentPath]), loadNodePortableInput([childPath])]);
  const parentInspection = inspectRecipientFacingV2Topology(parentBundle);
  const childInspection = inspectRecipientFacingV2Topology(childBundle);
  assert.equal(parentInspection.status, 'valid');
  assert.equal(childInspection.status, 'valid');
  assert.equal(childInspection.routes.length, 1);
  assert.equal(childInspection.routes[0].workspaceId, 'site');
  assert.equal(childInspection.routes[0].workspaceRelativeHandoffPath, loomRoutePath);
  assert(childInspection.endpointRoles.every((item) => item.targetCarrierKind === 'workspace-archive-entry' && item.targetWorkspaceId === 'business'));
  for (const id of ['business', 'docs']) {
    assert.equal(workspaceArchiveSha256(childBundle, childInspection, id), workspaceArchiveSha256(parentBundle, parentInspection, id), `${id} must reuse the exact qualified parent Workspace archive bytes`);
  }
  assert.notEqual(workspaceArchiveSha256(childBundle, childInspection, 'site'), workspaceArchiveSha256(parentBundle, parentInspection, 'site'), 'explicit current Site root must override stale parent Site bytes');
  const childSiteArchive = childInspection.workspaces.find((item) => item.workspaceId === 'site')?.workspaceArchivePath;
  assert(childSiteArchive, 'child Site Workspace archive must be addressable');
  const childSiteFile = childBundle.files.find((file) => file.path === childSiteArchive);
  assert(childSiteFile, 'child Site Workspace archive must be carried');
  const childSiteEntries = await zipBufferToImportEntries(packageFileBytes(childSiteFile), { source: 'package-parent-child-site-workspace', excludeRepositoryInternals: true });
  assert.equal(childSiteEntries.errors.length, 0);
  assert.equal(childSiteEntries.entries.some((entry) => entry.path === 'content/modified-site.txt'), true, 'modified Site bytes must come from the explicit current root');
  const childColdStartLines = [];
  const childColdStartCode = await runPortableCli([
    'qualify-cold-start', childPath,
    '--route', childInspection.routes[0].pointerPath,
    '--pre-takeover', 'minimal-bootstrap-only',
    '--summary',
    '--compact'
  ], { log: (value) => childColdStartLines.push(value), error: (value) => childColdStartLines.push(value) }, { runtimeRoot });
  assert.equal(childColdStartCode, 0, childColdStartLines.join('\n'));
  assert.equal(JSON.parse(childColdStartLines.at(-1)).status, 'preferred-pass');


  const siblingOutputDir = path.join(root, 'package-parent-sibling-output');
  const siblingLines = [];
  const siblingCode = await runPortableCli([
    'manufacture-handoff-package', siteRoot,
    '--handoff', loomRoutePath,
    '--workspace-id', 'site',
    '--workspace-target', 'workspace.workspace.md',
    '--package-parent', packageParentPath,
    '--output-dir', siblingOutputDir,
    '--built-at', '2026-08-23T18:03:00.000Z',
    '--compact'
  ], { log: (value) => siblingLines.push(value), error: (value) => siblingLines.push(value) }, { runtimeRoot });
  assert.equal(siblingCode, 0, siblingLines.join('\n'));
  const siblingCli = JSON.parse(siblingLines.at(-1));
  assert.equal(siblingCli.status, 'ready');
  assert.equal(packageParentCli.carrierLineage.parentDimension, siblingCli.carrierLineage.parentDimension, 'parallel returns must share the same exact parent dimension');
  assert.equal(packageParentCli.carrierLineage.dimension, `${packageParentCli.carrierLineage.parentDimension}-1`);
  assert.equal(siblingCli.carrierLineage.dimension, `${siblingCli.carrierLineage.parentDimension}-2`, 'second return from the same parent must receive the next atomically reserved sibling dimension');
  assert.notEqual(packageParentCli.primaryOutput.path, siblingCli.primaryOutput.path);

  const kodaxPackageParentRoutePath = '.topics/tooling/001-1-1-1-1-2-loom-to-kodax-untargeted-endpoint-role-handoff.trace.md';
  await writeFile(path.join(siteRoot, kodaxPackageParentRoutePath), qualifiedHandoffFixture({
    title: 'Loom to Kodax package-parent untargeted endpoint Role fixture',
    from: 'Loom',
    to: 'Kodax',
    fromReference: 'business::.topics/loom-role.trace.md',
    toReference: 'business::.topics/roles/001-6-kodax-role.trace.md',
    purpose: 'prove an explicit workspace-qualified Role resolves from the complete inherited Business Workspace even when no parent route targeted it',
    createdAt: '2026-08-23 18:01:30'
  }), 'utf8');
  const kodaxOutputDir = path.join(root, 'package-parent-kodax-output');
  const kodaxLines = [];
  const kodaxCode = await runPortableCli([
    'manufacture-handoff-package', siteRoot,
    '--handoff', kodaxPackageParentRoutePath,
    '--workspace-id', 'site',
    '--workspace-target', 'workspace.workspace.md',
    '--package-parent', packageParentPath,
    '--output-dir', kodaxOutputDir,
    '--built-at', '2026-08-23T18:01:30.000Z',
    '--compact'
  ], { log: (value) => kodaxLines.push(value), error: (value) => kodaxLines.push(value) }, { runtimeRoot });
  assert.equal(kodaxCode, 0, kodaxLines.join('\n'));
  const kodaxCli = JSON.parse(kodaxLines.at(-1));
  assert.equal(kodaxCli.status, 'ready');
  const kodaxBundle = await loadNodePortableInput([kodaxCli.primaryOutput.path]);
  const kodaxInspection = inspectRecipientFacingV2Topology(kodaxBundle);
  assert.equal(kodaxInspection.status, 'valid');
  const kodaxToRole = kodaxInspection.endpointRoles.find((item) => item.endpointParty === 'to');
  assert.equal(kodaxToRole?.targetWorkspaceId, 'business');
  assert.equal(kodaxToRole?.targetInnerPath, '.topics/roles/001-6-kodax-role.trace.md');
  assert.equal(kodaxToRole?.targetCarrierKind, 'workspace-archive-entry');

  const missingRoleRoutePath = '.topics/tooling/001-1-1-1-1-3-loom-to-missing-role-handoff.trace.md';
  await writeFile(path.join(siteRoot, missingRoleRoutePath), qualifiedHandoffFixture({
    title: 'Loom to missing Role fail-closed fixture',
    from: 'Loom',
    to: 'Missing',
    fromReference: 'business::.topics/loom-role.trace.md',
    toReference: 'business::.topics/roles/001-999-missing-role.trace.md',
    purpose: 'prove an absent exact workspace-qualified Role target remains unresolved',
    createdAt: '2026-08-23 18:01:40'
  }), 'utf8');
  const missingRoleLines = [];
  const missingRoleCode = await runPortableCli([
    'manufacture-handoff-package', siteRoot,
    '--handoff', missingRoleRoutePath,
    '--workspace-id', 'site',
    '--workspace-target', 'workspace.workspace.md',
    '--package-parent', packageParentPath,
    '--built-at', '2026-08-23T18:01:40.000Z',
    '--compact'
  ], { log: (value) => missingRoleLines.push(value), error: (value) => missingRoleLines.push(value) }, { runtimeRoot });
  assert.equal(missingRoleCode, 2, missingRoleLines.join('\n'));
  const missingRole = JSON.parse(missingRoleLines.at(-1));
  assert.equal(missingRole.status, 'blocked');
  assert.equal(missingRole.findings.some((item) => item.code === 'portable.handoff-material.endpoint-role.unresolved'), true, 'missing exact workspace-qualified endpoint Role must remain fail-closed');

  await assert.rejects(
    prepareNodeHandoffManufacturingInput({
      workspaceRoot: siteRoot,
      workspaceId: 'site',
      handoffPath: '.topics/015-handoff.trace.md',
      additionalWorkspaces: [{ id: 'site', root: docsRoot }],
      runtimeRoot
    }),
    /workspace-id\.duplicate:site/
  );
  await assert.rejects(
    prepareNodeHandoffManufacturingInput({
      workspaceRoot: siteRoot,
      workspaceId: 'site',
      handoffPath: '.topics/015-handoff.trace.md',
      additionalWorkspaces: [{ id: 'missing', root: path.join(root, 'missing') }],
      runtimeRoot
    }),
    /ENOENT|no such file/i
  );
  await assert.rejects(
    prepareNodeHandoffManufacturingInput({
      workspaceRoot: siteRoot,
      workspaceId: 'site',
      handoffPath: '.topics/015-handoff.trace.md',
      additionalWorkspaces: [{ id: 'docs', root: docsRoot, workspaceTargetPath: 'workspace.workspace.md' }],
      handoffRoutes: [{ path: '.topics/015-handoff.trace.md' }],
      runtimeRoot
    }),
    /route\.workspace-id\.required/
  );

  const workspaceJson = path.join(root, 'workspaces.json');
  const routesJson = path.join(root, 'routes.json');
  const cliOutputDir = path.join(root, 'cli-output');
  await writeFile(workspaceJson, `${JSON.stringify({ workspaces: [{ id: 'docs', root: docsRoot, title: 'Docs', workspaceTargetPath: 'workspace.workspace.md' }] }, null, 2)}\n`, 'utf8');
  await writeFile(routesJson, `${JSON.stringify({ routes: [{ workspaceId: 'site', path: '.topics/015-handoff.trace.md' }, { workspaceId: 'docs', path: '.topics/015-handoff.trace.md' }] }, null, 2)}\n`, 'utf8');
  const lines = [];
  const code = await runPortableCli([
    'manufacture-handoff-package', siteRoot,
    '--handoff', '.topics/015-handoff.trace.md',
    '--workspace-id', 'site',
    '--workspace-target', 'workspace.workspace.md',
    '--legacy-recipient-v2-compatibility',
    '--workspace-roots', workspaceJson,
    '--workspace-routes', routesJson,
    '--route', 'handoff-route:docs:.topics/015-handoff.trace.md',
    '--output-dir', cliOutputDir,
    '--built-at', '2026-08-23T18:00:00.000Z',
    '--compact'
  ], { log: (value) => lines.push(value), error: (value) => lines.push(value) }, { runtimeRoot });
  assert.equal(code, 0);
  const cli = JSON.parse(lines.at(-1));
  assert.equal(cli.status, 'ready');
  assert.deepEqual(cli.planSummary.workspaces.map((item) => item.id), ['site', 'docs']);
  assert.equal(cli.carrierProjection.routes.length, 2);
  assert.equal((await readFile(cli.primaryOutput.path)).byteLength > 0, true);

  const legacyInput = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: siteRoot,
    workspaceId: 'site',
    workspaceTargetPath: 'workspace.workspace.md',
    handoffPath: '.topics/015-handoff.trace.md',
    handoffRoutes: ['.topics/015-handoff.trace.md'],
    toolingBootstrap: 'embedded',
    runtimeRoot
  });
  assert.equal(legacyInput.workspaceMaterializations.length, 1);
  assert.deepEqual(legacyInput.transportRoutes[0], { workspaceId: 'site', path: '.topics/015-handoff.trace.md' });
  const legacy = manufactureRecipientRelativeHandoffPackage(legacyInput, { legacyRecipientV2Compatibility: true, packageInput: { builtAt: '2026-08-23T18:00:00.000Z' } });
  assert.equal(legacy.status, 'ready');
  assert.equal(legacy.carrierProjection.routes[0].workspaceId, 'site');
} finally {
  await rm(root, { recursive: true, force: true });
}

function workspaceArchiveSha256(bundle, inspection, workspaceId) {
  const archivePath = inspection.workspaces.find((item) => item.workspaceId === workspaceId)?.workspaceArchivePath;
  assert(archivePath, `${workspaceId} Workspace archive path must resolve`);
  const file = bundle.files.find((item) => item.path === archivePath);
  assert(file, `${workspaceId} Workspace archive bytes must resolve`);
  return sha256Hex(packageFileBytes(file));
}

async function makeWorkspace(rootPath, title, to, contextName, bytes) {
  await mkdir(path.join(rootPath, '.topics'), { recursive: true });
  await mkdir(path.join(rootPath, 'content'), { recursive: true });
  await writeFile(path.join(rootPath, 'package.json'), `${JSON.stringify({ name: `tiinex-${title.toLowerCase()}-fixture`, type: 'module' })}\n`, 'utf8');
  await writeFile(path.join(rootPath, 'workspace.workspace.md'), workspaceMarkdown(title), 'utf8');
  await writeFile(path.join(rootPath, '.topics', contextName), `# ${title} context\n`, 'utf8');
  await writeFile(path.join(rootPath, '.topics', '015-handoff.trace.md'), handoffMarkdown(title, to, contextName), 'utf8');
  await writeFile(path.join(rootPath, 'content', 'blob.bin'), Uint8Array.from(bytes));
}
function workspaceMarkdown(title) {
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.workspace.v1
  - Created At: 2026-08-23 17:59:00
  - Authors: Fixture
  - Why: Qualify the exact ${title} Workspace carried by the multi-root regression.
  - Summary: ${title} multi-root fixture Workspace.
  - Status: active/local

---

# ${title} Multi-root Fixture Workspace

Bounded fixture Workspace.

# Continuity Integrity

- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})
  - Towards: self
  - Value: `;
  const sealed = sealC14nV2Self(unsigned);
  assert.equal(sealed.state, 'sealed');
  return `${sealed.markdown}\n`;
}
function handoffMarkdown(title, to, contextName) {
  return qualifiedHandoffFixture({
    title: `${title} handoff`,
    to,
    purpose: 'multi-root fixture',
    createdAt: '2026-08-23 18:00:00',
    requiredContext: `- local-context
  - Material: exact context
  - Material Reference: [Context](${contextName})
  - Purpose: route-local context
  - Availability: available`
  });
}
function roleMarkdown(label) {
  return `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.party.role.v1
  - Created At: 2026-08-23 18:01:00

---

# ${label}

## Role Identity

- Role Label: ${label}
- Role Kind: bounded endpoint role

## Role Boundary

- In Scope: exact endpoint grounding
- Out Of Scope: holder identity inference

## Authority And Responsibility Boundary

- May Do: participate within declared endpoint boundary
- Does Not Authorize: transport identity inference

## Holder Relationship

- Holder State: unproven

## Interpretation Limits

- Does Not Prove: holder identity
- Must Not Be Treated As: package authority

# Continuity Integrity
`;
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

console.log('✓ Tooling 015 operator-supplied multi-root manufacturing and one-root compatibility passed');
