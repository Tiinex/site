export const verseContextAvailability = Object.freeze({
  universe: Object.freeze({
    meaning: 'root entry context over one or more workspaces',
    implemented: ['column'],
    planned: ['atlas', 'desktop']
  }),
  workspace: Object.freeze({
    meaning: 'single workspace context with its own source boundary',
    implemented: ['feed', 'tree', 'map'],
    planned: ['desktop', 'gallery']
  }),
  artifact: Object.freeze({
    meaning: 'single artifact context',
    implemented: [],
    planned: ['detail', 'lineage', 'preview']
  }),
  report: Object.freeze({
    meaning: 'audit or validation report context',
    implemented: [],
    planned: ['audit-report']
  })
});

export function isVerseImplementedInContext(context, verseId) {
  return Boolean(verseContextAvailability[context]?.implemented.includes(verseId));
}
