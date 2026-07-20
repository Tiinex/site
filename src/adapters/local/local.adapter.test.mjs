import assert from 'assert';
import { collectLocalFilesFromDataTransfer, isMarkdownLikeFileName, materializeLocalMarkdownFiles } from './local.adapter.js';

assert(isMarkdownLikeFileName('a.md'), 'md should be recognized');
assert(isMarkdownLikeFileName('topic.trace.md'), 'trace markdown should be recognized');
assert(!isMarkdownLikeFileName('image.png'), 'png should not be recognized');

const filesResult = await materializeLocalMarkdownFiles([
  { name: 'a.md', webkitRelativePath: 'folder/a.md', text: async () => '# A\n\nBody' },
  { name: 'b.png', webkitRelativePath: 'folder/b.png', text: async () => 'binary' }
]);
assert(filesResult.records.length === 1, 'local adapter should materialize one markdown file');
assert(filesResult.records[0].path === 'folder/a.md', 'local adapter should preserve relative paths');
assert(filesResult.warnings.length === 1, 'local adapter should warn for unsupported files');

function fileEntry(name, text) {
  return {
    isFile: true,
    isDirectory: false,
    name,
    file(resolve) {
      resolve({ name, text: async () => text });
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
assert(dropped.length === 2, 'directory drop should recursively collect files');
assert(dropped.some((file) => file.webkitRelativePath === 'root/one.md'), 'root file path should be preserved');
assert(dropped.some((file) => file.webkitRelativePath === 'root/nested/two.trace.md'), 'nested file path should be preserved');

console.log('✓ local adapter tests passed');
