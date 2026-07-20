export function workspaceValidate(workspace = {}) {
  const findings = [];
  if (!workspace.id) findings.push({ severity: 'warning', code: 'workspace.id.missing', message: 'Workspace id is missing.' });
  if (!workspace.title && !workspace.name) findings.push({ severity: 'error', code: 'workspace.name.required', message: 'Workspace name is required.' });
  if (workspace.source?.sourceBacked && workspace.source?.githubPolicy !== 'explicit') {
    findings.push({ severity: 'warning', code: 'workspace.source.boundary.unclear', message: 'Source-backed workspace must declare explicit source policy.' });
  }
  return { ok: !findings.some((finding) => finding.severity === 'error'), findings };
}
