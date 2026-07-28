import assert from 'node:assert/strict';
import { discoveryInitialRecordWindowLimitForScroll, discoveryRenderWindowProfile, discoveryWindowState } from './workspace.discoveryRenderWindow.js';

const records = Array.from({ length: 333 }, (_, index) => ({ id: `record-${index}`, title: index === 220 ? 'Needle target' : `Record ${index}` }));
const desktop = discoveryRenderWindowProfile({ width: 1180, coarse: false });
const mobile = discoveryRenderWindowProfile({ width: 412, coarse: true });

assert.equal(desktop.initial, 60, 'desktop initial window is bounded but not tiny');
assert.equal(mobile.initial, 30, 'mobile initial window mounts fewer cards than desktop');

const desktopState = discoveryWindowState(records, 60, desktop);
assert.equal(desktopState.total, 333, 'window state keeps total match count truthful');
assert.equal(desktopState.visibleRecords.length, 60, 'only the visible/mounted card window is sliced');
assert.equal(desktopState.remaining, 273);

const filteredRecords = records.filter((record) => record.title.includes('Needle'));
const filteredState = discoveryWindowState(filteredRecords, 60, desktop);
assert.equal(filteredState.total, 1, 'search/filter input should already be applied to the full dataset before windowing');
assert.equal(filteredState.visibleRecords[0].id, 'record-220', 'windowing must not hide full-dataset search matches');

const restoredLimit = discoveryInitialRecordWindowLimitForScroll(9000, { width: 1180, height: 760, coarse: false }, desktop);
assert.ok(restoredLimit > desktop.initial, 'deep saved scroll positions should mount enough records before restoring scrollTop');
const restoredState = discoveryWindowState(records, restoredLimit, desktop);
assert.ok(restoredState.visibleRecords.length >= restoredLimit, 'restored window limit should be respected by mounted records');

console.log('workspace.discoveryRenderWindow: ok');
