export function playthingsArtifactMaterialPath(node = {}, record = {}) {
  const candidates = [node.path, record.path, record.sourcePath, record.source?.path, record.sourceTarget?.sourceArtifactPath, record.snapshot?.sourceArtifactPath];
  return String(candidates.find((value) => String(value || '').trim()) || '');
}

export function isPlaythingsSchemaDocument(node = {}, record = {}) {
  return /\.schema\.md$/i.test(playthingsArtifactMaterialPath(node, record));
}
