import assert from 'node:assert/strict';
import fs from 'node:fs';

const app = fs.readFileSync(new URL('./TiinexApp.jsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles/app.css', import.meta.url), 'utf8');

assert.match(app, /'tx-shell-footer-row-owned'/, 'active React shell must opt into row-owned footer layout');
const marker = '/* v450: the active React shell owns the footer as a real grid row.';
const start = css.lastIndexOf(marker);
assert.ok(start >= 0, 'v450 footer ownership block must exist');
const block = css.slice(start);
assert.match(block, /grid-template-rows:\s*auto minmax\(0, 1fr\) auto/, 'shell must reserve a real content row and footer row');
assert.match(block, /> \.tx-footer\s*\{[\s\S]*?position:\s*static/, 'active footer must not be fixed/overlayed');
assert.match(block, /> \.tx-workspace-single-stage,[\s\S]*?grid-row:\s*2;\s*min-height:\s*0/, 'workspace stage must own the bounded middle row');
assert.match(block, /@media \(max-width: 760px\)[\s\S]*?tx-shell-footer-row-owned[^}]*padding-bottom:\s*0/, 'mobile must not reintroduce synthetic footer compensation');
console.log('workspaceShellFooterLayout tests passed');
