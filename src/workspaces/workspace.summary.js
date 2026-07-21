export function summarizeWorkspaceMaterial(workspace = {}) {
  const records = Array.isArray(workspace.records) ? workspace.records : [];
  const assets = Array.isArray(workspace.assets) ? workspace.assets : [];
  const candidates = Array.isArray(workspace.workspaceMergeCandidates) ? workspace.workspaceMergeCandidates : [];
  const sources = Array.isArray(workspace.sources) ? workspace.sources : [];
  const importResults = Array.isArray(workspace.importResults) ? workspace.importResults : [];
  const sourceBackedRecords = records.filter((record) => record?.source?.adapterId && record.source.adapterId !== 'local');
  const localRecords = records.filter((record) => !record?.source?.adapterId || record.source.adapterId === 'local' || record.source?.kind === 'local-session');
  const latestImport = importResults[0] || null;
  return {
    schema: 'tiinex.workspace.material.summary.v1',
    counts: {
      records: records.length,
      assets: assets.length,
      workspaceCandidates: candidates.length,
      sources: sources.length,
      localRecords: localRecords.length,
      sourceBackedRecords: sourceBackedRecords.length,
      warnings: Number(latestImport?.counts?.warnings || 0),
      errors: Number(latestImport?.counts?.errors || 0),
      previewOmitted: Number(latestImport?.counts?.previewOmitted || 0)
    },
    latestImport: latestImport ? {
      ok: latestImport.ok !== false,
      message: String(latestImport.message || 'Import completed.').slice(0, 220),
      at: latestImport.at || '',
      warnings: Array.isArray(latestImport.warnings) ? latestImport.warnings.slice(0, 3) : [],
      errors: Array.isArray(latestImport.errors) ? latestImport.errors.slice(0, 3) : [],
      diagnostics: latestImport.diagnostics || {}
    } : null,
    hasMaterial: Boolean(records.length || assets.length || candidates.length),
    hasSourceBackedMaterial: Boolean(sourceBackedRecords.length),
    hasLocalMaterial: Boolean(localRecords.length || assets.length || candidates.length)
  };
}

export function shouldShowWorkspaceSummary(summary = {}) {
  return Boolean(summary.hasMaterial || summary.latestImport);
}
