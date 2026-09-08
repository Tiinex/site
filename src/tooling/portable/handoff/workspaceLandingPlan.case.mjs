import assert from 'node:assert/strict';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { prepareNodeHandoffManufacturingInput } from '../adapters/node/handoff.manufacture.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';
import { manufactureRecipientRelativeHandoffPackage } from './manufacture.js';
import { qualifiedHandoffFixture } from './qualifiedHandoffFixture.js';
import { recipientFacingV2PackageZipBuffer } from '../output/recipientV2.zip.js';
import { projectPortableWorkspaceLandingPlan } from './workspaceLandingPlan.js';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from '../../../integrity/integrity.methodReference.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-workspace-landing-'));
try {
  const siteRoot = path.join(root, 'site');
  const vscodeRoot = path.join(root, 'vscode');
  const runtimeRoot = path.join(root, 'runtime');
  await makeWorkspace(siteRoot, 'Site', 'Tiinex/site', 'refactor', true);
  await makeWorkspace(vscodeRoot, 'VS Code', 'Tiinex/vscode', 'master', false);
  await makeRuntime(runtimeRoot);
  const input = await prepareNodeHandoffManufacturingInput({
    workspaceRoot: siteRoot,
    workspaceId: 'site',
    workspaceTargetPath: '.topics/.workspaces/tiinex-site.workspace.md',
    handoffPath: '.topics/001-handoff.trace.md',
    additionalWorkspaces: [{ id: 'vscode', root: vscodeRoot, workspaceTargetPath: '.topics/.workspaces/tiinex-vscode.workspace.md' }],
    toolingBootstrap: 'embedded',
    runtimeRoot,
    verifyRoundtrip: true
  });
  const manufactured = manufactureRecipientRelativeHandoffPackage(input, { legacyRecipientV2Compatibility: true, verifyRoundtrip: true, packageInput: { builtAt: '2026-09-06T12:00:00.000Z' } });
  assert.equal(manufactured.status, 'ready', JSON.stringify(manufactured.findings, null, 2));

  const repos = [
    { id: 'local-site', root: '/repos/site', repository: 'git@github.com:Tiinex/site.git', branch: 'refactor', clean: true },
    { id: 'local-vscode', root: '/repos/vscode', repository: 'https://github.com/Tiinex/vscode.git', branch: 'master', clean: true }
  ];
  const ready = projectPortableWorkspaceLandingPlan({ ...manufactured.bundle, repositories: repos });
  assert.equal(ready.status, 'ready', JSON.stringify(ready.findings, null, 2));
  assert.deepEqual(ready.affected.map((item) => item.workspaceId).sort(), ['site', 'vscode']);
  assert.equal(ready.confirmation.required, true);
  assert.match(ready.confirmation.statement, /preserve \.git and unrelated ignored local material; do not commit or push/i);
  assert.equal(ready.operationBoundary.sourceMutation, false);
  assert.equal(ready.operationBoundary.push, false);
  assert.equal(ready.workspaces.find((item) => item.workspaceId === 'site').archivePackagePath.length > 0, true);

  const dirty = projectPortableWorkspaceLandingPlan({ ...manufactured.bundle, repositories: repos.map((item) => item.id === 'local-vscode' ? { ...item, clean: false } : item) });
  assert.equal(dirty.status, 'blocked');
  assert(dirty.findings.some((item) => item.code === 'portable.workspace-landing.local-repository-dirty'));

  const duplicate = projectPortableWorkspaceLandingPlan({ ...manufactured.bundle, repositories: [...repos, { ...repos[0], id: 'second-site', root: '/repos/site-2' }] });
  assert.equal(duplicate.status, 'blocked');
  assert(duplicate.findings.some((item) => item.code === 'portable.workspace-landing.local-repository-ambiguous'));

  const selected = projectPortableWorkspaceLandingPlan({ ...manufactured.bundle, repositories: [...repos, { ...repos[0], id: 'second-site', root: '/repos/site-2' }], selections: { site: 'second-site' } });
  assert.equal(selected.status, 'ready', JSON.stringify(selected.findings, null, 2));
  assert.equal(selected.affected.find((item) => item.workspaceId === 'site').repository.id, 'second-site');

  const wrongBranch = projectPortableWorkspaceLandingPlan({ ...manufactured.bundle, repositories: repos.map((item) => item.id === 'local-site' ? { ...item, branch: 'master' } : item) });
  assert.equal(wrongBranch.status, 'blocked');
  assert(wrongBranch.findings.some((item) => item.code === 'portable.workspace-landing.ref-branch-mismatch'));

  const onlySite = projectPortableWorkspaceLandingPlan({ ...manufactured.bundle, repositories: [repos[0]], workspaceIds: ['site'] });
  assert.equal(onlySite.status, 'ready');
  assert.deepEqual(onlySite.affected.map((item) => item.workspaceId), ['site']);

  const explicitMissing = projectPortableWorkspaceLandingPlan({ ...manufactured.bundle, repositories: [repos[0]], workspaceIds: ['vscode'] });
  assert.equal(explicitMissing.status, 'blocked');
  assert(explicitMissing.findings.some((item) => item.code === 'portable.workspace-landing.local-repository-unmatched'));

  const packagePath = path.join(root, 'carrier.zip');
  const repositoriesPath = path.join(root, 'repositories.json');
  await writeFile(packagePath, recipientFacingV2PackageZipBuffer(manufactured.bundle, { inspection: manufactured.inspection }));
  await writeFile(repositoriesPath, `${JSON.stringify({ repositories: repos }, null, 2)}\n`, 'utf8');
  const lines = [];
  const code = await runPortableCli(['project-workspace-landing', packagePath, '--repositories', repositoriesPath, '--compact'], { log: (value) => lines.push(value), error: (value) => lines.push(value) }, { runtimeRoot });
  assert.equal(code, 0, lines.join('\n'));
  const cli = JSON.parse(lines.at(-1));
  assert.equal(cli.operation, 'project-workspace-landing');
  assert.equal(cli.status, 'ready');
  assert.deepEqual(cli.affected.map((item) => item.workspaceId).sort(), ['site', 'vscode']);
} finally {
  await rm(root, { recursive: true, force: true });
}

async function makeWorkspace(rootPath, title, repository, ref, withHandoff) {
  await mkdir(path.join(rootPath, '.topics', '.workspaces'), { recursive: true });
  await mkdir(path.join(rootPath, '.topics'), { recursive: true });
  await writeFile(path.join(rootPath, '.topics', '.workspaces', `tiinex-${title === 'VS Code' ? 'vscode' : 'site'}.workspace.md`), workspaceMarkdown(title, repository, ref), 'utf8');
  await writeFile(path.join(rootPath, 'README.md'), `# ${title}\n`, 'utf8');
  if (withHandoff) await writeFile(path.join(rootPath, '.topics', '001-handoff.trace.md'), qualifiedHandoffFixture({ title: 'Landing plan fixture', purpose: 'qualify landing plan fixture', createdAt: '2026-09-06 12:00:00' }), 'utf8');
}

function workspaceMarkdown(title, repository, ref) {
  const unsigned = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.workspace.v1
  - Created At: 2026-09-06 11:59:00
  - Authors: Fixture
  - Why: Qualify the ${title} Workspace for landing-plan regression.
  - Summary: ${title} landing-plan fixture Workspace.
  - Status: active/local

---

# ${title}

## Workspace Entrypoints

### ${title} source

- Source Kind: github-tree
- Repository: ${repository}
- Ref: ${ref}
- Root Path: .
- Repo Files Discovery: on

# Continuity Integrity

- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})
  - Towards: self
  - Value: `;
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

console.log('✓ Major 012 qualified Workspace landing-plan projection passed');
