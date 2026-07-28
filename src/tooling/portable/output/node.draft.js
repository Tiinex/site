import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const PORTABLE_DRAFT_WRITE_RECEIPT_SCHEMA_ID = 'tiinex.portable.draft-write-receipt.v1';

export async function writePortableLocalDraftFile(result = {}, outputPath = '', options = {}) {
  const target = path.resolve(String(outputPath || '').trim());
  if (!String(outputPath || '').trim()) throw new Error('portable.draft-output.path.required');
  if (result?.status !== 'created-clean') throw new Error(`portable.draft-output.not-clean:${result?.status || 'unknown'}`);
  if (!result?.draft?.markdown) throw new Error('portable.draft-output.markdown.required');
  if (result?.validation?.status !== 'clean') throw new Error(`portable.draft-output.validation-not-clean:${result?.validation?.status || 'unknown'}`);
  if (!String(result.draft.sourceMode || '').startsWith('local-')) throw new Error(`portable.draft-output.source-mode.invalid:${result.draft.sourceMode || 'unknown'}`);
  if (result.draft.source) throw new Error('portable.draft-output.source-object.blocked');

  const markdown = normalizeMarkdown(result.draft.markdown);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, markdown, { encoding: 'utf8', flag: options.overwrite === true ? 'w' : 'wx' });
  const bytes = Buffer.byteLength(markdown, 'utf8');
  return Object.freeze({
    schema: PORTABLE_DRAFT_WRITE_RECEIPT_SCHEMA_ID,
    status: 'written-local-clean',
    outputPath: target,
    artifactPath: String(result.draft.path || ''),
    schemaId: String(result.draft.schemaId || result.schemaId || ''),
    bytes,
    sha256: createHash('sha256').update(markdown, 'utf8').digest('hex'),
    validationStatus: result.validation.status,
    sourceMode: result.draft.sourceMode,
    boundary: Object.freeze({
      localOutput: true,
      sourceMutation: false,
      remoteWrite: false,
      overwrite: options.overwrite === true
    })
  });
}

function normalizeMarkdown(value = '') {
  return `${String(value || '').replace(/\r\n/g, '\n').replace(/\s+$/u, '')}\n`;
}
