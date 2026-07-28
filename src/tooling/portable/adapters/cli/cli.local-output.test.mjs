import assert from 'node:assert/strict';
import { access, mkdtemp, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { materializeCliArtifactSetResult } from './cli.local-output.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-live-export-'));
try {
  const outputDir = path.join(root, 'material');
  const bundle = path.join(root, 'result.zip');
  const result = {
    status: 'created-clean',
    artifacts: [{
      proposalId: 'topic-a',
      parentProposalId: '',
      parentLoadedRef: '',
      draft: {
        path: '.topics/a/a.trace.md',
        markdown: '# A\n\nPortable live result.\n',
        schemaId: 'tiinex.topic.v1',
        changeRole: 'created',
        baseSha256: ''
      }
    }],
    lineageClosure: { context: [], edges: [] },
    assets: []
  };
  const delivered = await materializeCliArtifactSetResult(result, { bundle, 'output-dir': outputDir }, { bundlePrimary: true });
  assert.equal(delivered.delivery.profile, 'bundle-only');
  assert.equal(delivered.delivery.primary.path, path.resolve(bundle));
  assert.equal(delivered.delivery.secondary, null);
  await access(bundle);
  await assert.rejects(readdir(outputDir), /ENOENT/, 'bundle-only live export must not write separate artifact files');
  assert.equal('writeReceipt' in delivered, false, 'bundle-only response must not expose separate artifact output paths');
} finally {
  await rm(root, { recursive: true, force: true });
}

console.log('✓ CLI live export bundle-only delivery passed');
