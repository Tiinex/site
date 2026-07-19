#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/, '');
const main = readFileSync(join(root, 'src/main.js'), 'utf8');
const css = readFileSync(join(root, 'src/styles/app.css'), 'utf8');
const sourcePresenter = readFileSync(join(root, 'src/sources/source.presenter.js'), 'utf8');
const failures = [];
const has = (text, needle, label = needle) => { if (!text.includes(needle)) failures.push(label); };
const lacks = (text, needle, label = needle) => { if (text.includes(needle)) failures.push(label); };

has(main, 'tx-focused-main-window', 'workspace state must render one focused Tiinex window');
has(main, 'tx-legacy-global-dock', 'global dock must remain a recognizable Tiinex landmark');
has(main, 'tx-centered-dock-core', 'global dock must keep logo-centered layout');
has(main, 'tx-dock-left', 'create and multiverse controls must live left of centered logo');
has(main, 'tx-dock-right', 'share/help controls must live right of centered logo');
has(sourcePresenter, 'tx-legacy-source-strip', 'source strip must remain above mode row');
has(main, 'tx-legacy-main-mode', 'mode row must remain a primary landmark when workspace exists');
has(main, 'tx-empty-stage', 'empty start must be a quiet stage, not an onboarding card');
has(main, 'tx-shell-config-grounded', 'empty start must be grounded from .workspace.md config');
has(main, 'tx-uc001-empty-stage-parity', 'empty start must opt into old empty-stage parity');
has(main, 'tx-multiverse-switch', 'global dock must expose multiverse switch left of logo');
has(main, 'data-home', 'center logo must act as home route control');
has(main, 'tx-logo-home', 'center logo must be styled as a route command');
has(main, 'tx-shell-route-grounded', 'shell must disclose route-grounded behavior');
has(main, 'tx-shell-v111-workspace-fit', 'fitted workspace chrome must remain active');
has(main, 'tx-shell-v113-action-clarity', 'shell must opt into v113 action clarity review fixes');
has(main, 'const showPager = hasWorkspace && state.workspaces.length > 1', 'workspace pager arrows must only render when multiple workspaces exist');
has(main, 'tx-uc001-created-workspace', 'created workspace must render inside Column');
has(main, 'tx-legacy-artifact-card', 'workspace cards must keep legacy card skeleton');
has(main, 'tx-legacy-action-row', 'cards must keep bottom action row');
has(main, 'tx-labeled-action', 'primary card actions must remain text-labeled');
has(main, 'Lineage root reached.', 'Lineage root trailing card text must remain available in Tree mode');
has(main, 'tx-shell-scroll-owned', 'default shell must opt into scroll ownership class');
has(main, 'tx-shell-command-portable', 'default shell must opt into command portability contract');
has(main, 'tx-svg-icon', 'action icons must use unified inline SVG icon system');
has(css, '.tx-uc001-shell', 'UC-001 CSS contract missing');
has(css, '.tx-empty-stage', 'quiet empty stage CSS missing');
has(css, '.tx-empty-stage-mode', 'empty stage mode CSS missing');
has(css, '.tx-shell-config-grounded.tx-empty-stage-mode', 'empty stage must own full viewport width');
has(css, '--tx-dock-side: clamp(124px, 15vw, 148px)', 'fitted dock side contract missing');
has(css, '.tx-dialog', 'create/close dialog CSS missing');
has(css, 'overflow: hidden', 'page/multiverse scroll ownership must be explicit');
has(css, 'overscroll-behavior: contain', 'pane-local scroll should be contained');
has(css, '.tx-shell-v111-workspace-fit .tx-action-button', 'created workspace actions must be styled, not native buttons');
has(css, '.tx-shell-v113-action-clarity .tx-workspace-ready-card', 'v113 action clarity CSS missing');
lacks(main, 'data-verse="map"', 'Map must not be a primary workspace verse control');
lacks(main, 'Node Graph Verse', 'stale Node Graph Verse must not appear in runtime UI');
lacks(main, 'tx-empty-card', 'empty start must not render large card');
lacks(main, 'Create your first workspace', 'empty start must not use onboarding-card copy');
lacks(main, 'demoArtifacts', 'default should not be fixture-owned in UC-001');
lacks(main, "actionButton('lineage', 'Continue'", 'empty workspace must not expose continuation before that use-case exists');
lacks(main, "actionButton('merge', 'Merge'", 'local/session record cards must not expose merge before source-bound use-case exists');

if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log('✓ UI shape guards passed');
