import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { reserveHandoffSiblingIndex } from './cli.handoff-sibling-allocation.js';

const root = await mkdtemp(path.join(os.tmpdir(), 'tiinex-sibling-allocation-'));
try {
  const parentPackagePath = path.join(root, 'parent.handoff-package.zip');
  const parentPackageSha256 = 'a'.repeat(64);
  const parentDimension = '009-2';
  const first = await reserveHandoffSiblingIndex({ parentPackagePath, parentPackageSha256, parentDimension });
  const retry = await reserveHandoffSiblingIndex({ parentPackagePath, parentPackageSha256, parentDimension });
  assert.equal(first.siblingIndex, 1);
  assert.equal(retry.siblingIndex, 2, 'a retry after a claimed slot must not reuse the prior sibling dimension');

  const concurrent = await Promise.all(Array.from({ length: 16 }, () => reserveHandoffSiblingIndex({ parentPackagePath, parentPackageSha256, parentDimension })));
  const concurrentIndexes = concurrent.map((item) => item.siblingIndex);
  assert.equal(new Set(concurrentIndexes).size, concurrentIndexes.length, 'atomic reservation must prevent concurrent sibling collisions');
  assert.deepEqual([...concurrentIndexes].sort((a, b) => a - b), Array.from({ length: 16 }, (_, index) => index + 3));

  const differentParentIdentity = await reserveHandoffSiblingIndex({
    parentPackagePath,
    parentPackageSha256: 'b'.repeat(64),
    parentDimension
  });
  assert.equal(differentParentIdentity.siblingIndex, 1, 'allocation authority is scoped to exact parent package identity');

  const differentParentDimension = await reserveHandoffSiblingIndex({
    parentPackagePath,
    parentPackageSha256,
    parentDimension: '009-3'
  });
  assert.equal(differentParentDimension.siblingIndex, 1, 'allocation authority is also scoped to the exact parent dimension');

  const routeMetadataIgnored = await reserveHandoffSiblingIndex({
    parentPackagePath,
    parentPackageSha256: 'c'.repeat(64),
    parentDimension,
    routeOrder: ['route-b', 'route-a'],
    routeId: 'route-b'
  });
  assert.equal(routeMetadataIgnored.siblingIndex, 1, 'route order and route identity are not allocation authority');

  const disabled = await reserveHandoffSiblingIndex({ parentPackagePath, parentPackageSha256, parentDimension, enabled: false });
  assert.equal(disabled.state, 'not-reserved');
  assert.equal(disabled.siblingIndex, 1);

  console.log('✓ sibling allocation regression: retry/concurrency/exact-parent safety preserved without route-order authority');
} finally {
  await rm(root, { recursive: true, force: true });
}
