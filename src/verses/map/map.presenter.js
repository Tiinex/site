export const mapVersePresenter = Object.freeze({
  id: 'tiinex.verse.map.presenter.v1',
  provides: 'workspace-map-plane-view-model',
  doesNotProvide: ['source truth', 'validation truth', 'geographic claim', 'lineage completeness'],
  unavailableBehavior: 'fall back to Feed or Tree for the same workspace records'
});
