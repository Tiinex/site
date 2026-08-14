import { readFileSync } from 'node:fs';
import { initialStartupRenderPhase, shouldRenderProductStage } from './startupRenderPhase.js';

if (initialStartupRenderPhase({ locationLike: { hash: '' }, routeResolved: false }) !== 'resolving') throw new Error('clean/default startup must begin unresolved so genuine EmptyStage cannot flash before ownership resolution');
if (initialStartupRenderPhase({ locationLike: { hash: '#state=abc' }, routeResolved: true }) !== 'resolved') throw new Error('successfully decoded explicit route state is a resolved startup owner');
if (initialStartupRenderPhase({ locationLike: { hash: '#state=%%%invalid%%%' }, routeResolved: false }) !== 'resolving') throw new Error('malformed/unusable route hash must not masquerade as resolved startup ownership');
if (shouldRenderProductStage('resolving')) throw new Error('product stage must remain gated while startup ownership is resolving');
if (!shouldRenderProductStage('resolved')) throw new Error('resolved startup must render product stage');
if (!shouldRenderProductStage('failed')) throw new Error('failed startup may render a truthful failure surface');
console.log('✓ startup render phase tests passed');

const appSource = readFileSync(new URL('./TiinexApp.jsx', import.meta.url), 'utf8');
const runtimeSource = readFileSync(new URL('./runtimeState.js', import.meta.url), 'utf8');
assertWired(appSource.includes('initialRuntimeSnapshot()'), 'TiinexApp must read route resolution and initial product state as one startup snapshot');
assertWired(appSource.includes('routeResolved: initialRuntimeRef.current.routeResolved'), 'initial render phase must be coupled to semantic persistence route resolution');
assertWired(appSource.includes('persistence?.resolveInitialState?.'), 'popstate/hashchange must use the same semantic route-resolution contract as mount');
assertWired(runtimeSource.includes('persistence?.resolveInitialState?.'), 'initialRuntimeSnapshot must use semantic route resolution rather than Boolean(decoded JSON)');
function assertWired(value, message) { if (!value) throw new Error(message); }
