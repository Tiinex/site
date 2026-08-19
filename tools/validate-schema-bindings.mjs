#!/usr/bin/env node
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const schemaRoot = join(root, 'src/schemas');
const failures = [];

function walk(dir) {
  let out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out = out.concat(walk(p));
    else out.push(p);
  }
  return out;
}

function readJson(path) {
  try { return JSON.parse(readFileSync(path, 'utf8')); }
  catch (error) { failures.push(`${path} invalid JSON: ${error.message}`); return {}; }
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex');
}

function posixRel(path) {
  return relative(schemaRoot, path).replaceAll('\\\\', '/').replaceAll('\\', '/');
}

const bindingFiles = walk(schemaRoot).filter((p) => p.endsWith('.schema.json')).sort();
const manifestPath = join(schemaRoot, 'manifest.json');
const manifest = readJson(manifestPath);
const manifestModules = Array.isArray(manifest.modules) ? manifest.modules : [];
const manifestByPath = new Map(manifestModules.map((entry) => [entry.path, entry]));
const seenSchemaIds = new Set();

if (manifest.type !== 'tiinex.web.schema-module.manifest.v1') failures.push('manifest has unexpected type');
if (!manifest.sourceRepository || !manifest.sourceCommit) failures.push('manifest must pin sourceRepository and sourceCommit');
const manifestOrigins = new Map((Array.isArray(manifest.origins) ? manifest.origins : []).map((origin) => [origin.id, origin]));

for (const file of bindingFiles) {
  const binding = readJson(file);
  const rel = posixRel(file);
  const required = ['schemaId', 'kind', 'role', 'module', 'snapshot', 'checksum', 'permalink', 'rawUrl', 'sourcePath', 'sourceRepository', 'sourceCommit', 'sourceBlobSha', 'bindingVersion'];
  for (const key of required) if (!binding[key]) failures.push(`${rel} missing ${key}`);
  if (binding.bindingVersion !== 'tiinex.web.schema-binding.v1') failures.push(`${rel} has unexpected bindingVersion`);
  if (seenSchemaIds.has(binding.schemaId)) failures.push(`duplicate schemaId ${binding.schemaId}`);
  seenSchemaIds.add(binding.schemaId);

  const snap = join(dirname(file), binding.snapshot || '');
  const mod = join(dirname(file), binding.module || '');
  const expectedSnapshotName = `${binding.schemaId}.schema.md`;
  if (binding.snapshot && binding.snapshot.split('/').pop() !== expectedSnapshotName) failures.push(`${rel} snapshot must use canonical filename ${expectedSnapshotName}`);
  for (const alias of Array.isArray(binding.snapshotAliases) ? binding.snapshotAliases : []) {
    if (!existsSync(join(dirname(file), alias))) failures.push(`${rel} snapshot alias missing: ${alias}`);
  }
  if (!existsSync(snap)) failures.push(`${rel} snapshot missing`);
  if (!existsSync(mod)) failures.push(`${rel} module missing`);

  if (existsSync(snap)) {
    const actualSha = sha256(snap);
    if (actualSha !== binding.checksum?.value) failures.push(`${rel} checksum mismatch: ${actualSha} != ${binding.checksum?.value}`);
    const snapshot = readFileSync(snap, 'utf8');
    if (!snapshot.includes('# Continuity Context')) failures.push(`${rel} snapshot missing Continuity Context`);
    if (!snapshot.includes('## Schema Validation Contract')) failures.push(`${rel} snapshot missing Schema Validation Contract`);
    if (!snapshot.includes(binding.schemaId)) failures.push(`${rel} snapshot does not mention schemaId ${binding.schemaId}`);
  }

  if (existsSync(mod)) {
    const moduleSource = readFileSync(mod, 'utf8');
    if (!moduleSource.includes(`id: '${binding.schemaId}'`) && !moduleSource.includes(`id: \"${binding.schemaId}\"`)) failures.push(`${rel} module does not expose matching id`);
    if (!moduleSource.includes(`kind: '${binding.kind}'`) && !moduleSource.includes(`kind: \"${binding.kind}\"`)) failures.push(`${rel} module does not expose matching kind`);
    if (!moduleSource.includes(binding.module.replace('./', './').replace(/\.js$/, '.schema.json')) && !moduleSource.includes('.schema.json')) failures.push(`${rel} module does not import adjacent binding json`);
  }

  const origin = binding.originId ? manifestOrigins.get(binding.originId) : null;
  const trustRole = binding.originTrustRole || origin?.trustRole || 'canonical-core';
  const isViewerExtension = trustRole === 'viewer-extension';
  if (binding.originId && !origin) failures.push(`${rel} originId ${binding.originId} missing from manifest origins`);
  if (isViewerExtension) {
    if (binding.sourceRepository !== 'Tiinex/site') failures.push(`${rel} viewer-extension sourceRepository must be Tiinex/site`);
    if (!String(binding.permalink || '').startsWith('site-local:')) failures.push(`${rel} viewer-extension permalink must use site-local:`);
    if (!String(binding.rawUrl || '').startsWith('site-local:')) failures.push(`${rel} viewer-extension rawUrl must use site-local:`);
  } else {
    const expectedRepository = origin?.repository || manifest.sourceRepository;
    const expectedCommit = origin?.sourceCommit || manifest.sourceCommit;
    if (binding.sourceRepository !== expectedRepository) failures.push(`${rel} sourceRepository differs from declared canonical origin`);
    if (binding.sourceCommit !== expectedCommit) failures.push(`${rel} sourceCommit differs from declared canonical origin`);
    if (!binding.permalink.includes(`/blob/${binding.sourceCommit}/${binding.sourcePath}`)) failures.push(`${rel} permalink is not pinned to sourceCommit/sourcePath`);
    if (!binding.rawUrl.includes(`/${binding.sourceCommit}/${binding.sourcePath}`)) failures.push(`${rel} rawUrl is not pinned to sourceCommit/sourcePath`);
  }

  const manifestEntry = manifestByPath.get(rel);
  if (!manifestEntry) failures.push(`${rel} missing from manifest`);
  else {
    if (manifestEntry.schemaId !== binding.schemaId) failures.push(`${rel} manifest schemaId mismatch`);
    if (manifestEntry.kind !== binding.kind) failures.push(`${rel} manifest kind mismatch`);
    if (manifestEntry.checksum !== binding.checksum?.value) failures.push(`${rel} manifest checksum mismatch`);
    if (manifestEntry.sourceBlobSha !== binding.sourceBlobSha) failures.push(`${rel} manifest sourceBlobSha mismatch`);
    if ((manifestEntry.originId || binding.originId) && manifestEntry.originId !== binding.originId) failures.push(`${rel} manifest originId mismatch`);
    if ((manifestEntry.originTrustRole || binding.originTrustRole) && manifestEntry.originTrustRole !== binding.originTrustRole) failures.push(`${rel} manifest originTrustRole mismatch`);
  }
}

for (const entry of manifestModules) {
  if (!entry.path) failures.push('manifest module missing path');
  else if (!existsSync(join(schemaRoot, entry.path))) failures.push(`manifest points to missing binding ${entry.path}`);
}

if (!existsSync(join(schemaRoot, 'tiinex.root.v1.schema.json'))) failures.push('root schema binding must live directly under src/schemas');
if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log(`✓ schema bindings pinned and manifest-consistent (${bindingFiles.length} modules)`);
