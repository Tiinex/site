import { environment } from './environment.js';
import { schemaRegistry } from '../../schemas/registry.js';
import { defaultReaderModes } from '../../readers/reader.resolve.js';
import { surfaceRegistry } from '../../surfaces/registry.js';
import { auditSeedSummary } from '../../audit/audit.summary.js';
import { t, defaultLocale } from '../../i18n/i18n.resolve.js';

export function createAppModel() {
  return {
    environment,
    locale: defaultLocale,
    title: t('app.title'),
    summary: t('app.summary'),
    schemas: schemaRegistry,
    surfaces: surfaceRegistry,
    readers: defaultReaderModes,
    audit: auditSeedSummary()
  };
}
