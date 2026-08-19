export function workspaceValidate(artifact = {}) {
  const findings = [];
  if (artifact?.envelope?.current?.schema?.id !== 'tiinex.workspace.v1') {
    findings.push({ severity: 'warning', code: 'workspace.schema.mismatch', message: 'Workspace validator invoked for a non-workspace current schema.', source: 'tiinex.workspace.v1' });
    return findings;
  }
  if (!artifact?.body?.title) findings.push({ severity: 'error', code: 'workspace.title.missing', message: 'Workspace artifact should begin with a human-readable display name.', source: 'tiinex.workspace.v1', fixability: 'safe' });
  if (!String(artifact?.body?.text || '').trim()) findings.push({ severity: 'error', code: 'workspace.body.missing', message: 'Workspace artifact should contain a readable Markdown body.', source: 'tiinex.workspace.v1', fixability: 'manual' });
  return findings;
}
