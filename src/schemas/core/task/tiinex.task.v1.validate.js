export function taskValidate(artifact) {
  const findings = [];
  if (artifact.envelope.current.schema.id !== 'tiinex.task.v1') {
    findings.push({ severity: 'warning', code: 'task.schema.mismatch', messageKey: 'task.schema.mismatch', message: 'Task validator invoked for non-task current schema.', source: 'tiinex.task.v1' });
    return findings;
  }
  const body = String(artifact.body?.text || '');
  if (!artifact.body.title) findings.push({ severity: 'error', code: 'task.title.missing', messageKey: 'task.title.missing', message: 'Task artifact should begin with a human-readable title.', source: 'tiinex.task.v1', fixability: 'safe' });
  if (!body || body.length < 40) findings.push({ severity: 'warning', code: 'task.body.thin', messageKey: 'task.body.thin', message: 'Task body is thin; the next action may be unclear.', source: 'tiinex.task.v1', fixability: 'manual' });
  if (!/^##\s+Next Step\b/im.test(body)) findings.push({ severity: 'warning', code: 'task.nextStep.missing', messageKey: 'task.nextStep.missing', message: 'Task body does not include a Next Step section yet.', source: 'tiinex.task.v1', fixability: 'manual' });
  if (!findings.some((finding) => finding.severity === 'error')) findings.push({ severity: 'info', code: 'task.body.readable', messageKey: 'task.body.readable', message: 'Task body is readable at scaffold validation depth.', source: 'tiinex.task.v1' });
  return findings;
}
