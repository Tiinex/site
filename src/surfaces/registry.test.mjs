import assert from 'node:assert/strict';
import { SurfaceImplementationStatus, SurfaceTruthBoundary, defineSurface, isSurfaceReady, isSurfaceScaffold } from './contracts.js';
import { listSurfaceFindings, resolveSurfaceDescriptor, surfaceLabels, surfaceRegistry } from './registry.js';

assert.equal(surfaceRegistry.schema, 'tiinex.surface.registry.v1');
assert(surfaceRegistry.counts.total >= 8, 'surface registry should cover declared surfaces');
assert.equal(surfaceRegistry.counts.partial, 11, 'all eleven registered surfaces have a real usable product path and must be explicit partials');
assert.equal(surfaceRegistry.counts.scaffold, 0, 'no implemented product path should remain mislabeled as scaffold');
assert.equal(surfaceRegistry.counts.unavailable, 0, 'registered current product surfaces are available at least partially');
assert.equal(surfaceRegistry.counts.parity, 0, 'no surface should claim full parity before browser/PoC closure evidence');

const feed = resolveSurfaceDescriptor('feed');
assert.equal(feed.status, SurfaceImplementationStatus.partial, 'feed should be partial rather than scaffold or parity');
assert(feed.boundary.includes(SurfaceTruthBoundary.noTruthMutation), 'feed must be projection-only/no truth mutation');
assert.equal(isSurfaceReady(feed), true);

const share = resolveSurfaceDescriptor('share');
assert.equal(share.status, SurfaceImplementationStatus.partial, 'share has a real reconstructive product action but is not final parity');
assert.equal(isSurfaceScaffold(share), false);
assert(share.boundary.includes(SurfaceTruthBoundary.commandRequired), 'share requires explicit command/export path');

const visibleReady = surfaceLabels({ includeScaffold: false }).map((surface) => surface.id);
assert(visibleReady.includes('feed') && visibleReady.includes('tree'), 'ready surface list should include partial surfaces');
assert(visibleReady.includes('share'), 'ready surface list includes implemented partial Share');
assert.equal(visibleReady.length, 11, 'all registered partial surfaces are visible as implemented product paths');

const findings = listSurfaceFindings();
assert(!findings.some((finding) => finding.code === 'surface.status.scaffold'), 'no stale scaffold finding should remain once all registered paths are genuinely implemented');
assert(!findings.some((finding) => finding.severity === 'error'), 'registry should not contain boundary errors');

const adHoc = defineSurface({ id: 'custom' });
assert.equal(adHoc.status, SurfaceImplementationStatus.scaffold, 'undefined status defaults to scaffold');
assert(adHoc.boundary.includes(SurfaceTruthBoundary.noTruthMutation), 'default surface boundary is non-mutating');

console.log('surface.registry: ok');
