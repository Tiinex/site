export function topicValidate(artifact) {
  const findings = [];
  if (artifact.envelope.current.schema.id !== 'tiinex.topic.v1') {
    findings.push({ severity: 'warning', code: 'topic.schema.mismatch', messageKey: 'topic.schema.mismatch', message: 'Topic validator invoked for non-topic current schema.', source: 'tiinex.topic.v1' });
    return findings;
  }
  if (!artifact.body.title) findings.push({ severity: 'error', code: 'topic.title.missing', messageKey: 'topic.title.missing', message: 'Topic artifact should begin with a human-readable title.', source: 'tiinex.topic.v1', fixability: 'safe' });
  if (!artifact.body.text || artifact.body.text.length < 40) findings.push({ severity: 'warning', code: 'topic.body.thin', messageKey: 'topic.body.thin', message: 'Topic body is thin; reader may not understand the active topic thread.', source: 'tiinex.topic.v1', fixability: 'manual' });
  if (!findings.some((finding) => finding.severity === 'error')) findings.push({ severity: 'info', code: 'topic.body.readable', messageKey: 'topic.body.readable', message: 'Topic body is readable at scaffold validation depth.', source: 'tiinex.topic.v1' });
  return findings;
}
