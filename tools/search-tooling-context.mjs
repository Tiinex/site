#!/usr/bin/env node
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_EXCLUDED_DIRS = new Set(['.git', 'node_modules', '.site-publish', 'dist', 'build']);
const DEFAULT_EXCLUDED_PREFIXES = Object.freeze([
  'src/tooling/portable/fixtures/legacy-artifacts/'
]);
const TEXT_RE = /\.(?:md|markdown|txt|json|ya?ml|js|mjs|cjs|ts|tsx|jsx|html|css)$/i;

export function searchToolingContext({
  root,
  query,
  limit = 40,
  snippetChars = 220,
  includeLegacyFixtures = false,
  excludedDirs = DEFAULT_EXCLUDED_DIRS
} = {}) {
  const absoluteRoot = resolve(root || '.');
  const needle = String(query || '');
  if (!needle) throw new Error('search query is required');
  const maxMatches = positiveInteger(limit, 40);
  const maxSnippetChars = positiveInteger(snippetChars, 220);
  const excludedPrefixes = includeLegacyFixtures ? [] : [...DEFAULT_EXCLUDED_PREFIXES];
  const matches = [];
  let filesScanned = 0;
  let filesMatched = 0;
  let totalMatches = 0;

  for (const file of walkTextFiles(absoluteRoot, { excludedDirs, excludedPrefixes })) {
    filesScanned += 1;
    const text = readFileSync(file, 'utf8');
    const fileMatches = literalLineMatches(text, needle);
    if (!fileMatches.length) continue;
    filesMatched += 1;
    totalMatches += fileMatches.length;
    for (const match of fileMatches) {
      if (matches.length >= maxMatches) continue;
      matches.push(Object.freeze({
        path: relative(absoluteRoot, file).replace(/\\/g, '/'),
        line: match.line,
        column: match.column,
        snippet: boundedSnippet(match.text, maxSnippetChars)
      }));
    }
  }

  return Object.freeze({
    schema: 'tiinex.site.tooling-context-search.v1',
    root: absoluteRoot,
    query: needle,
    profile: includeLegacyFixtures ? 'explicit-legacy-inclusive' : 'current-default',
    exclusions: Object.freeze({
      directories: Object.freeze([...excludedDirs].sort()),
      pathPrefixes: Object.freeze(excludedPrefixes)
    }),
    counts: Object.freeze({ filesScanned, filesMatched, totalMatches, returnedMatches: matches.length }),
    truncated: totalMatches > matches.length,
    matches: Object.freeze(matches)
  });
}

function* walkTextFiles(root, { excludedDirs, excludedPrefixes }) {
  const queue = [root];
  while (queue.length) {
    const directory = queue.shift();
    const entries = readdirSync(directory, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      if (excludedDirs.has(entry.name)) continue;
      const absolute = resolve(directory, entry.name);
      const rel = relative(root, absolute).replace(/\\/g, '/');
      if (excludedPrefixes.some((prefix) => rel === prefix.slice(0, -1) || rel.startsWith(prefix))) continue;
      if (entry.isDirectory()) queue.push(absolute);
      else if (entry.isFile() && TEXT_RE.test(entry.name) && statSync(absolute).size <= 4 * 1024 * 1024) yield absolute;
    }
  }
}

function literalLineMatches(text, needle) {
  const out = [];
  const lines = String(text || '').split(/\r?\n/);
  for (let index = 0; index < lines.length; index += 1) {
    let offset = 0;
    while (true) {
      const found = lines[index].indexOf(needle, offset);
      if (found < 0) break;
      out.push({ line: index + 1, column: found + 1, text: lines[index] });
      offset = found + Math.max(1, needle.length);
    }
  }
  return out;
}

function boundedSnippet(text, maxChars) {
  const value = String(text || '').trim();
  return value.length <= maxChars ? value : `${value.slice(0, Math.max(0, maxChars - 1))}…`;
}

function positiveInteger(value, fallback) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number > 0 ? number : fallback;
}

function parseArgs(argv) {
  let root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
  let query = '';
  let limit = 40;
  let snippetChars = 220;
  let includeLegacyFixtures = false;
  let json = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') root = argv[++index];
    else if (arg === '--query' || arg === '-q') query = argv[++index];
    else if (arg === '--limit') limit = argv[++index];
    else if (arg === '--snippet-chars') snippetChars = argv[++index];
    else if (arg === '--include-legacy-fixtures') includeLegacyFixtures = true;
    else if (arg === '--json') json = true;
    else if (arg === '--help' || arg === '-h') return { help: true };
    else throw new Error(`Unknown argument: ${arg}`);
  }
  return { help: false, root, query, limit, snippetChars, includeLegacyFixtures, json };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log('Usage: node tools/search-tooling-context.mjs --query <literal> [--root <path>] [--limit 40] [--snippet-chars 220] [--include-legacy-fixtures] [--json]');
      process.exit(0);
    }
    const result = searchToolingContext(options);
    if (options.json) console.log(JSON.stringify(result, null, 2));
    else {
      console.log(`Tooling context search: ${result.counts.totalMatches} matches across ${result.counts.filesMatched} files; returning ${result.counts.returnedMatches}${result.truncated ? ' (truncated)' : ''}.`);
      for (const match of result.matches) console.log(`${match.path}:${match.line}:${match.column}: ${match.snippet}`);
    }
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
