export function summarizeFindings(findings = []) {
  const summary = { error: 0, warning: 0, info: 0, preserve: 0 };
  for (const finding of findings) {
    if (Object.hasOwn(summary, finding.severity)) summary[finding.severity] += 1;
  }
  return summary;
}
