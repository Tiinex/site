import assert from 'node:assert/strict';
import './workspace.config.js';

const configApi = globalThis.TiinexWorkspaceConfig;
const defaultConfig = configApi.createDefaultWorkspaceConfig();

assert.equal(defaultConfig.source.fallback, false, 'default workspace config should come from embedded markdown, not empty fallback');
assert.equal(defaultConfig.viewerIdentity.browserTitle, 'Tiinex', 'default config keeps PoC-like viewer identity');
assert(defaultConfig.emptyStage.subtitles.includes('Every handoff starts somewhere'), 'default empty stage copy remains available for clean starts');
assert(defaultConfig.workspaceEntrypoints.some((entrypoint) => entrypoint.repository === 'Tiinex/docs' && entrypoint.rootPath === '.topics'), 'default config exposes a Tiinex/docs workspace entrypoint path');
assert(defaultConfig.workspaceDiscovery.some((discovery) => /Tiinex\/docs/.test(discovery.href || discovery.repository || '') && discovery.match === '*.workspace.md'), 'default config exposes hosted workspace discovery path');

const emptyConfig = configApi.parseWorkspaceConfig('');
assert.equal(emptyConfig.source.fallback, true, 'empty markdown parse remains marked as fallback');
assert.equal(emptyConfig.workspaceEntrypoints.length, 0, 'empty markdown must not silently invent source entrypoints');

console.log('✓ workspace bootstrap/start-state guards passed');
