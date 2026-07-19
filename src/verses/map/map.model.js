export const mapVerseModel = Object.freeze({
  id: 'map',
  context: 'workspace',
  kind: 'spatial-verse',
  status: 'scaffold',
  meaning: 'Arrange one workspace on a bounded plane without changing source truth.',
  rendererBoundary: 'renderer-neutral; DOM/SVG/Canvas/Leaflet/D3/WebGL may implement the same semantics later',
  initialRenderer: 'dom-plane-scaffold',
  mapTiles: false,
  geoAssumptions: false,
  zoom: 'not-enabled-in-v93',
  sourceTruth: 'preserved-per-workspace'
});
