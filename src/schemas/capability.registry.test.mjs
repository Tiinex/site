import assert from 'node:assert/strict';
import { schemaRegistry } from './registry.js';
import { buildSchemaCapabilityRegistry, CapabilityStatus, describeSchemaCapabilities, resolveSchemaCapabilities } from './capability.registry.js';

const registry = buildSchemaCapabilityRegistry();

assert.equal(registry.schema, 'tiinex.schema.capability.registry.v1');
assert.equal(registry.status, 'clean');
assert.equal(registry.modules.length, schemaRegistry.modules.length, 'all registered schema modules should have capability descriptors');
assert.equal(registry.counts.errors, 0, 'capability registry should have no errors');

const root = registry.modules.find((module) => module.moduleId === 'tiinex.root.v1');
assert.ok(root, 'root module descriptor exists');
assert.equal(root.actions.fallback.status, CapabilityStatus.implemented, 'root must own fallback projection');
assert.equal(root.actions.validate.status, CapabilityStatus.implemented, 'root must validate envelopes');
assert.equal(root.actions.present.status, CapabilityStatus.implemented, 'root must present fallback models');
assert.equal(root.fallback.mode, 'root-envelope-display');

const topic = registry.modules.find((module) => module.moduleId === 'tiinex.topic.v1');
assert.ok(topic, 'topic module descriptor exists');
assert.equal(topic.actions.create.status, CapabilityStatus.implemented, 'topic can create artifacts');
assert.equal(topic.surfaces.feed.status, CapabilityStatus.implemented, 'topic supports Feed projection');
assert.equal(topic.surfaces.detail.status, CapabilityStatus.implemented, 'topic supports Detail projection');
assert.equal(topic.fallback.status, CapabilityStatus.fallback, 'topic degrades through root fallback when module is unavailable');

const workspace = registry.modules.find((module) => module.moduleId === 'tiinex.workspace.v1');
assert.ok(workspace, 'workspace module descriptor exists');
assert.equal(workspace.surfaces['add-dialog'].status, CapabilityStatus.implemented, 'workspace-specific surfaces are preserved');
assert.equal(workspace.actions['add-github-source'].status, CapabilityStatus.implemented, 'workspace-specific actions are preserved');
assert.ok(workspace.boundaries.some((boundary) => boundary.includes('local-session')), 'workspace source-boundary declarations are exposed');

for (const module of registry.modules) {
  assert.equal(module.actions.read.status, CapabilityStatus.implemented, `${module.moduleId} should be readable when registered`);
  assert.equal(module.actions.validate.status, CapabilityStatus.implemented, `${module.moduleId} should expose validation`);
  assert.equal(module.actions.present.status, CapabilityStatus.implemented, `${module.moduleId} should expose presentation`);
  assert.notEqual(module.availability, 'invalid', `${module.moduleId} should not be invalid`);
}

const unknown = resolveSchemaCapabilities({ schemaId: 'tiinex.future.unknown.v9' });
assert.equal(unknown.schema, 'tiinex.schema.capability.resolution.v1');
assert.equal(unknown.fallbackUsed, true, 'unknown schemas resolve through root fallback');
assert.equal(unknown.descriptor.moduleId, 'tiinex.root.v1');
assert.equal(unknown.status, 'root-fallback');
assert.equal(unknown.descriptor.resolution.unresolvedSchemaId, 'tiinex.future.unknown.v9');
assert.equal(unknown.descriptor.actions.fallback.status, CapabilityStatus.implemented);
assert.ok(unknown.descriptor.findings.some((finding) => finding.code === 'schema.capability.rootFallback.used'));

const bad = describeSchemaCapabilities({ id: 'broken', kind: 'concrete', capabilities: { supportedSurfaces: ['feed'] } });
assert.equal(bad.availability, 'invalid', 'missing binding should invalidate descriptor');
assert.ok(bad.findings.some((finding) => finding.code === 'schema.capability.binding.schemaId.missing'));

console.log('schema capability registry: ok');
