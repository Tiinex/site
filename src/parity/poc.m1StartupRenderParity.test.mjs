import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const poc = readFileSync(new URL('../../.old/app.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../app/TiinexApp.jsx', import.meta.url), 'utf8');
const phase = readFileSync(new URL('../app/startupRenderPhase.js', import.meta.url), 'utf8');
const presentation = readFileSync(new URL('../app/startupPresentation.js', import.meta.url), 'utf8');

const oldStartup = /Promise\.resolve\(\)[\s\S]*?\.then\(\(\) => loadViewerConfig\(\)\)[\s\S]*?\.then\(\(\) => bootFromUrlOnce\(\)\)[\s\S]*?maybeOfferLocalStateRestore[\s\S]*?\.then\(\(\) => \{\s*render\(\)/.test(poc);
assert(oldStartup, 'PoC evidence must keep config → route boot → local restore → render startup ordering visible');
assert(phase.includes("if (!hash.startsWith('#state=')) return 'resolving';"), 'clean startup must be unresolved before product render');
assert(phase.includes("return routeResolved ? 'resolved' : 'resolving';"), 'explicit route startup must become renderable only after persistence actually resolves route ownership');
assert(app.includes("if (!shouldRenderProductStage(startupPhase)) return <StartupStage"), 'React product stage must stay withheld while a dedicated resolving presentation remains visible');
assert(app.indexOf("if (!shouldRenderProductStage(startupPhase)) return <StartupStage") < app.indexOf('return (\n    <main'), 'startup resolving gate must execute before product main/EmptyStage render');
assert(presentation.includes("ownedMessage || 'Opening workspace'"), 'resolving presentation must remain generic until an owned workspace exposes truthful progress');

console.log('✓ PoC M1 startup render sequencing evidence passed');
