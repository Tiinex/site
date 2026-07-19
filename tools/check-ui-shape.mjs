#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/, '');
const main = readFileSync(join(root, 'src/main.js'), 'utf8');
const css = readFileSync(join(root, 'src/styles/app.css'), 'utf8');
const failures = [];
const has = (text, needle, label = needle) => { if (!text.includes(needle)) failures.push(label); };
const lacks = (text, needle, label = needle) => { if (text.includes(needle)) failures.push(label); };

has(main, 'tx-shell-pattern-parity', 'default shell must opt into pattern parity class');
has(main, 'tx-focused-main-window', 'default shell must render one focused Tiinex window');
has(main, 'tx-legacy-global-dock', 'global dock must remain a recognizable Tiinex landmark');
has(main, 'tx-legacy-source-strip', 'source strip must remain above mode row');
has(main, 'tx-legacy-main-mode', 'mode row must remain a primary landmark');
has(main, 'renderUniverseColumn(activePane)', 'Universe default should render one active pane, not the full multiverse dashboard');
has(main, 'Documentation', 'default continuity baseline should include Documentation card');
has(main, 'Start', 'default continuity baseline should include Start card');
has(main, 'tx-legacy-artifact-card', 'artifact cards must use legacy card skeleton');
has(main, 'tx-legacy-card-badges', 'artifact cards must preserve badges-before-title rhythm');
has(main, 'tx-legacy-card-body', 'artifact cards must preserve title/subtitle body rhythm');
has(main, 'tx-legacy-action-row', 'artifact cards must preserve bottom action row');
has(main, 'tx-legacy-secondary-drawer', 'diagnostics should be behind secondary disclosure');
has(css, '.tx-shell-pattern-parity', 'pattern parity CSS contract missing');
has(css, '.tx-focused-main-window', 'focused window CSS missing');
has(css, '.tx-focused-grid .tx-column-header', 'column dashboard chrome must be hidden in focused default');
has(css, '.tx-shell-focused-window .tx-legacy-secondary-drawer', 'secondary diagnostics must not dominate default view');
lacks(main, 'Node Graph Verse', 'stale Node Graph Verse must not appear in runtime UI');
lacks(main, 'Zoomable Multiverse', 'stale Zoomable Multiverse must not appear in runtime UI');

if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log('✓ UI shape guards passed');
