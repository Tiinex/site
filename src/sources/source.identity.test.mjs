import './source.identity.js';

const { makeConfiguredSourceId, sourceIdPart } = globalThis.TiinexSourceIdentity || {};
function assert(condition, message) { if (!condition) throw new Error(message); }

assert(sourceIdPart('Tiinex/docs') === 'tiinex-docs', 'repo identity part should be URL/path safe');
assert(sourceIdPart('') === 'unresolved', 'blank source identity part should use fallback');
assert(makeConfiguredSourceId({ repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics' }) === 'github:tiinex-docs:main:topics', 'configured source id should include repo/ref/root');
assert(makeConfiguredSourceId({ repository: 'Tiinex/docs', ref: 'dev', rootPath: '.topics' }) !== makeConfiguredSourceId({ repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics' }), 'different refs must not collide');
assert(makeConfiguredSourceId({ repository: 'Tiinex/docs', ref: 'main', rootPath: 'docs' }) !== makeConfiguredSourceId({ repository: 'Tiinex/docs', ref: 'main', rootPath: '.topics' }), 'different roots must not collide');
assert(makeConfiguredSourceId({ repository: 'Tiinex/docs', rootPath: '.topics' }).includes(':unresolved:'), 'unpinned source id must disclose unresolved ref');

console.log('source.identity: ok');
