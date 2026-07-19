import enCommon from './locales/en/common.json' with { type: 'json' };
import svCommon from './locales/sv/common.json' with { type: 'json' };
export const defaultLocale = 'en';
const dictionaries = { en: enCommon, sv: svCommon };
export function t(key, locale = defaultLocale) { return dictionaries[locale]?.[key] || dictionaries.en[key] || key; }
