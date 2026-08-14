import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const poc = readFileSync(new URL('../../.old/app.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app/TiinexApp.jsx', import.meta.url), 'utf8');
const phase = readFileSync(new URL('../app/startupRenderPhase.js', import.meta.url), 'utf8');

const oldStartup = /Promise\.resolve\(\)[\s\S]*?\.then\(\(\) => loadViewerConfig\(\)\)[\s\S]*?\.then\(\(\) => bootFromUrlOnce\(\)\)[\s\S]*?maybeOfferLocalStateRestore[\s\S]*?\.then\(\(\) => \{\s*render\(\)/.test(poc);
assert(oldStartup, 'PoC evidence must keep config → route boot → local restore → render startup ordering visible');
assert(phase.includes("if (!hash.startsWith('#state=')) return 'resolving';"), 'clean startup must be unresolved before product render');
assert(phase.includes("return routeResolved ? 'resolved' : 'resolving';"), 'explicit route startup must become renderable only after persistence actually resolves route ownership');
assert(app.includes("if (!shouldRenderProductStage(startupPhase)) return null;"), 'React product stage must be withheld while startup ownership is unresolved');
assert(app.indexOf("if (!shouldRenderProductStage(startupPhase)) return null;") < app.indexOf('return (\n    <main'), 'startup render gate must execute before product main/EmptyStage render');

console.log('✓ PoC M1 startup render sequencing evidence passed');
