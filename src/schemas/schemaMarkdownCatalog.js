// Generated schema reading-contract metadata. Source Markdown files remain authoritative.
export const schemaMarkdownCatalog = Object.freeze({
  "tiinex.evidence.v1": Object.freeze({ schemaId: "tiinex.evidence.v1", path: "src/schemas/core/evidence/tiinex.evidence.v1.schema.md", sourceLabel: 'Viewer schema registry' }),
  "tiinex.preservation.v1": Object.freeze({ schemaId: "tiinex.preservation.v1", path: "src/schemas/core/preservation/tiinex.preservation.v1.schema.md", sourceLabel: 'Viewer schema registry' }),
  "tiinex.task.v1": Object.freeze({ schemaId: "tiinex.task.v1", path: "src/schemas/core/task/tiinex.task.v1.schema.md", sourceLabel: 'Viewer schema registry' }),
  "tiinex.topic.v1": Object.freeze({ schemaId: "tiinex.topic.v1", path: "src/schemas/core/topic/tiinex.topic.v1.schema.md", sourceLabel: 'Viewer schema registry' }),
  "tiinex.presentation.surface.v1": Object.freeze({ schemaId: "tiinex.presentation.surface.v1", path: "src/schemas/presentation/surface/tiinex.presentation.surface.v1.schema.md", sourceLabel: 'Viewer schema registry' }),
  "tiinex.schema.module.v1": Object.freeze({ schemaId: "tiinex.schema.module.v1", path: "src/schemas/schema/module/tiinex.schema.module.v1.schema.md", sourceLabel: 'Viewer schema registry' }),
  "tiinex.root.v1": Object.freeze({ schemaId: "tiinex.root.v1", path: "src/schemas/tiinex.root.v1.schema.md", sourceLabel: 'Viewer schema registry' }),
  "tiinex.workspace.v1": Object.freeze({ schemaId: "tiinex.workspace.v1", path: "src/schemas/workspace/tiinex.workspace.v1.schema.md", sourceLabel: 'Viewer schema registry' }),
});

export function schemaCatalogEntryForId(schemaId = '') { const id = String(schemaId || '').trim(); return id ? schemaMarkdownCatalog[id] || null : null; }
export function schemaFilenameForId(schemaId = '') { const id = String(schemaId || '').trim(); return id ? `${id}.schema.md` : ''; }
