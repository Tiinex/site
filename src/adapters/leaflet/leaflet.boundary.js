export const leafletRendererBoundary = Object.freeze({
  id: 'tiinex.renderer.leaflet.boundary.v1',
  renderer: 'Leaflet',
  status: 'planned-adapter-boundary',
  owns: ['pan/zoom rendering mechanics when introduced', 'plane interaction implementation'],
  doesNotOwn: ['Verse semantics', 'source truth', 'schema semantics', 'validation result semantics'],
  currentRuntimeDependency: false
});
