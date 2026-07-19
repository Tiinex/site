export function upsertWorkspaceRecord(workspace, record, limit = 8) {
  return { ...workspace, activeId: record.id, records: [record].concat((workspace.records || []).filter((item) => item.id !== record.id)).slice(0, limit) };
}
