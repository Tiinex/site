export const multiverseModel = {
  type: 'tiinex.web.multiverse.model.v1',
  status: 'runtime-projection-supported',
  definition: 'A Multiverse is a layout containing multiple active Verse panes over one or more workspace/material contexts.',
  firstRuntimeTarget: 'column-verse + node-graph Multi-Verse projection',
  nestingPolicy: 'recursive multiverses are allowed when expanding into a new context; roundtrip cycles in the active expansion path are blocked',
  noMaxDepth: true,
  cycleGuardKey: ['workspaceId', 'verseId', 'materialScopeId', 'sourceBoundaryId'],
  graphBoundary: 'Multi-Verse may colocate several workspace graph projections while retaining workspace/source boundaries and exact declared cross-workspace relations; layout never implies authority.'
};
