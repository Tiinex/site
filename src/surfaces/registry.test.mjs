import assert from 'node:assert/strict';
import { SurfaceImplementationStatus, SurfaceTruthBoundary, defineSurface, isSurfaceReady, isSurfaceScaffold } from './contracts.js';
import { listSurfaceFindings, resolveSurfaceDescriptor, surfaceLabels, surfaceRegistry } from './registry.js';

assert.equal(surfaceRegistry.schema, 'tiinex.surface.registry.v1');
assert(surfaceRegistry.counts.total >= 8, 'surface registry should cover declared surfaces');
assert(surfaceRegistry.counts.partial >= 4, 'Feed/Tree/Lineage/Audit should be explicitly partial, not scaffold-hidden');
assert(surfaceRegistry.counts.scaffold >= 1, 'unfinished surfaces must remain scaffolded');
assert.equal(surfaceRegistry.counts.parity, 0, 'no surface should claim full parity before browser/PoC closure evidence');

const feed = resolveSurfaceDescriptor('feed');
assert.equal(feed.status, SurfaceImplementationStatus.partial, 'feed should be partial rather than scaffold or parity');
assert(feed.boundary.includes(SurfaceTruthBoundary.noTruthMutation), 'feed must be projection-only/no truth mutation');
assert.equal(isSurfaceReady(feed), true);

const share = resolveSurfaceDescriptor('share');
assert.equal(share.status, SurfaceImplementationStatus.scaffold, 'share must remain scaffold until session/share/export UX is truth-complete');
assert.equal(isSurfaceScaffold(share), true);
assert(share.boundary.includes(SurfaceTruthBoundary.commandRequired), 'share requires explicit command/export path');

const visibleReady = surfaceLabels({ includeScaffold: false }).map((surface) => surface.id);
assert(visibleReady.includes('feed') && visibleReady.includes('tree'), 'ready surface list should include partial surfaces');
assert(!visibleReady.includes('share'), 'ready surface list must not include scaffold share surface');

const findings = listSurfaceFindings();
assert(findings.some((finding) => finding.code === 'surface.status.scaffold' && finding.surfaceId === 'share'), 'scaffold surfaces should emit informational findings');
assert(!findings.some((finding) => finding.severity === 'error'), 'registry should not contain boundary errors');

const adHoc = defineSurface({ id: 'custom' });
assert.equal(adHoc.status, SurfaceImplementationStatus.scaffold, 'undefined status defaults to scaffold');
assert(adHoc.boundary.includes(SurfaceTruthBoundary.noTruthMutation), 'default surface boundary is non-mutating');

console.log('surface.registry: ok');
