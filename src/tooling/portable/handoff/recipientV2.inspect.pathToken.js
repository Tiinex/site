import { sha256Hex, utf8Bytes } from '../../../export/package.bytes.js';

export function boundedRecipientToken(value = '') {
  const raw = String(value || '');
  const token = raw.trim().toLowerCase().replace(/[^a-z0-9._-]+/g, '-').replace(/^-+|-+$/g, '');
  if (!token) return 'material';
  if (token.length <= 100) return token;
  return `${token.slice(0, 87)}-${sha256Hex(utf8Bytes(raw)).slice(0, 12)}`;
}
