import assert from 'node:assert/strict';
import fs from 'node:fs';
import { timePortalWithResolvedSnapshot, timePortalWithoutIntent } from '../workspaces/workspace.timePortal.js';

const exactCommit = 'b'.repeat(40);
const historical = timePortalWithResolvedSnapshot({ workspaceVerse: 'feed', layoutMode: 'compact' }, {
  sourceId: 'github:docs',
  repository: 'owner/repo',
  rootPath: '.topics',
  requestedRef: exactCommit,
  resolvedRef: exactCommit,
  materializedCommit: exactCommit,
  inputTarget: exactCommit,
  resolvedBy: 'exact-commit'
}, { sourceId: 'github:docs', snapshotInput: exactCommit });
assert.equal(historical.timePortal.mode, 'historical');
const latest = timePortalWithoutIntent(historical);
assert.equal(latest.timePortal, undefined, 'Return to latest clears historical read intent so ordinary compact semantics can resume');
assert.equal(latest.layoutMode, 'compact', 'Return to latest preserves compact layout rather than mutating workspace layout truth');

const surface = fs.readFileSync(new URL('../schemas/workspace/workspace.views.jsx', import.meta.url), 'utf8');
const marker = fs.readFileSync(new URL('../schemas/workspace/workspace.timePortal.views.jsx', import.meta.url), 'utf8');
const css = fs.readFileSync(new URL('../styles/app.css', import.meta.url), 'utf8');

const compactStart = surface.indexOf("if (layoutMode === 'compact')");
const expandedStart = surface.indexOf('\n  return (', compactStart + 1);
assert.ok(compactStart >= 0 && expandedStart > compactStart, 'compact workspace branch remains explicit');
const compact = surface.slice(compactStart, expandedStart);

assert.match(compact, /readOnlyHistorical \? \(/, 'compact layout branches explicitly on the historical read-only boundary');
assert.match(compact, /<TimePortalCompactMarker timePortal=\{timePortal\} \/>/, 'compact historical layout keeps an explicit Time Portal marker');
assert.match(compact, /tx-workspace-compact-title tx-workspace-compact-title-readonly/, 'compact historical title is non-interactive presentation');
const historicalBranch = compact.slice(compact.indexOf('{readOnlyHistorical ? ('), compact.indexOf(') : <button type="button" className="tx-workspace-compact-title"'));
assert.doesNotMatch(historicalBranch, /onRenameWorkspace|Rename workspace|icon="edit"/, 'compact historical title exposes no Rename action, semantics, or edit iconography');
assert.match(compact, /<button type="button" className="tx-workspace-compact-title" title="Rename workspace" onClick=\{onRenameWorkspace\}>/, 'compact latest retains the existing Rename behavior unchanged');
assert.match(compact, /onClick=\{\(\) => onLayoutMode\?\.\('expanded'\)\}/, 'compact historical review can still expand to the full Time Portal surface');

assert.match(marker, /timePortal\?\.snapshot\?\.materializedCommit/, 'compact historical marker derives identity from the exact resolved snapshot');
assert.match(marker, /<strong>Historical<\/strong>/, 'compact historical state remains visibly named');
assert.match(marker, /exact\.slice\(0, 10\)/, 'compact marker exposes a short commit for visible disambiguation');
assert.match(marker, /aria-label=\{exactLabel\} title=\{exactLabel\}/, 'compact marker retains the exact commit in accessible/title presentation');

assert.match(surface, /<TimePortalBanner timePortal=\{timePortal\}/, 'expanded historical Time Portal banner remains unchanged and reachable');
assert.match(surface, /onClick=\{readOnlyHistorical \? undefined : onRenameWorkspace\}/, 'expanded historical title remains non-mutating while latest retains Rename');
assert.match(marker, /onReturnLatest\}>Return to latest<\/Button>/, 'expanded historical surface retains Return to latest');
assert.match(css, /\.tx-time-portal-compact-marker[\s\S]*?max-inline-size:\s*4\.75rem;/, 'compact historical marker stays bounded inside the existing compact column');

console.log('post-v438 M0-E compact historical boundary correction: PASS');
