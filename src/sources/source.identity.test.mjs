import './source.identity.js';
import { configuredSourceIdForWorkspace } from '../workspaces/workspace.configuredSource.js';

const { configuredSourceBoundaryIdentity, configuredSourceBoundaryKey, configuredSourceBoundarySignature, makeConfiguredSourceId, sourceIdPart } = globalThis.TiinexSourceIdentity || {};
function assert(condition, message) { if (!condition) throw new Error(message); }

assert(sourceIdPart('Tiinex/docs') === 'tiinex-docs', 'repo identity part should be URL/path safe');
assert(sourceIdPart('') === 'unresolved', 'blank source identity part should use fallback');
assert(makeConfiguredSourceId({ repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics' }) === 'github:tiinex-docs:main:topics', 'configured source id should include repo/ref/root');
assert(makeConfiguredSourceId({ repository: 'Tiinex/docs', ref: 'dev', rootPath: '.topics' }) !== makeConfiguredSourceId({ repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics' }), 'different refs must not collide');
assert(makeConfiguredSourceId({ repository: 'Tiinex/docs', ref: 'main', rootPath: 'docs' }) !== makeConfiguredSourceId({ repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics' }), 'different roots must not collide');
assert(makeConfiguredSourceId({ repository: 'Tiinex/docs', rootPath: '.topics' }).includes(':unresolved:'), 'unpinned source id must disclose unresolved ref');

assert(makeConfiguredSourceId({ repository: 'Owner/Repo', ref: 'Main', rootPath: '.topics/Foo' }) === makeConfiguredSourceId({ repository: 'owner/repo', ref: 'Main', rootPath: '.topics/Foo' }), 'repository casing should retain established case-insensitive configured-source identity');
assert(makeConfiguredSourceId({ repository: 'Owner/Repo', ref: 'Main', rootPath: '.topics/Foo' }) !== makeConfiguredSourceId({ repository: 'Owner/Repo', ref: 'main', rootPath: '.topics/Foo' }), 'configured source identity must preserve Git ref case');
assert(makeConfiguredSourceId({ repository: 'Owner/Repo', ref: 'Main', rootPath: '.topics/Foo' }) !== makeConfiguredSourceId({ repository: 'Owner/Repo', ref: 'Main', rootPath: '.topics/foo' }), 'configured source identity must preserve repository root path case');

assert(configuredSourceBoundaryKey({ repository: 'Owner/Repo', ref: 'Main', rootPath: '.topics/Foo', explicitFileRefs: ['x.md'] }) === configuredSourceBoundaryKey({ repository: 'owner/repo', ref: 'Main', rootPath: '.topics/Foo', explicitFileRefs: ['y.md'] }), 'configured source boundary key is stable across current target-plan changes');
assert(configuredSourceBoundaryKey({ repository: 'Owner/Repo', ref: 'Main', rootPath: '.topics/Foo' }) !== configuredSourceBoundaryKey({ repository: 'Owner/Repo', ref: 'main', rootPath: '.topics/Foo' }), 'configured source boundary identity preserves ref case');
assert(configuredSourceBoundaryKey({ repository: 'Owner/Repo', ref: 'Main', rootPath: '.topics/Foo' }) !== configuredSourceBoundaryKey({ repository: 'Owner/Repo', ref: 'Main', rootPath: '.topics/foo' }), 'configured source boundary identity preserves root path case');

const delimiterA = { repository: 'o/r', ref: 'foo|bar', rootPath: '.topics' };
const delimiterB = { repository: 'o/r', ref: 'foo', rootPath: 'bar|.topics' };
assert(configuredSourceBoundarySignature(delimiterA) === configuredSourceBoundarySignature(delimiterB), 'legacy pipe signature remains a non-authoritative display projection and may collide');
assert(configuredSourceBoundaryKey(delimiterA) !== configuredSourceBoundaryKey(delimiterB), 'canonical configured source boundary key must be collision-safe for delimiter-bearing refs/roots');
const identityA = configuredSourceBoundaryIdentity(delimiterA);
assert(identityA.repository === 'o/r' && identityA.ref === 'foo|bar' && identityA.rootPath === '.topics', 'structured configured source boundary identity must preserve normalized semantic parts without parsing an opaque key');
const existing = [{ id: 'source:delimiter-a', ...delimiterA }];
assert(configuredSourceIdForWorkspace(delimiterB, existing) !== 'source:delimiter-a', 'workspace configured-source matching must use collision-safe boundary equality rather than the legacy display signature');

console.log('source.identity: ok');

const branchBoundary = { repository: 'Tiinex/docs', ref: 'main', requestedRef: '', rootPath: '.topics' };
assert(configuredSourceBoundaryKey({ ...branchBoundary, materializedCommit: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' }) === configuredSourceBoundaryKey({ ...branchBoundary, materializedCommit: 'bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb' }), 'immutable materialized commit must not redefine configured source boundary identity');
