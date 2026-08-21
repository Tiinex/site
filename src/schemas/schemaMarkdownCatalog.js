import { schemaRegistry } from './registry.js';

// Derived schema reading-contract metadata. Installed module-owned schemaSource is the single bundled source truth.
export const schemaMarkdownCatalog = Object.freeze(Object.fromEntries(
  (schemaRegistry.modules || []).flatMap((module) => {
    const source = module?.schemaSource;
    if (source?.readable !== true || !source?.bundledPath) return [];
    return [[module.id, Object.freeze({
      schemaId: module.id,
      path: source.bundledPath,
      sourceLabel: source.sourceLabel || 'Viewer schema registry',
      checksum: source.expectedChecksum || '',
      authority: source.authority || null
    })]];
  })
));

export function schemaCatalogEntryForId(schemaId = '') { const id = String(schemaId || '').trim(); return id ? schemaMarkdownCatalog[id] || null : null; }
export function schemaFilenameForId(schemaId = '') { const id = String(schemaId || '').trim(); return id ? `${id}.schema.md` : ''; }
