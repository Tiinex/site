export const handoffPlaythingsPresentationCompanion = Object.freeze({
  schema: 'tiinex.playthings.presentation.companion.experimental.v1',
  targetSchemaId: 'tiinex.handoff.v1',
  stationKind: 'handoff-scene',
  interactionKind: 'receive',
  districtKind: 'passage',
  worldRole: 'transition',
  persistenceKind: 'none',
  placementKind: 'nearest-free',
  arrivalKind: 'organization-receiver',
  summary: 'Handoff presentation: a receiving Plaything may emerge from the nearest already-built organizational spawn place and run to the handoff scene. It does not manufacture a relation or route.'
});
