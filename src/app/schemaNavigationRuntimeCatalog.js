import { schemaCatalogEntryForId } from '../schemas/schemaMarkdownCatalog.js';

const schemaAssetUrls = Object.freeze({
  "tiinex.interpretation.v1": new URL("../schemas/core/interpretation/tiinex.interpretation.v1.schema.md", import.meta.url).href,
  "tiinex.evidence.v1": new URL("../schemas/core/evidence/tiinex.evidence.v1.schema.md", import.meta.url).href,
  "tiinex.preservation.v1": new URL("../schemas/core/preservation/tiinex.preservation.v1.schema.md", import.meta.url).href,
  "tiinex.task.v1": new URL("../schemas/core/task/tiinex.task.v1.schema.md", import.meta.url).href,
  "tiinex.topic.v1": new URL("../schemas/core/topic/tiinex.topic.v1.schema.md", import.meta.url).href,
  "tiinex.presentation.surface.v1": new URL("../schemas/presentation/surface/tiinex.presentation.surface.v1.schema.md", import.meta.url).href,
  "tiinex.schema.module.v1": new URL("../schemas/schema/module/tiinex.schema.module.v1.schema.md", import.meta.url).href,
  "tiinex.root.v1": new URL("../schemas/tiinex.root.v1.schema.md", import.meta.url).href,
  "tiinex.workspace.v1": new URL("../schemas/workspace/tiinex.workspace.v1.schema.md", import.meta.url).href,
});

export async function loadViewerSchemaMarkdown(schemaId = '', fetchImpl = fetch) {
  const id = String(schemaId || '').trim();
  const entry = schemaCatalogEntryForId(id);
  const url = schemaAssetUrls[id];
  if (!entry || !url) return null;
  const response = await fetchImpl(url);
  if (!response?.ok) throw new Error(`schema.fetch.failed:${response?.status || 'unknown'}`);
  return Object.assign({}, entry, { markdown: await response.text(), assetUrl: url });
}
