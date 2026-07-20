import assert from 'assert';
import { isLocalSource, isSourceBacked, normalizeSourceRegistration, SourceKind } from './source.model.js';
import { resolveSourceBoundary, mustNotGuessGithubSource } from './source.boundaries.js';
import { resolveSource } from './source.resolve.js';

const local = normalizeSourceRegistration({ id: 'local', kind: 'local', label: 'Local' });
assert(local.adapterId === 'local', 'local source should infer local adapter');
assert(local.sourceKind === SourceKind.localSession, 'local source should infer local session kind');
assert(isLocalSource(local), 'local source predicate should be true');
assert(!isSourceBacked(local), 'local source should not be source-backed');
assert(mustNotGuessGithubSource(local), 'local source must never require github provenance');

const github = normalizeSourceRegistration({ kind: 'github-tree', repo: 'Tiinex/docs', ref: 'master', rootPath: '.topics' });
assert(github.adapterId === 'github', 'github-tree should infer github adapter');
assert(github.sourceKind === SourceKind.githubRepo, 'github-tree should infer github repo source kind');
assert(github.config.repo === 'Tiinex/docs', 'github config should preserve repo');
assert(isSourceBacked(github), 'github source should be source-backed');

const boundary = resolveSourceBoundary(github);
assert(boundary.githubPolicy === 'explicit', 'github source with repo should be explicit');
assert(boundary.adapterId === 'github', 'boundary should expose adapter id');

const unsafe = resolveSource({ adapterId: 'github', sourceKind: 'github.repo' });
assert(unsafe.githubPolicy === 'not-guessed', 'github source without repo/permalink must not be guessed');

console.log('✓ source model tests passed');
