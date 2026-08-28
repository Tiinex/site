#!/usr/bin/env node
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadNodePortableInput } from '../src/tooling/portable/input/node.input.js';

export function summarizePortableInput(material = {}) {
  const files = Array.isArray(material.files) ? material.files : [];
  const findings = Array.isArray(material.findings) ? material.findings : [];
  const bySourceMode = new Map();
  const byKind = new Map();
  let declaredBytes = 0;
  let textEntries = 0;
  let textResidentBytes = 0;
  let binaryResidentEntries = 0;
  let binaryResidentBytes = 0;
  let locatorOnlyEntries = 0;
  let locatorOnlyDeclaredBytes = 0;

  for (const file of files) {
    const size = Number(file.size || 0);
    declaredBytes += size;
    increment(bySourceMode, String(file.sourceMode || 'unknown'), size);
    increment(byKind, String(file.kind || (typeof file.content === 'string' ? 'text' : 'unknown')), size);
    if (typeof file.content === 'string') {
      textEntries += 1;
      textResidentBytes += Buffer.byteLength(file.content);
    } else if (file.data instanceof Uint8Array) {
      binaryResidentEntries += 1;
      binaryResidentBytes += file.data.byteLength;
    } else if (file.locator) {
      locatorOnlyEntries += 1;
      locatorOnlyDeclaredBytes += size;
    }
  }

  const findingCounts = { info: 0, warning: 0, error: 0, other: 0 };
  for (const finding of findings) {
    const severity = String(finding.severity || '').toLowerCase();
    if (severity in findingCounts) findingCounts[severity] += 1;
    else findingCounts.other += 1;
  }

  return Object.freeze({
    totalEntries: files.length,
    declaredBytes,
    textEntries,
    textResidentBytes,
    binaryResidentEntries,
    binaryResidentBytes,
    locatorOnlyEntries,
    locatorOnlyDeclaredBytes,
    sourceModes: Object.freeze(asRows(bySourceMode)),
    kinds: Object.freeze(asRows(byKind)),
    findingCounts: Object.freeze(findingCounts)
  });
}

export async function measurePortableInputWorkset(target, options = {}) {
  const startedAt = process.hrtime.bigint();
  const material = await loadNodePortableInput([target], options);
  const elapsedMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
  return Object.freeze({
    schema: 'tiinex.site.portable-input-workset.v1',
    target: resolve(target),
    elapsedMs: Math.round(elapsedMs * 1000) / 1000,
    ...summarizePortableInput(material)
  });
}

function increment(map, key, bytes) {
  const current = map.get(key) || { entries: 0, bytes: 0 };
  current.entries += 1;
  current.bytes += bytes;
  map.set(key, current);
}

function asRows(map) {
  return [...map.entries()]
    .map(([name, value]) => Object.freeze({ name, entries: value.entries, bytes: value.bytes }))
    .sort((a, b) => b.bytes - a.bytes || b.entries - a.entries || a.name.localeCompare(b.name));
}

function parseArgs(argv) {
  let target = '';
  let json = false;
  let maxFiles;
  let maxTextBytes;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') json = true;
    else if (arg === '--max-files') maxFiles = argv[++index];
    else if (arg === '--max-text-bytes') maxTextBytes = argv[++index];
    else if (arg === '--help' || arg === '-h') return { help: true };
    else if (!target) target = arg;
    else throw new Error(`Unexpected argument: ${arg}`);
  }
  if (!target) throw new Error('Usage: node tools/measure-portable-input-workset.mjs <file|dir|zip> [--json]');
  return { help: false, target, json, maxFiles, maxTextBytes };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MiB`;
}

export function formatPortableInputWorkset(report) {
  return [
    `Portable input workset: ${report.target}`,
    `elapsed=${report.elapsedMs.toFixed(3)} ms entries=${report.totalEntries} declared=${formatBytes(report.declaredBytes)}`,
    `text=${report.textEntries}/${formatBytes(report.textResidentBytes)} binary-resident=${report.binaryResidentEntries}/${formatBytes(report.binaryResidentBytes)} locator-only=${report.locatorOnlyEntries}/${formatBytes(report.locatorOnlyDeclaredBytes)}`,
    `findings info=${report.findingCounts.info} warning=${report.findingCounts.warning} error=${report.findingCounts.error}`
  ].join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const args = parseArgs(process.argv.slice(2));
    if (args.help) {
      console.log('Usage: node tools/measure-portable-input-workset.mjs <file|dir|zip> [--json] [--max-files N] [--max-text-bytes N]');
      process.exit(0);
    }
    const report = await measurePortableInputWorkset(args.target, { maxFiles: args.maxFiles, maxTextBytes: args.maxTextBytes });
    console.log(args.json ? JSON.stringify(report, null, 2) : formatPortableInputWorkset(report));
    process.exit(report.findingCounts.error ? 2 : 0);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
