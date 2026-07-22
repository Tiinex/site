import assert from 'node:assert/strict';
import { collectSourceAssetReferences, extractMarkdownAssetRefs } from './source.assetReferences.js';

const markdown = [
  '# Evidence',
  '![Observed meme](001-1.png)',
  '[same asset](./001-2.webp)',
  '<img src="../shared/blocked.svg" />',
  '[not asset](notes.md)',
  '![remote](https://example.test/a.png)'
].join('\n');

const refs = extractMarkdownAssetRefs(markdown);
assert.equal(refs.length, 4, 'markdown asset parser should only return image/media references');

const discovered = collectSourceAssetReferences([
  { id: 'e1', path: '.topics/educational/memes/doom/001.evidence.md', markdown }
], { source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics/educational/memes/doom' }, availablePaths: ['.topics/educational/memes/doom/001-2.webp'] });

assert.equal(discovered.schema, 'tiinex.source.assetReference.discovery.v1');
assert(discovered.references.some((item) => item.raw === '001-1.png' && item.path === '.topics/educational/memes/doom/001-1.png' && item.status === 'referenced-unloaded'), 'sibling image should be identified as referenced but unloaded');
assert(discovered.references.some((item) => item.raw === './001-2.webp' && item.status === 'loaded'), 'available sibling asset path should be reported as loaded when supplied');
assert(discovered.references.some((item) => item.raw === '../shared/blocked.svg' && item.status === 'blocked'), 'relative asset outside source root should be blocked');
assert(discovered.references.some((item) => item.raw === 'https://example.test/a.png' && item.kind === 'external'), 'remote image should be an explicit external reference, not a repo fetch target');
assert.equal(discovered.counts.total, 4);
assert.equal(discovered.counts['referenced-unloaded'], 2);
assert.equal(discovered.counts.loaded, 1);
assert.equal(discovered.counts.blocked, 1);
console.log('✓ source.assetReferences tests passed');
