import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { buildExportPackageBundle } from './package.builder.js';
import { exportPackageZipUint8Array } from './package.zip.js';

const md = `# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](tiinex.topic.v1.schema.md)
  - Created At: 2026-07-21T00:00:00.000Z
  - Summary: Draft
  - Status: draft/local

---

# Draft

# Continuity Integrity

- Draft Local Integrity
  - Method: browser-local-draft
  - Value: pending-publication-or-export
`;
const bundle = buildExportPackageBundle({ id: 'w', title: 'W', records: [{ id: 'r', title: 'Draft', path: 'draft.md', markdown: md, source: { adapterId: 'local' } }] }, { clock: () => '2026-07-21T00:00:00.000Z' });
const bytes = exportPackageZipUint8Array(bundle);
assert.equal(bytes[0], 0x50);
assert.equal(bytes[1], 0x4b);
assert(Buffer.from(bytes).includes(Buffer.from('tiinex.package/manifest.json')), 'zip should include manifest path');
console.log('export.package.zip: ok');
