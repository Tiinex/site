import { mkdir, open } from 'node:fs/promises';
import path from 'node:path';

const MAX_SIBLING_INDEX = 9999;

export async function reserveHandoffSiblingIndex({ parentPackagePath = '', parentPackageSha256 = '', parentDimension = '', enabled = true } = {}) {
  if (!enabled) return Object.freeze({ state: 'not-reserved', siblingIndex: 1, allocationPath: '' });
  const parentPath = path.resolve(String(parentPackagePath || ''));
  const digest = String(parentPackageSha256 || '').trim().toLowerCase();
  const dimension = String(parentDimension || '').trim();
  if (!parentPath || !/^[0-9a-f]{64}$/.test(digest) || !/^\d{3}(?:-\d+)*$/.test(dimension)) throw new Error('portable.cli.handoff-carrier.sibling-allocation.parent-unqualified');
  const allocationDir = path.join(path.dirname(parentPath), '.tiinex-handoff-sibling-allocations');
  await mkdir(allocationDir, { recursive: true });
  const key = `${digest.slice(0, 24)}-${dimension.replace(/[^0-9-]/g, '')}`;
  for (let siblingIndex = 1; siblingIndex <= MAX_SIBLING_INDEX; siblingIndex += 1) {
    const allocationPath = path.join(allocationDir, `${key}-${siblingIndex}.allocation`);
    try {
      const handle = await open(allocationPath, 'wx');
      try {
        await handle.writeFile(`${JSON.stringify({ parentPackageSha256: digest, parentDimension: dimension, siblingIndex, childDimension: `${dimension}-${siblingIndex}` })}\n`, 'utf8');
      } finally {
        await handle.close();
      }
      return Object.freeze({ state: 'reserved', siblingIndex, allocationPath });
    } catch (error) {
      if (error?.code === 'EEXIST') continue;
      throw error;
    }
  }
  throw new Error('portable.cli.handoff-carrier.sibling-allocation.exhausted');
}
