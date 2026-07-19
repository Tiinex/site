export const verseRegistry = Object.freeze({
  root: 'universe',
  defaultMultiverse: 'column',
  visibleImplementedVerses: ['universe', 'column', 'feed', 'tree'],
  contexts: Object.freeze({
    universe: Object.freeze({ implemented: ['column'], planned: ['atlas'] }),
    workspace: Object.freeze({ implemented: ['feed', 'tree'], planned: ['map'] }),
    artifact: Object.freeze({ implemented: [], planned: ['detail', 'lineage', 'preview'] }),
    report: Object.freeze({ implemented: [], planned: ['audit-report'] })
  }),
  renderersAreAdapters: true,
  showOnlyImplementedInPrimaryUi: true
});

export function getImplementedVersesForContext(context) {
  return verseRegistry.contexts[context]?.implemented || [];
}

export function getPlannedVersesForContext(context) {
  return verseRegistry.contexts[context]?.planned || [];
}
