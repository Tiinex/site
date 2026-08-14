export const WORKSPACE_ARTIFACT_ROLE_SCHEMA = 'tiinex.workspace.artifact.role.v1';

export function isWorkspaceEntrypointArtifact(record = {}) {
  const path = recordPath(record);
  if (isSchemaDefinitionPath(path)) return false;
  if (isWorkspaceArtifactPath(path)) return true;
  const role = record?.workspaceArtifactRole;
  return Boolean(role && role.schema === WORKSPACE_ARTIFACT_ROLE_SCHEMA && (role.openEligible === true || role.mergeEligible === true));
}

export function workspaceEntrypointCapability(record = {}) {
  const eligible = isWorkspaceEntrypointArtifact(record);
  const role = record?.workspaceArtifactRole || {};
  return Object.freeze({
    schema: 'tiinex.workspace.entrypoint.capability.v1',
    eligible,
    open: Boolean(eligible && role.openEligible !== false),
    merge: Boolean(eligible && role.mergeEligible !== false),
    source: explicitWorkspaceArtifactRole(record) ? 'explicit-role' : (isWorkspaceArtifactPath(recordPath(record)) ? 'workspace-path' : 'none')
  });
}

export function isWorkspaceArtifactPath(value = '') {
  const path = String(value || '').trim().toLowerCase();
  if (!path) return false;
  return /(?:^|\/)[^/]+\.workspace(?:\s*\(\d+\))?\.md$/iu.test(path);
}

export function isSchemaDefinitionPath(value = '') {
  const path = String(value || '').trim().toLowerCase();
  return /(?:^|\/)[^/]+\.(?:schema|validator)\.md$/iu.test(path)
    || path.includes('/schemas/')
    || path.includes('/schema/')
    || path.endsWith('schema.json');
}

function explicitWorkspaceArtifactRole(record = {}) {
  const role = record?.workspaceArtifactRole;
  return Boolean(role && role.schema === WORKSPACE_ARTIFACT_ROLE_SCHEMA && (role.openEligible === true || role.mergeEligible === true));
}

function recordPath(record = {}) {
  return String(record.path || record.sourcePath || record.sourceTarget?.sourceArtifactPath || record.name || '').trim();
}
