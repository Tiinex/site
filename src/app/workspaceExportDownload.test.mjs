import assert from 'node:assert/strict';
import { exportWorkspaceTreeDownload } from './workspaceExportDownload.js';

const clicked = [];
const removed = [];
const urls = [];
const doc = {
  body: { appendChild(node) { this.lastNode = node; } },
  createElement(tag) {
    assert.equal(tag, 'a');
    return {
      href: '',
      download: '',
      rel: '',
      click() { clicked.push({ href: this.href, download: this.download, rel: this.rel }); },
      remove() { removed.push(this.download); }
    };
  }
};
const win = { URL: { createObjectURL(blob) { urls.push(blob); return 'blob:tree-export'; }, revokeObjectURL() {} }, setTimeout(fn) { fn(); } };
const workspace = Object.freeze({ title: 'Export Source', records: [Object.freeze({ id: 'r1', title: 'A', path: '.topics/a.trace.md', markdown: '# A', source: Object.freeze({ adapterId: 'local' }) })], assets: [] });
const before = JSON.stringify(workspace);
const bundle = exportWorkspaceTreeDownload(workspace, doc, win, { prebuiltBundle: null });
assert.equal(bundle.schema, 'tiinex.export.tree.bundle.v1');
assert.equal(bundle.packageEnvelope, false);
assert.equal(bundle.remoteFetch, false);
assert.equal(bundle.sourceMutation, false);
assert.equal(clicked.length, 1, 'download link should be clicked once');
assert.match(clicked[0].download, /^tiinex-tree-export-source-/);
assert.equal(JSON.stringify(workspace), before, 'export download must not mutate workspace state or trigger import/open side effects');

console.log('✓ workspaceExportDownload tests passed');
