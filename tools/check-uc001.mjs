#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/, '');
const failures = [];
const main = readFileSync(join(root, 'src/main.js'), 'utf8');
const css = readFileSync(join(root, 'src/styles/app.css'), 'utf8');
const index = readFileSync(join(root, 'index.html'), 'utf8');
const icons = readFileSync(join(root, 'src/ui/icon.paths.js'), 'utf8');
const config = readFileSync(join(root, 'src/workspaces/workspace.config.js'), 'utf8');
const lifecycle = readFileSync(join(root, 'src/workspaces/workspace.lifecycle.js'), 'utf8');
const persistence = readFileSync(join(root, 'src/workspaces/workspace.persistence.js'), 'utf8');
function has(text, needle, label = needle) { if (!text.includes(needle)) failures.push(label); }
function lacks(text, needle, label = needle) { if (text.includes(needle)) failures.push(label); }

has(index, './src/ui/icon.paths.js', 'index must load icon vocabulary before main');
has(index, './src/workspaces/workspace.config.js', 'index must load workspace config before lifecycle/main');
has(index, './src/workspaces/workspace.lifecycle.js', 'index must load workspace lifecycle before main');
has(index, './src/workspaces/workspace.route.js', 'index must load workspace route before main');
has(index, './src/workspaces/workspace.persistence.js', 'index must load workspace persistence before main');
has(icons, 'multiverse', 'icon vocabulary must include multiverse switch icon');
has(config, 'parseWorkspaceConfig', '.workspace.md config parser missing');
has(config, 'schemaOrigins', '.workspace.md schema origin parser missing');
has(config, 'workspaceEntrypoints', '.workspace.md entrypoint parser missing');
has(config, 'repositoryMirrors', '.workspace.md mirror parser missing');
has(config, 'repositoryTransports', '.workspace.md transport parser missing');
has(config, 'Every handoff starts somewhere', 'default empty-stage subtitle missing from config');
has(lifecycle, 'createWorkspace', 'workspace lifecycle must own createWorkspace');
has(lifecycle, 'closeWorkspace', 'workspace lifecycle must own closeWorkspace');
has(lifecycle, 'no source files or GitHub provenance inferred', 'workspace creation must preserve no-GitHub boundary');
has(readFileSync(join(root, 'src/workspaces/workspace.route.js'), 'utf8'), 'makeRouteState', 'workspace route module must own URL view state shape');
has(persistence, 'HASH_PREFIX', 'workspace persistence must own URL hash state');
has(persistence, 'localStorage', 'workspace persistence must cache state in local storage');
has(main, 'tx-empty-stage', 'quiet empty stage missing');
has(main, 'TiinexWorkspaceConfig', 'empty stage must be driven by workspace config parser');
has(main, 'tx-multiverse-switch', 'multiverse switch affordance missing left of logo');
has(main, 'data-multiverse', 'multiverse switch must open a real dialog');
has(main, 'data-help', 'help button must open parsed workspace help');
has(main, 'data-share', 'share button must open share behavior');
has(main, 'tx-centered-dock-core', 'empty dock must center the logo');
has(main, 'const showPager = hasWorkspace && state.workspaces.length > 1', 'global dock pager arrows should be conditional, not always-on');
has(main, 'data-home', 'center logo must route home like legacy viewer brand');
has(main, 'data-create-workspace', 'create workspace affordance missing');
has(main, 'tx-action-button tx-legacy-action', 'created workspace actions must use legacy-styled command buttons');
has(main, 'create-workspace-form', 'create workspace form missing');
has(main, 'workspace.name.required', 'workspace name validation missing');
has(main, 'data-close-workspace', 'close workspace command missing');
has(main, 'data-confirm-close', 'close confirmation missing');
has(main, 'does not delete source files', 'close confirmation must disclose non-destructive semantics');
has(main, 'persistence.writeState', 'workspace mutations must persist to hash/local cache');
has(main, 'persistence.clearState', 'closing last workspace must clean empty URL/storage state');
has(css, '.tx-dialog-backdrop', 'desktop/mobile dialog shell CSS missing');
has(css, '.tx-shell-v111-workspace-fit .tx-action-button', 'created workspace action CSS missing');
has(css, '@media (max-width: 640px)', 'mobile create/close sheet CSS missing');
lacks(main, 'Create your first workspace', 'empty startup must not use onboarding card copy');
lacks(main, 'tx-empty-card', 'empty startup must not use large onboarding card');
lacks(main, 'demoArtifacts', 'v109 UC-001 must not boot from demo fixture artifacts');
lacks(main, 'renderMapVerse', 'Map must stay frozen during Column happy path');

for (const test of ['src/ui/icon.paths.test.mjs', 'src/schemas/origins.test.mjs', 'src/workspaces/workspace.config.test.mjs', 'src/workspaces/workspace.lifecycle.test.mjs', 'src/workspaces/workspace.route.test.mjs', 'src/workspaces/workspace.persistence.test.mjs']) {
  const result = spawnSync(process.execPath, [join(root, test)], { encoding: 'utf8' });
  if (result.status !== 0) failures.push(`${test} failed:\n${result.stdout}\n${result.stderr}`);
}

if (failures.length) {
  console.error(failures.map((failure) => `- ${failure}`).join('\n'));
  process.exit(1);
}
console.log('✓ UC-001 workspace create/restore/close guards passed');
