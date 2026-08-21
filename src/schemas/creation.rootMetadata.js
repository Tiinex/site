export function canonicalRootCreatedAt(value) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(value)) return value;
  const date = value instanceof Date ? value : new Date(value);
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) throw new Error('creation-created-at-unrepresentable');
  return date.toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');
}
