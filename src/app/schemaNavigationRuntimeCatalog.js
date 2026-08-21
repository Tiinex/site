import { resolveSchemaModule } from '../schemas/resolver.js';
import { schemaCatalogEntryForId } from '../schemas/schemaMarkdownCatalog.js';
import { qualifyBundledSchemaReadableText, qualifyBundledSchemaSource } from '../schemas/schema.source.js';

export async function loadViewerSchemaMarkdown(schemaId = '', fetchImpl = globalThis.fetch) {
  const id = String(schemaId || '').trim();
  const entry = schemaCatalogEntryForId(id);
  const resolution = resolveSchemaModule({ schemaId: id });
  const source = resolution?.fallbackUsed ? null : resolution?.module?.schemaSource;
  if (!entry || source?.readable !== true) return null;
  const qualification = qualifyBundledSchemaSource(source);
  if (qualification.state !== 'qualified') return null;
  if (!source.assetUrl || typeof fetchImpl !== 'function') return null;
  const response = await fetchImpl(source.assetUrl);
  if (!response?.ok) throw new Error(`schema.fetch.failed:${response?.status || 'unknown'}`);
  const markdown = await response.text();
  const readableQualification = qualifyBundledSchemaReadableText(source, markdown);
  if (readableQualification.state !== 'qualified') return null;
  return Object.assign({}, entry, {
    markdown,
    assetUrl: source.assetUrl,
    sourceQualification: qualification,
    readableQualification
  });
}
