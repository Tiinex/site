import { readFile, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const LEGACY_PREFIX = '.topics/development/';
const FIXTURE_ROOT = new URL('./legacy-artifacts/', import.meta.url);

export function legacyArtifactFixtureUrl(logicalPath) {
  const normalized = String(logicalPath || '').replaceAll('\\', '/');
  if (!normalized.startsWith(LEGACY_PREFIX)) {
    throw new Error(`legacy fixture path must start with ${LEGACY_PREFIX}`);
  }
  const relative = normalized.slice(LEGACY_PREFIX.length);
  if (!relative || relative.startsWith('/') || relative.split('/').includes('..')) {
    throw new Error(`unsafe legacy fixture path: ${normalized}`);
  }
  if (!relative.endsWith('.trace.md')) {
    throw new Error(`legacy fixture path must end with .trace.md: ${normalized}`);
  }
  return new URL(`${relative.slice(0, -'.trace.md'.length)}.trace.fixture.txt`, FIXTURE_ROOT);
}

export function legacyArtifactFixturePath(logicalPath) {
  return fileURLToPath(legacyArtifactFixtureUrl(logicalPath));
}

export function readLegacyArtifactFixtureSync(logicalPath, encoding = 'utf8') {
  return readFileSync(legacyArtifactFixtureUrl(logicalPath), encoding);
}

export function readLegacyArtifactFixture(logicalPath, encoding = 'utf8') {
  return new Promise((resolve, reject) => {
    readFile(legacyArtifactFixtureUrl(logicalPath), encoding, (error, data) => error ? reject(error) : resolve(data));
  });
}
