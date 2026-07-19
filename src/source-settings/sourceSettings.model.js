export const sourceSettingsModel = {
  type: 'tiinex.web.source-settings.model.v1',
  owner: 'src/source-settings',
  modes: ['static-fixture', 'local-file', 'draft', 'github-source-backed'],
  invariant: 'local, draft, and static material remain non-GitHub unless an explicit source descriptor exists',
  ergonomics: 'source state should remain visible as compact chips; detailed explanation belongs in expandable controls'
};
