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
has(main, 'tx-shell-legibility-corrected', 'default shell must opt into legibility correction class');
has(main, 'tx-shell-column-action-parity', 'default shell must opt into old action rhythm parity class');
has(main, 'tx-focused-main-window', 'default shell must render one focused Tiinex window');
has(main, 'tx-legacy-global-dock', 'global dock must remain a recognizable Tiinex landmark');
has(main, 'tx-legacy-source-strip', 'source strip must remain above mode row');
has(main, 'tx-legacy-main-mode', 'mode row must remain a primary landmark');
has(main, 'renderUniverseColumn(activePane)', 'Universe default should render one active pane, not the full multiverse dashboard');
has(main, "activePane: 'site'", 'default pane must be Tiinex/site so legacy Documentation/Start cards are visible');
has(main, 'Documentation', 'default continuity baseline should include Documentation card');
has(main, 'Start', 'default continuity baseline should include Start card');
has(main, 'tx-legacy-artifact-card', 'artifact cards must use legacy card skeleton');
has(main, 'tx-legacy-card-badges', 'artifact cards must preserve badges-before-title rhythm');
has(main, 'tx-legacy-card-body', 'artifact cards must preserve title/subtitle body rhythm');
has(main, 'tx-legacy-action-row', 'artifact cards must preserve bottom action row');
has(main, 'tx-labeled-action', 'old primary actions such as Continue/Reference/Open/Merge must stay text-labeled');
has(main, 'Continue', 'artifact action rhythm should include Continue');
has(main, 'Reference', 'artifact action rhythm should include Reference');
has(main, 'Merge', 'artifact action rhythm should include Merge');
has(main, 'tx-legacy-secondary-drawer', 'diagnostics should be behind secondary disclosure');
has(css, '.tx-shell-pattern-parity', 'pattern parity CSS contract missing');
has(css, '.tx-focused-main-window', 'focused window CSS missing');

has(main, 'tx-shell-scroll-owned', 'default shell must opt into scroll ownership class');
has(main, 'tx-shell-column-fit', 'default shell must opt into v103 Column fit class');
has(main, 'tx-shell-icon-polish', 'default shell must opt into v103 icon polish class');
has(css, '.tx-shell-column-fit', 'Column fit CSS contract missing');
has(css, '.tx-shell-icon-polish', 'icon polish CSS contract missing');

has(main, 'tx-shell-audit-status-parity', 'default shell must opt into v103 audit/status parity class');
has(main, 'audit-banner', 'default shell must expose compact audit banner host');
has(main, 'lineage-terminal', 'default Column must expose compact lineage terminal row');
has(main, 'Lineage root reached.', 'default Column must preserve old terminal lineage status row');
has(css, '.tx-shell-audit-status-parity', 'audit/status parity CSS contract missing');
has(css, '.tx-lineage-terminal', 'compact lineage terminal CSS missing');
has(css, '.tx-audit-status-banner', 'compact audit banner CSS missing');
has(css, 'grid-auto-rows: max-content', 'reader-state badges must not stretch into tall grid rows');
has(css, 'overscroll-behavior: contain', 'pane-local scroll should be contained');
has(css, '.tx-shell-scroll-owned', 'scroll ownership CSS contract missing');
has(css, '.tx-shell-scroll-owned .tx-focused-grid .tx-column-feed', 'column feed must own pane-local scrolling');
has(css, 'overflow: auto', 'active column feed should own overflow instead of page scroll');

has(css, '.tx-focused-grid .tx-column-header', 'column dashboard chrome must be hidden in focused default');
has(css, '.tx-shell-focused-window .tx-legacy-secondary-drawer', 'secondary diagnostics must not dominate default view');
lacks(main, 'Node Graph Verse', 'stale Node Graph Verse must not appear in runtime UI');
lacks(main, 'Zoomable Multiverse', 'stale Zoomable Multiverse must not appear in runtime UI');
lacks(main, 'renderMapVerse', 'Map runtime must stay frozen until Column happy path is stable');
lacks(main, 'data-pane-verse="map"', 'Map must not be a primary workspace verse control in v103');
has(css, '.tx-shell-legibility-corrected', 'legibility correction CSS missing');
has(css, '.tx-shell-column-action-parity', 'Column action parity CSS missing');
has(css, 'font-weight: 640', 'title typography should stay softer than bold-white');

if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log('✓ UI shape guards passed');
