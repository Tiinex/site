import assert from 'node:assert/strict';
import { packageAssetBytes, sha256Hex, utf8Bytes } from './package.bytes.js';
import { projectPackageSourceReference } from './package.sourceReference.js';
import { buildExportPackagePreflight } from './package.preflight.js';

assert.equal(sha256Hex(utf8Bytes('abc')), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
assert.deepEqual([...packageAssetBytes({ bytes: new Uint8Array([0, 255]) }).bytes], [0, 255]);
assert.deepEqual([...packageAssetBytes({ dataUrl: 'data:image/png;base64,iVBORw0KGgo=' }).bytes], [137, 80, 78, 71, 13, 10, 26, 10]);

const commit = '0123456789abcdef0123456789abcdef01234567';
const repoFile = projectPackageSourceReference({
  path: 'presentation/local.md',
  source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'main', materializedCommit: commit },
  sourceTarget: { surface: 'repoFiles', targetKind: 'github-repo-file', sourceArtifactPath: '.topics/exact.md', materializedCommit: commit }
});
assert.equal(repoFile.status, 'pinned-reference');
assert.equal(repoFile.refKind, 'immutable-commit');
assert.equal(repoFile.ref, commit);
assert.equal(repoFile.configuredRef, 'main');
assert.equal(repoFile.path, '.topics/exact.md');

const branchOnly = projectPackageSourceReference({
  path: '.topics/exact.md',
  source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'main' },
  sourceTarget: { surface: 'repoFiles', targetKind: 'github-repo-file', sourceArtifactPath: '.topics/exact.md' }
});
assert.equal(branchOnly.status, 'degraded-reference');
assert.equal(branchOnly.refKind, 'mutable-or-unqualified-ref');
assert.equal(branchOnly.materializedCommit, '');

const commentUrl = 'https://github.com/Tiinex/docs/issues/3#issuecomment-99';
const comment = projectPackageSourceReference({
  path: '.topics/.github/Tiinex/docs/.issues/3/000.trace.md',
  source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'main', materializedCommit: commit },
  sourceTarget: { inputTarget: commentUrl, targetKind: 'github-issue-comment', surface: 'issueSnapshots', materializedCommit: commit }
});
assert.equal(comment.status, 'pinned-reference');
assert.equal(comment.inputTarget, commentUrl);
assert.equal(comment.targetKind, 'github-issue-comment');

const externalUrl = 'https://a.example.test/path/001.trace.md?rev=2';
const external = projectPackageSourceReference({
  path: 'presentation/001.trace.md',
  source: { adapterId: 'external-web' },
  sourceTarget: { inputTarget: externalUrl, rawUrl: externalUrl, targetKind: 'external-web-artifact' }
});
assert.equal(external.status, 'exact-target-reference');
assert.equal(external.inputTarget, externalUrl);
assert.equal(external.refKind, 'unpinned');

const sourceAsset = { id: 'remote', path: 'assets/remote.bin', content: 'loaded-preview-bytes', source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'main', materializedCommit: commit }, sourceTarget: { surface: 'repoFiles', sourceArtifactPath: 'assets/remote.bin', targetKind: 'github-repo-file', materializedCommit: commit } };
const preflight = buildExportPackagePreflight({ id: 'w', title: 'Source asset', records: [], assets: [sourceAsset] });
assert.equal(preflight.assetEntries[0].status, 'source-reference');
assert.equal(preflight.assetEntries[0].sourceReference.materializedCommit, commit);
assert.equal(preflight.assetEntries[0].mode, 'asset-source-reference');
const degradedAsset = buildExportPackagePreflight({ id: 'w-degraded-asset', records: [], assets: [{ id: 'branch-asset', path: 'assets/branch.bin', content: 'preview', source: { adapterId: 'github', repo: 'Tiinex/docs', ref: 'main' }, sourceTarget: { surface: 'repoFiles', sourceArtifactPath: 'assets/branch.bin' } }] });
assert.equal(degradedAsset.status, 'degraded');
assert.ok(degradedAsset.findings.some((finding) => finding.code === 'export.package.asset.source-reference.degraded'));

console.log('export.package.sourceAuthority: ok');
