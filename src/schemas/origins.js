(function attachSchemaOrigins(global) {
  'use strict';

  const DEFAULT_SCHEMA_ORIGINS = Object.freeze([
    Object.freeze({ id: 'tiinex-docs', label: 'Tiinex docs schemas', kind: 'github-tree', repository: 'Tiinex/docs', ref: 'master', rootPath: '.topics/.schemas', trustRole: 'canonical-core' }),
    Object.freeze({ id: 'viewer-local', label: 'Viewer local schemas', kind: 'app-local', repository: 'Tiinex/site', rootPath: 'src/schemas', trustRole: 'viewer-extension' })
  ]);

  function normalizeSchemaOrigin(origin = {}) {
    const label = String(origin.title || origin.label || origin.name || '').trim();
    const repository = String(origin.repository || '').trim();
    const rootPath = String(origin.rootPath || origin.path || '').trim();
    const kind = String(origin.kind || 'app-local').trim();
    return {
      id: String(origin.id || `${kind}:${repository || rootPath || label}`).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'schema-origin',
      label,
      href: String(origin.href || origin.url || '').trim(),
      kind,
      repository,
      ref: String(origin.ref || '').trim(),
      rootPath,
      trustRole: String(origin.trustRole || 'extension').trim(),
      purpose: String(origin.purpose || '').trim()
    };
  }

  function schemaOriginsFromWorkspaceConfig(config = {}) {
    const configured = Array.isArray(config.schemaOrigins) ? config.schemaOrigins : [];
    const normalized = configured.map(normalizeSchemaOrigin).filter((origin) => origin.label || origin.repository || origin.rootPath);
    return normalized.length ? normalized : DEFAULT_SCHEMA_ORIGINS.map(normalizeSchemaOrigin);
  }

  function originCanProvideSchema(origin = {}, schemaId = '') {
    if (!schemaId) return false;
    const role = String(origin.trustRole || '').toLowerCase();
    if (role.includes('canonical')) return true;
    return role.includes('extension') || String(origin.kind || '').includes('local');
  }

  global.TiinexSchemaOrigins = {
    DEFAULT_SCHEMA_ORIGINS,
    normalizeSchemaOrigin,
    originCanProvideSchema,
    schemaOriginsFromWorkspaceConfig
  };
})(typeof window !== 'undefined' ? window : globalThis);
