import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const valueAfter = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : '';
};
const scriptRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const root = path.resolve(valueAfter('--root') || scriptRoot);
const entry = path.resolve(root, valueAfter('--entry') || 'src/main.jsx');
const reportOnly = args.includes('--report-only');
const broadPortableBarrel = path.resolve(root, 'src/tooling/portable/index.js');
const packagePressureFixtureRoot = path.resolve(root, 'src/tooling/portable/package/fixtures');
const sourceExtensions = ['.js', '.jsx', '.mjs', '.ts', '.tsx'];
const visited = new Set();
const nodeEdges = [];
const barrelEdges = [];
const packageFixtureEdges = [];
const unresolvedLocal = [];
const rel = (file) => path.relative(root, file).replaceAll(path.sep, '/');

walk(entry);

const report = Object.freeze({
  root,
  entry: rel(entry),
  reachableProductionModules: visited.size,
  nodeImportEdges: nodeEdges.length,
  nodeImporters: new Set(nodeEdges.map((edge) => edge.importer)).size,
  broadPortableBarrelEdges: barrelEdges.length,
  packagePressureFixtureEdges: packageFixtureEdges.length,
  unresolvedLocalImports: unresolvedLocal.length
});
console.log(`browser-import-boundary: ${JSON.stringify(report)}`);
for (const edge of nodeEdges) console.log(`NODE ${edge.importer} -> ${edge.specifier}`);
for (const edge of barrelEdges) console.log(`BARREL ${edge.importer} -> ${edge.specifier}`);
for (const edge of packageFixtureEdges) console.log(`FIXTURE ${edge.importer} -> ${edge.specifier}`);
for (const edge of unresolvedLocal) console.log(`UNRESOLVED ${edge.importer} -> ${edge.specifier}`);

if (!reportOnly && (nodeEdges.length || barrelEdges.length || packageFixtureEdges.length || unresolvedLocal.length)) {
  console.error('browser-import-boundary: FAIL');
  process.exitCode = 1;
} else {
  console.log(reportOnly ? 'browser-import-boundary: REPORT' : 'browser-import-boundary: PASS');
}

function walk(file) {
  const normalized = path.resolve(file);
  if (visited.has(normalized)) return;
  if (!fs.existsSync(normalized) || !fs.statSync(normalized).isFile()) {
    unresolvedLocal.push({ importer: rel(normalized), specifier: '<entry-missing>' });
    return;
  }
  if (!sourceExtensions.includes(path.extname(normalized))) return;
  visited.add(normalized);
  const source = fs.readFileSync(normalized, 'utf8');
  for (const specifier of staticSpecifiers(source)) {
    if (specifier.startsWith('node:')) {
      nodeEdges.push({ importer: rel(normalized), specifier });
      continue;
    }
    if (!specifier.startsWith('.')) continue;
    const localSpecifier = specifier.split(/[?#]/, 1)[0];
    const directPath = path.resolve(path.dirname(normalized), localSpecifier);
    if (directPath === packagePressureFixtureRoot || directPath.startsWith(`${packagePressureFixtureRoot}${path.sep}`)) {
      packageFixtureEdges.push({ importer: rel(normalized), specifier });
    }
    const resolved = resolveLocal(path.dirname(normalized), localSpecifier);
    if (!resolved) {
      if (looksLikeSource(localSpecifier)) unresolvedLocal.push({ importer: rel(normalized), specifier });
      continue;
    }
    if (resolved === broadPortableBarrel) barrelEdges.push({ importer: rel(normalized), specifier });
    walk(resolved);
  }
}

function staticSpecifiers(source) {
  const withoutComments = source
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  const found = [];
  const patterns = [
    /\b(?:import|export)\s+(?:[^'";]*?\s+from\s*)?['"]([^'"]+)['"]/g,
    /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g
  ];
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(withoutComments))) found.push(match[1]);
  }
  return [...new Set(found)];
}

function resolveLocal(directory, specifier) {
  const raw = path.resolve(directory, specifier);
  const candidates = [raw];
  if (!path.extname(raw)) {
    for (const ext of sourceExtensions) candidates.push(`${raw}${ext}`);
    for (const ext of sourceExtensions) candidates.push(path.join(raw, `index${ext}`));
  }
  for (const candidate of candidates) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return path.resolve(candidate);
  }
  return null;
}

function looksLikeSource(specifier) {
  const ext = path.extname(specifier);
  return !ext || sourceExtensions.includes(ext);
}
