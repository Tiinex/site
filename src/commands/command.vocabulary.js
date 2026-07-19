// Command vocabulary is UI-neutral on purpose.
// The browser UI, future CLI, and remote-control surfaces should bind to these command ids
// instead of inventing separate semantics per renderer.

export const commandVocabulary = [
  { id: 'open', scope: 'workspace', cli: 'tiinex workspace open <id>', status: 'implemented-scaffold' },
  { id: 'merge', scope: 'lineage', cli: 'tiinex lineage merge <id>', status: 'scaffold' },
  { id: 'source', scope: 'source', cli: 'tiinex source show <id>', status: 'scaffold' },
  { id: 'audit', scope: 'audit', cli: 'tiinex audit loaded', status: 'loaded-only' },
  { id: 'markdown', scope: 'artifact', cli: 'tiinex artifact markdown <id>', status: 'scaffold' },
  { id: 'preview', scope: 'artifact', cli: 'tiinex artifact preview <id>', status: 'scaffold' },
  { id: 'edit', scope: 'draft', cli: 'tiinex draft edit <id>', status: 'scaffold' },
  { id: 'share', scope: 'transport', cli: 'tiinex artifact share <id>', status: 'scaffold' }
];
