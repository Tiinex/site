import assert from 'node:assert/strict';
import { discoverPortableHostCapabilities } from './host.capabilities.js';

const discovered = discoverPortableHostCapabilities({
  tools: [
    { name: 'GitHub.search', description: 'Search files within a repository.' },
    { name: 'GitHub.fetch_file', description: 'Fetch file content by repository path.' },
    { name: 'container.exec', description: 'Execute shell commands and read local files or zip archives.' },
    { name: 'container.open_image', description: 'Open an image for multimodal analysis.' },
    { name: 'GitHub.update_file', description: 'Update a repository file.' }
  ]
});

assert.equal(discovered.profile.capabilities.materialAccess.repositorySearch, true);
assert.equal(discovered.profile.capabilities.materialAccess.repositoryRead, true);
assert.equal(discovered.profile.capabilities.materialAccess.archiveRead, true);
assert.equal(discovered.profile.capabilities.multimodal.images, true);
assert.equal(discovered.profile.capabilities.mutation.remoteWriteAvailable, true);
assert.equal(discovered.profile.capabilities.mutation.remoteWriteAuthorized, false);
assert.equal(discovered.profile.toolBindings.repositorySearch.selected.tool.name, 'GitHub.search');
assert.equal(discovered.profile.toolBindings.repositoryRead.selected.tool.name, 'GitHub.fetch_file');
assert.equal(discovered.routes['resolve-unknown-schema'].status, 'ready');
assert.equal(discovered.routes['analyze-image-asset'].status, 'ready');
assert.equal(discovered.routes['publish-or-remote-write'].status, 'blocked');
assert.equal(discovered.routes['materialize-durable-findings'].status, 'ready');
assert.equal(discovered.routes['qualify-checkpoint'].status, 'ready');
assert.equal(discovered.routes['create-checkpoint'].status, 'ready');
assert.equal(discovered.routes['build-runtime-package'].sequence.includes('optional-local-zip-write'), false);


const explicitProfile = discoverPortableHostCapabilities({
  materialAccess: { archiveRead: true, repositorySearch: true, repositoryRead: true },
  execution: { javascript: true },
  multimodal: { images: true },
  mutation: { remoteWriteAvailable: true, remoteWriteAuthorized: false }
});
assert.equal(explicitProfile.profile.capabilities.materialAccess.repositoryRead, true);
assert.equal(explicitProfile.profile.capabilities.execution.javascript, true);
assert.equal(explicitProfile.profile.capabilities.multimodal.images, true);
assert.equal(explicitProfile.profile.capabilities.mutation.remoteWriteAuthorized, false);
assert.equal(explicitProfile.routes['build-runtime-package'].status, 'ready');

console.log('✓ portable host capability discovery and equivalent-tool routing passed');
