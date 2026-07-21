#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const failures = [];
const app = readFileSync(join(root, 'src/app/TiinexApp.jsx'), 'utf8');
const workspaceViews = readFileSync(join(root, 'src/schemas/workspace/workspace.views.jsx'), 'utf8') + '\n' + readFileSync(join(root, 'src/schemas/workspace/workspace.add.views.jsx'), 'utf8');
const workspaceModule = readFileSync(join(root, 'src/schemas/workspace/workspace.schema.js'), 'utf8');
const workspaceI18n = readFileSync(join(root, 'src/schemas/workspace/workspace.i18n.js'), 'utf8');
const lifecycle = readFileSync(join(root, 'src/workspaces/workspace.lifecycle.js'), 'utf8');
const persistence = readFileSync(join(root, 'src/workspaces/workspace.persistence.js'), 'utf8');
const config = readFileSync(join(root, 'src/workspaces/workspace.config.js'), 'utf8');
const uiSource = `${app}\n${workspaceViews}\n${workspaceModule}\n${workspaceI18n}\n${lifecycle}`;
function expect(text, needle, label) { if (!text.includes(needle)) failures.push(label); }
function reject(text, needle, label) { if (text.includes(needle)) failures.push(label); }

function expectRegex(text, regex, label) { if (!regex.test(text)) failures.push(label); }

// v120: Source/material registration contract guards (read-only assertions)
// Owner: lifecycle; we assert structure and default discovery state for configured sources
expectRegex(lifecycle, /function\s+createWorkspace[\s\S]*?sources\s*:\s*\[\s*makeLocalSource\(/, 'createWorkspace must initialize local pinned source');

// Ensure local pinned source does NOT include discoveryState (only configured sources get discoveryState)
const makeLocalMatch = lifecycle.match(/function\s+makeLocalSource\([\s\S]*?return\s*{([\s\S]*?)};/);
if (!makeLocalMatch) failures.push('makeLocalSource function must exist');
else if (/discoveryState/.test(makeLocalMatch[1])) failures.push('local pinned source must not include discoveryState');

// Ensure configured source factory exists and includes canonical fields + discoveryState default
const makeConfiguredMatch = lifecycle.match(/function\s+makeConfiguredSource\([\s\S]*?return\s*{([\s\S]*?)};/);
if (!makeConfiguredMatch) failures.push('makeConfiguredSource function must exist');
else {
  const cfgBody = makeConfiguredMatch[1];
  const requiredFields = ['id', 'kind', 'label', 'repo', 'ref', 'rootPath', 'count', 'boundary', 'transportLabel', 'closeable', 'discoveryState'];
  for (const f of requiredFields) {
    const regex = new RegExp('(?:' + f + '\\s*:|\\b' + f + '\\b\\s*(?:,|$))');
    if (!regex.test(cfgBody)) failures.push(`configured source must include ${f}`);
  }
  if (!/discoveryState\s*:\s*normalizeSourceDiscoveryState\(input\.discoveryState,\s*["']deferred["']\)/.test(cfgBody)) failures.push('configured source must normalize discoveryState and default to "deferred"');
}
expectRegex(lifecycle, /const\s+SOURCE_STATES\s*=\s*new\s+Set\([\s\S]*["']deferred["'][\s\S]*["']loaded["'][\s\S]*\)/, 'source discovery states must be finite and include loaded/deferred');
expectRegex(lifecycle, /function\s+normalizeSourceDiscoveryState/, 'source discovery state normalization must be lifecycle-owned');
expectRegex(lifecycle, /addWorkspaceSourceRecords[\s\S]*discoveryState\s*:\s*normalizeSourceDiscoveryState\(options\.discoveryState\s*\|\|\s*["']loaded["'],\s*["']loaded["']\)/, 'source-backed material insertion must mark materialized source as loaded');
reject(app, "discoveryState: 'resolved'", 'React app must not write non-canonical source discoveryState "resolved"');
reject(app, 'discoveryState: "resolved"', 'React app must not write non-canonical source discoveryState "resolved"');

// addWorkspaceSource must return ok:true and source/workspace/state tuple on success
expectRegex(lifecycle, /function\s+addWorkspaceSource[\s\S]*?return\s*{[^}]*ok\s*:\s*true[^}]*source[^}]*workspace[^}]*state/ , 'addWorkspaceSource must return ok:true and source/workspace/state');

// For normal registration path (no input.progress), discoveryProgress should be set to null
if (!/workspace\.discoveryProgress\s*=\s*input\.progress\s*\?[^:]+:\s*null/.test(lifecycle)) failures.push('addWorkspaceSource must set workspace.discoveryProgress to null when no progress is provided');

expect(config, 'Every handoff starts somewhere', 'empty start copy must come from .workspace.md config');
expect(lifecycle, 'workspace.name.required', 'workspace name validation must remain lifecycle-owned');
expect(lifecycle, 'SESSION_SOURCE_KIND', 'local/session source kind must remain explicit');
expect(lifecycle, 'no source files or GitHub provenance inferred', 'local workspace must not guess GitHub provenance');
expect(persistence, 'readInitialState', 'hash restore must be persistence-owned');
expect(persistence, 'readStoredState', 'localStorage must remain cache/mirror, not clean-url bootstrap');
expect(app, 'persistence?.readInitialState', 'React app must restore from hash');
expect(app, 'persistence?.clearState', 'closing last workspace must clean URL/storage state');
expect(uiSource, 'createWorkspace(name)', 'create dialog must use lifecycle createWorkspace');
expect(uiSource, 'Workspace name is required.', 'create dialog must expose required name validation');
expect(uiSource, 'Clean start restored.', 'close last workspace must restore clean start');
expect(uiSource, 'no source files or GitHub provenance inferred', 'React created workspace must disclose local/session boundary');
expect(uiSource, 'No nodes match this view.', 'created empty workspace must match old no-node behavior');
expect(app, 'href="https://github.com/Tiinex"', 'footer must be visible and linkable before workspace creation');
expect(uiSource, 'data-flow="old-like-add-menu"', 'old-like Add flow must be owned by workspace schema companions');
expect(uiSource, 'closeWorkspaceSource', 'explicit source close must use lifecycle');
expect(workspaceModule, "id: 'tiinex.workspace.v1'", 'workspace schema companion module must be registered near schema');
expect(uiSource, 'count <= 1', 'pager arrows must only render for multiple workspaces');
expect(uiSource, 'shouldPageWorkspaces', 'pager arrows must be viewport-size gated');
reject(app, 'localStorage.getItem', 'React app must not bootstrap directly from stale localStorage');
reject(uiSource, 'Create your first workspace', 'UC-001 must not use onboarding-card copy');
reject(uiSource, 'actionButton', 'React UC-001 must not depend on legacy actionButton renderer');

// Defer final verdict until after the v120.1 caller-scan so there's
// a single, consolidated success/failure output at the end of this script.

// v120.1: scan for call sites that pass `progress` into `addWorkspaceSource(...)`
// Scope: scan `src/` and `tools/` only. Exclude common build/output folders by skipping directories with matching names.
const scanDirs = [join(root, 'src'), join(root, 'tools')];
const excludeDirNames = new Set(['.old', 'node_modules', '.site-publish', 'dist', 'build', 'out', 'tmp', '.tmp', '.cache']);
const offending = [];
for (const dirPath of scanDirs) {
  if (!existsSync(dirPath)) continue;
  const stack = [dirPath];
  while (stack.length) {
    const p = stack.pop();
    for (const entry of readdirSync(p, { withFileTypes: true })) {
      const full = join(p, entry.name);
      if (entry.isDirectory()) {
        if (excludeDirNames.has(entry.name.toLowerCase())) continue;
        stack.push(full);
        continue;
      }
      if (!/\.(mjs|js|jsx|ts|tsx)$/.test(entry.name)) continue;
      // avoid scanning this guard file itself for callers
      if (full === join(root, 'tools', 'check-uc001.mjs')) continue;
      const txt = readFileSync(full, 'utf8');
      const callRegex = /addWorkspaceSource\s*\([\s\S]*?\)/g;
      let m;
      while ((m = callRegex.exec(txt)) !== null) {
        const callText = m[0];
        // detect object literal property 'progress:' or shorthand 'progress,' or 'progress}' within the call arguments
        if (/\bprogress\b\s*(?::|,|\})/.test(callText)) {
          const line = txt.slice(0, m.index).split(/\r\n|\r|\n/).length;
          const context = callText.length > 300 ? callText.slice(0, 300) + '...' : callText;
          offending.push({ file: full, line, context });
        }
      }
    }
  }
}

if (offending.length) {
  for (const o of offending) failures.push(`addWorkspaceSource called with progress in ${relative(root, o.file)}: line ${o.line} -> ${o.context}`);
}

if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log('✓ React UC-001 create/restore/close guards passed');
