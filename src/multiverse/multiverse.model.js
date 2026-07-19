export const multiverseModel = {
  type: 'tiinex.web.multiverse.model.v1',
  status: 'concept-scaffold',
  definition: 'A Multiverse is a layout containing multiple active Verse panes over one or more workspace/material contexts.',
  firstRuntimeTarget: 'column-verse',
  nestingPolicy: 'recursive multiverses are allowed when expanding into a new context; roundtrip cycles in the active expansion path are blocked',
  noMaxDepth: true,
  cycleGuardKey: ['workspaceId', 'verseId', 'materialScopeId', 'sourceBoundaryId']
};
