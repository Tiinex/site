import assert from 'node:assert/strict';
import { inspectPortableAssets, preparePortableAssetAnalysis } from './asset.operations.js';

const markdown = `# Continuity Context

- Envelope Schema: tiinex.root.v1
- Current
  - Current Schema: tiinex.topic.v1
  - Created At: 2026-07-23 00:00:00

---

# Image Reference

![Local preview](assets/example.png)
`;
const input = {
  files: [
    { path: 'notes/artifact.md', content: markdown },
    { path: 'notes/assets/example.png', kind: 'asset', type: 'image/png', size: 1200, locator: { kind: 'node-zip-entry', archivePath: '/tmp/example.zip', entryPath: 'notes/assets/example.png' } }
  ]
};
const index = inspectPortableAssets(input);
assert.equal(index.counts.images, 1);
assert.equal(index.assets[0].referencedBy.length, 1);
assert.equal(index.assets[0].locator.kind, 'node-zip-entry');
assert.equal(index.assets[0].analysis.portableSemanticAnalysis, false);

const prepared = preparePortableAssetAnalysis({
  ...input,
  assetPath: 'notes/assets/example.png',
  tools: [
    { name: 'archive.extract', description: 'Extract a zip archive entry.' },
    { name: 'vision.open_image', description: 'Open image for multimodal analysis.' }
  ]
});
assert.equal(prepared.status, 'host-action-ready');
assert.equal(prepared.request.requiredCapability, 'multimodal.images');
assert.equal(prepared.request.hostAction.sequence.includes('materialize-or-extract-asset-by-path'), true);
assert.equal(prepared.request.boundary.analysisIsInterpretationNotEmbeddedProvenance, true);

console.log('✓ portable asset indexing and host-mediated multimodal analysis preparation passed');
