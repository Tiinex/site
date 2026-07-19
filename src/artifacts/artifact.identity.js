export function localArtifactIdentity(parsedArtifact) {
  const schema = parsedArtifact.envelope.current.schema.id || 'unknown-schema';
  const title = parsedArtifact.title || 'untitled';
  const createdAt = parsedArtifact.envelope.current.createdAt || 'unknown-time';
  return `${schema}::${createdAt}::${title}`;
}
