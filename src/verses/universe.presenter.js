export function presentUniverse(universeProjection) {
  return {
    title: 'Universe',
    subtitle: 'Column Multiverse entry',
    panes: universeProjection?.panes || [],
    disclosure: 'Arrangement changes layout only; source truth remains owned by each workspace pane.'
  };
}
