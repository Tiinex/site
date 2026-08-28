#!/usr/bin/env node
import { mkdtempSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_EXCLUDES = new Set(['.git', 'node_modules', '.site-publish']);

export function classifyWorksetPath(relativePath) {
  const path = String(relativePath || '').replace(/\\/g, '/');
  if (path.startsWith('.topics/tooling/iteration-efficiency/')) return 'current-iteration-efficiency';
  if (path.startsWith('.topics/development/')) return 'legacy-topics-development';
  if (path.startsWith('.topics/continuity/')) return 'legacy-topics-continuity';
  if (path.startsWith('.topics/')) return 'other-topics';
  if (path.startsWith('docs/')) return 'docs';
  if (path.startsWith('src/tooling/')) return 'tooling-source';
  if (path.startsWith('tools/')) return 'tooling-tools';
  if (path.startsWith('src/')) return 'other-source';
  return 'other';
}

export function measureRepositoryWorkset(root, { excludes = DEFAULT_EXCLUDES } = {}) {
  const absoluteRoot = resolve(root);
  const categories = new Map();
  let totalFiles = 0;
  let totalBytes = 0;

  function add(category, bytes) {
    const current = categories.get(category) || { files: 0, bytes: 0 };
    current.files += 1;
    current.bytes += bytes;
    categories.set(category, current);
    totalFiles += 1;
    totalBytes += bytes;
  }

  function walk(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      if (excludes.has(entry.name)) continue;
      const absolutePath = join(directory, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }
      if (!entry.isFile()) continue;
      const rel = relative(absoluteRoot, absolutePath).replace(/\\/g, '/');
      add(classifyWorksetPath(rel), statSync(absolutePath).size);
    }
  }

  walk(absoluteRoot);
  const ordered = [...categories.entries()]
    .map(([category, value]) => ({
      category,
      files: value.files,
      bytes: value.bytes,
      fileShare: totalFiles ? value.files / totalFiles : 0,
      byteShare: totalBytes ? value.bytes / totalBytes : 0
    }))
    .sort((a, b) => b.bytes - a.bytes || b.files - a.files || a.category.localeCompare(b.category));

  return Object.freeze({
    root: absoluteRoot,
    totalFiles,
    totalBytes,
    categories: Object.freeze(ordered.map(Object.freeze))
  });
}

function parseArgs(argv) {
  let root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
  let json = false;
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') json = true;
    else if (arg === '--root') root = argv[++index];
    else if (arg === '--help' || arg === '-h') return { help: true, root, json };
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!root) throw new Error('--root requires a path');
  return { help: false, root, json };
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KiB`;
  return `${(bytes / 1024 ** 2).toFixed(2)} MiB`;
}

function formatPercent(value) { return `${(value * 100).toFixed(1)}%`; }

export function formatRepositoryWorkset(report) {
  const lines = [
    `Repository workset: ${report.totalFiles} files, ${formatBytes(report.totalBytes)}`,
    'Category                         Files     Bytes   File %   Byte %'
  ];
  for (const item of report.categories) {
    lines.push(`${item.category.padEnd(31)} ${String(item.files).padStart(6)} ${formatBytes(item.bytes).padStart(9)} ${formatPercent(item.fileShare).padStart(8)} ${formatPercent(item.byteShare).padStart(8)}`);
  }
  return lines.join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const options = parseArgs(process.argv.slice(2));
    if (options.help) {
      console.log('Usage: node tools/measure-tooling-workset.mjs [--root <path>] [--json]');
      process.exit(0);
    }
    const report = measureRepositoryWorkset(options.root);
    console.log(options.json ? JSON.stringify(report, null, 2) : formatRepositoryWorkset(report));
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
