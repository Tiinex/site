#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const TYPES = new Set(['character', 'verb', 'blueprint', 'portrait', 'tiles', 'props']);

function die(message, code = 2) {
  console.error(JSON.stringify({ schema: 'tiinex.playthings.asset-tool.error.v1', error: message }, null, 2));
  process.exit(code);
}

function parseArgs(argv) {
  const [command = 'help', ...rest] = argv;
  const flags = {};
  for (let i = 0; i < rest.length; i += 1) {
    const item = rest[i];
    if (!item.startsWith('--')) continue;
    const key = item.slice(2);
    const next = rest[i + 1];
    if (next && !next.startsWith('--')) { flags[key] = next; i += 1; }
    else flags[key] = true;
  }
  return { command, flags };
}

function findWorkspaceRoot(start = process.cwd()) {
  let current = path.resolve(start);
  while (true) {
    if (fs.existsSync(path.join(current, '.topics', '.workspaces', 'tiinex-site.workspace.md'))) return current;
    const parent = path.dirname(current);
    if (parent === current) break;
    current = parent;
  }
  die('site-workspace-root-not-found');
}

function realish(p) { return path.resolve(p); }
function isInside(root, p) {
  const rel = path.relative(root, p);
  return rel === '' || (!rel.startsWith('..' + path.sep) && rel !== '..' && !path.isAbsolute(rel));
}
function rel(root, p) { return path.relative(root, p).split(path.sep).join('/'); }
function sha256(p) { return crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex'); }
function ensureFile(p, label) { if (!p || !fs.existsSync(p) || !fs.statSync(p).isFile()) die(`${label}-file-not-found:${p || ''}`); }
function dimensionPrefix(name) {
  const m = path.basename(name).match(/^(\d+(?:-\d+)*)/);
  if (!m) die(`artifact-lineage-prefix-not-found:${name}`);
  return m[1];
}
function safeLabel(value) {
  const v = String(value || '').trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!v) die('label-required');
  return v;
}
function ordinalSuffix(value) {
  if (value === undefined || value === null || value === false || value === '') return '';
  const n = Number.parseInt(String(value), 10);
  if (!Number.isFinite(n) || n < 1) die('ordinal-must-be-positive-integer');
  return `-${String(n).padStart(2, '0')}`;
}
function emit(value) { process.stdout.write(JSON.stringify(value, null, 2) + '\n'); }

function importLineage(root, flags) {
  const asset = realish(flags.asset || '');
  const artifact = realish(flags.artifact || '');
  ensureFile(asset, 'asset'); ensureFile(artifact, 'artifact');
  if (!isInside(root, artifact)) die('artifact-must-be-inside-site-workspace');
  if (isInside(root, asset)) {
    return emit({
      schema: 'tiinex.playthings.asset-placement.v1',
      status: 'ready',
      action: 'reference-existing',
      asset: rel(root, asset),
      artifact: rel(root, artifact),
      sha256: sha256(asset),
      boundary: 'Existing in-workspace assets are referenced in place; lineage does not force duplication.'
    });
  }
  const label = safeLabel(flags.label);
  const prefix = dimensionPrefix(path.basename(artifact));
  const ext = path.extname(asset).toLowerCase();
  if (!ext) die('asset-extension-required');
  const target = path.join(path.dirname(artifact), `${prefix}-${label}${ordinalSuffix(flags.ordinal)}${ext}`);
  if (fs.existsSync(target)) {
    if (sha256(target) !== sha256(asset)) die(`lineage-target-collision:${rel(root, target)}`);
    return emit({ schema: 'tiinex.playthings.asset-placement.v1', status: 'ready', action: 'reuse-identical-lineage-asset', asset: rel(root, target), artifact: rel(root, artifact), sha256: sha256(target) });
  }
  fs.copyFileSync(asset, target);
  emit({
    schema: 'tiinex.playthings.asset-placement.v1',
    status: 'ready',
    action: 'import-lineage-local',
    source: asset,
    asset: rel(root, target),
    artifact: rel(root, artifact),
    sha256: sha256(target),
    boundary: 'New non-final asset imported beside the controlling lineage artifact.'
  });
}

function promote(root, flags) {
  const source = realish(flags.source || '');
  const schema = realish(flags.schema || '');
  const type = String(flags.type || '').trim();
  ensureFile(source, 'source'); ensureFile(schema, 'schema');
  if (!isInside(root, source) || !isInside(root, schema)) die('source-and-schema-must-be-inside-site-workspace');
  if (!TYPES.has(type)) die(`unsupported-companion-type:${type}`);
  if (path.extname(source).toLowerCase() !== '.png') die('companion-source-must-be-png');
  if (!schema.endsWith('.schema.md')) die('schema-target-must-end-with-.schema.md');
  const base = path.basename(schema, '.schema.md');
  const target = path.join(path.dirname(schema), `${base}.playthings.${type}.png`);
  if (fs.existsSync(target) && sha256(target) !== sha256(source) && !flags.replace) {
    die(`companion-target-exists-with-different-bytes:${rel(root, target)}`);
  }
  if (!fs.existsSync(target) || sha256(target) !== sha256(source)) fs.copyFileSync(source, target);
  emit({
    schema: 'tiinex.playthings.asset-promotion.v1',
    status: 'ready',
    action: 'promote-schema-companion',
    source: rel(root, source),
    schemaArtifact: rel(root, schema),
    companion: rel(root, target),
    type,
    sha256: sha256(target),
    sourceRetained: true,
    boundary: 'Promotion creates the final schema companion; it does not delete or relocate provenance source.'
  });
}

function audit(root) {
  const findings = [];
  const referenceDir = path.join(root, 'reference');
  if (fs.existsSync(referenceDir)) findings.push({ severity: 'error', code: 'playthings.asset.reference-root-present', path: 'reference' });
  const playthingsLineageRoot = path.join(root, '.topics', 'viewer', 'playthings');
  if (fs.existsSync(playthingsLineageRoot)) {
    const media = /\.(png|webp|jpg|jpeg)$/i;
    const stack = [playthingsLineageRoot];
    while (stack.length) {
      const dir = stack.pop();
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const traceDimensions = new Set(entries
        .filter((entry) => entry.isFile() && entry.name.endsWith('.trace.md'))
        .map((entry) => entry.name.match(/^(\d+(?:-\d+)*)-/)?.[1] || '')
        .filter(Boolean));
      for (const entry of entries) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) { stack.push(p); continue; }
        if (!media.test(entry.name)) continue;
        const dimension = entry.name.match(/^(\d+(?:-\d+)*)-/)?.[1] || '';
        if (!dimension) {
          findings.push({ severity: 'error', code: 'playthings.asset.lineage-dimension-missing', path: rel(root, p) });
          continue;
        }
        if (!traceDimensions.has(dimension)) findings.push({
          severity: 'error',
          code: 'playthings.asset.lineage-coevent-trace-missing',
          path: rel(root, p),
          dimension,
          message: 'A lineage-local non-final asset must share the exact numeric dimension of at least one controlling artifact in the same directory. Numeric child dimensions encode later events; attachment ordering belongs at the end of the semantic slug.'
        });
      }
    }
  }
  const schemaRoot = path.join(root, 'src', 'schemas');
  if (fs.existsSync(schemaRoot)) {
    const stack = [schemaRoot];
    while (stack.length) {
      const dir = stack.pop();
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) stack.push(p);
        else if (/\.playthings\.[^.]+\.png$/.test(entry.name)) {
          const m = entry.name.match(/\.playthings\.([^.]+)\.png$/);
          if (!m || !TYPES.has(m[1])) findings.push({ severity: 'error', code: 'playthings.asset.unknown-companion-type', path: rel(root, p) });
          const schemaName = entry.name.replace(/\.playthings\.[^.]+\.png$/, '.schema.md');
          if (!fs.existsSync(path.join(dir, schemaName))) findings.push({ severity: 'error', code: 'playthings.asset.schema-sibling-missing', path: rel(root, p), expectedSchema: rel(root, path.join(dir, schemaName)) });
        }
      }
    }
  }
  emit({
    schema: 'tiinex.playthings.asset-placement-audit.v1',
    status: findings.some(f => f.severity === 'error') ? 'invalid' : 'clean',
    counts: { errors: findings.filter(f => f.severity === 'error').length, findings: findings.length },
    findings,
    rules: {
      existingAsset: 'reference-in-place',
      newNonFinalAsset: '.topics-lineage-local with exact controlling-event numeric dimension; use semantic slug suffix -01/-02 for ordering',
      finalRuntimeProduct: 'src/schemas sibling named <schema>.playthings.<type>.png'
    }
  });
  if (findings.some(f => f.severity === 'error')) process.exitCode = 2;
}

function help() {
  console.log(`Playthings asset placement helper\n\nCommands:\n  import --asset <outside-or-existing-path> --artifact <trace.md> --label <slug> [--ordinal 1]\n  promote --source <png> --schema <schema.md> --type character|verb|blueprint|portrait|tiles|props [--replace]\n  audit\n\nRules:\n  * Existing in-workspace assets are referenced where they already live; no lineage-only duplication.\n  * New non-final assets imported from outside the workspace are placed beside the controlling lineage artifact and share its exact numeric dimension; use --ordinal for -01/-02 ordering at the end of the slug, never a numeric child dimension.\n  * Final runtime products are schema siblings using the .playthings. namespace.\n`);
}

const { command, flags } = parseArgs(process.argv.slice(2));
const root = findWorkspaceRoot(flags.workspace || process.cwd());
if (command === 'import') importLineage(root, flags);
else if (command === 'promote') promote(root, flags);
else if (command === 'audit') audit(root);
else help();
