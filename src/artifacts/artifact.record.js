import { parseArtifactMarkdown } from './artifact.parse.js';

export function createRecordFromMarkdown(markdown = '', meta = {}) {
  const parsed = parseArtifactMarkdown(markdown || '');
  const schemaId = parsed.envelope?.current?.schema?.id || '';
  return {
    title: parsed.title || meta.name || 'Untitled artifact',
    summary: parsed.envelope?.current?.summary || parsed.body?.sections?.slice(0, 3).join(' · ') || meta.path || 'Local Markdown artifact.',
    kind: schemaId || (parsed.hasContinuityContext ? 'tiinex.artifact' : 'markdown'),
    status: parsed.hasIntegrity ? 'byte ok' : 'local',
    path: meta.path || meta.name || '',
    markdown,
    sourceMode: meta.sourceMode || 'local-manual',
    hasContinuityContext: parsed.hasContinuityContext,
    hasIntegrity: parsed.hasIntegrity
  };
}
