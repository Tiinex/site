export const REFERENCE_SHAPE_QUALIFIER_SCHEMA_ID = 'tiinex.site.reference-shape-qualifier.v1';

export function qualifyReferenceShape(shapeLabel = '', value = '') {
  const shape = String(shapeLabel || '').trim();
  const text = String(value ?? '');
  if (shape === 'Markdown Link') return result(isMarkdownLink(text) ? 'matched' : 'not-matched', shape);
  if (shape === 'Plain Schema Id') return result(isPlainSchemaId(text) ? 'matched' : 'not-matched', shape);
  if (shape === 'Relative Path') return result(isRelativePath(text) ? 'matched' : 'not-matched', shape);
  return result('unresolved', shape);
}

export function isMarkdownLink(value = '') {
  return /^\[[^\]\r\n]+\]\([^)\s]+\)$/.test(String(value || ''));
}

export function isPlainSchemaId(value = '') {
  const text = String(value || '');
  return Boolean(text) && text === text.trim() && !/[\s/\\()[\]]/.test(text) && !/^[a-z][a-z0-9+.-]*:/i.test(text);
}

export function isRelativePath(value = '') {
  const text = String(value || '');
  return Boolean(text)
    && text === text.trim()
    && !text.startsWith('record:')
    && !/^[a-z][a-z0-9+.-]*:/i.test(text)
    && !/^[\\/]/.test(text)
    && !/\s/.test(text);
}

function result(qualification, shapeLabel) {
  return Object.freeze({ schema: REFERENCE_SHAPE_QUALIFIER_SCHEMA_ID, qualification, shapeLabel });
}
