import { resolveSchemaModule } from '../schemas/resolver.js';
import { resolveFindingDefinition } from './findings.js';

export function resolveFindingMessage(finding = {}, options = {}) {
  const code = String(finding.code || '').trim();
  const locale = normalizeLocale(options.locale || 'en');
  const messageKey = String(finding.messageKey || resolveFindingDefinition(code, { source: finding.source })?.messageKey || code).trim();
  const schemaIds = [finding.source, schemaIdFromFindingCode(code), options.schemaId, 'tiinex.root.v1'].filter(Boolean);
  for (const schemaId of [...new Set(schemaIds)]) {
    const message = resolveSchemaMessage(schemaId, messageKey, locale);
    if (message) return interpolate(message, finding.params || options.params || {});
  }
  return finding.message || messageKey || code || 'Validation finding.';
}

export function resolveSchemaMessage(schemaId = '', key = '', locale = 'en') {
  const resolution = resolveSchemaModule({ schemaId });
  const packs = resolution.module?.i18n || {};
  const normalized = normalizeLocale(locale);
  const pack = packs[normalized] || packs[normalized.split('-')[0]] || packs.en || null;
  if (!pack) return '';
  return String(pack[key] || pack.messages?.[key] || '').trim();
}

function normalizeLocale(locale = 'en') { return String(locale || 'en').trim().toLowerCase() || 'en'; }
function schemaIdFromFindingCode(code = '') {
  const text = String(code || '');
  if (text.startsWith('root.')) return 'tiinex.root.v1';
  if (text.startsWith('topic.')) return 'tiinex.topic.v1';
  if (text.startsWith('evidence.')) return 'tiinex.evidence.v1';
  if (text.startsWith('preservation.')) return 'tiinex.preservation.v1';
  if (text.startsWith('workspace.')) return 'tiinex.workspace.v1';
  return '';
}
function interpolate(message = '', params = {}) {
  return String(message || '').replace(/\{([a-zA-Z0-9_.-]+)\}/g, (_, key) => params[key] == null ? `{${key}}` : String(params[key]));
}
