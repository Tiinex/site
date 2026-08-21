import { parseArtifactMarkdown } from '../artifacts/artifact.parse.js';

export function schemaIdForRecord(record = {}, options = {}) {
  const explicit = String(record?.schemaId || record?.currentSchemaId || record?.rootFallback?.currentSchemaId || '').trim();
  if (explicit) return explicit;
  const markdown = String(options.markdown ?? record?.markdown ?? '');
  if (!markdown.trim()) return '';
  try { return String(parseArtifactMarkdown(markdown).envelope?.current?.schema?.id || '').trim(); }
  catch (_) { return ''; }
}
