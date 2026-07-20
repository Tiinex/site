import assert from 'assert';
import { collectLocalFilesFromDataTransfer, isMarkdownLikeFileName, materializeLocalMarkdownFiles } from './local.adapter.js';

const encoder = new TextEncoder();
function localFile(name, text, webkitRelativePath = name, type = '') {
  const bytes = encoder.encode(text);
  return {
    name,
    webkitRelativePath,
    relativePath: webkitRelativePath,
    size: bytes.byteLength,
    type,
    lastModified: Date.UTC(2026, 0, 1),
    text: async () => text,
    arrayBuffer: async () => bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength)
  };
}

assert(isMarkdownLikeFileName('a.md'), 'md should be recognized');
assert(isMarkdownLikeFileName('topic.trace.md'), 'trace markdown should be recognized');
assert(!isMarkdownLikeFileName('image.png'), 'png should not be recognized as markdown');

const filesResult = await materializeLocalMarkdownFiles([
  localFile('a.md', '# A\n\nBody', 'folder/a.md'),
  localFile('b.png', 'binary', 'folder/b.png', 'image/png')
]);
assert.equal(filesResult.adapterId, 'local', 'local adapter should own local material result');
assert.equal(filesResult.records.length, 1, 'local adapter should materialize one markdown file');
assert.equal(filesResult.records[0].path, 'folder/a.md', 'local adapter should preserve relative paths');
assert.equal(filesResult.assets.length, 1, 'local adapter should preserve non-markdown folder files as assets');
assert.equal(filesResult.assets[0].path, 'folder/b.png', 'local adapter should preserve asset relative path');
assert.equal(filesResult.warnings.length, 0, 'preserved assets should not be treated as unsupported warnings');

function fileEntry(name, text) {
  return {
    isFile: true,
    isDirectory: false,
    name,
    file(resolve) {
      resolve(localFile(name, text, name));
    }
  };
}
function dirEntry(name, entries) {
  return {
    isFile: false,
    isDirectory: true,
    name,
    createReader() {
      let done = false;
      return {
        readEntries(resolve) {
          if (done) return resolve([]);
          done = true;
          resolve(entries);
        }
      };
    }
  };
}
const dropped = await collectLocalFilesFromDataTransfer({
  items: [
    { webkitGetAsEntry: () => dirEntry('root', [fileEntry('one.md', '# One'), dirEntry('nested', [fileEntry('two.trace.md', '# Two')])]) }
  ],
  files: []
});
assert.equal(dropped.length, 2, 'directory drop should recursively collect files');
assert(dropped.some((file) => file.webkitRelativePath === 'root/one.md'), 'root file path should be preserved');
assert(dropped.some((file) => file.webkitRelativePath === 'root/nested/two.trace.md'), 'nested file path should be preserved');
assert.equal(typeof dropped[0].arrayBuffer, 'function', 'wrapped dropped files must preserve arrayBuffer for zip/archive routing');

console.log('✓ local adapter tests passed');
