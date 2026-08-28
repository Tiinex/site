const TEXT_ENCODER = new TextEncoder();
const TEXT_DECODER = new TextDecoder();

export function utf8Bytes(value = '') {
  return TEXT_ENCODER.encode(String(value ?? ''));
}

export function utf8Text(value = new Uint8Array()) {
  return TEXT_DECODER.decode(toUint8Array(value));
}

export function toUint8Array(value) {
  if (value instanceof Uint8Array) return value.slice();
  if (value instanceof ArrayBuffer) return new Uint8Array(value.slice(0));
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
  if (Array.isArray(value) && value.every((item) => Number.isInteger(item) && item >= 0 && item <= 255)) return Uint8Array.from(value);
  if (value === undefined || value === null) return new Uint8Array();
  return utf8Bytes(String(value));
}

export function bytesFromDataUrl(value = '') {
  const text = String(value || '');
  const match = text.match(/^data:([^;,]*)(;base64)?,(.*)$/s);
  if (!match) return null;
  const mediaType = match[1] || 'text/plain';
  const base64 = Boolean(match[2]);
  const payload = match[3] || '';
  try {
    const bytes = base64 ? decodeBase64(payload) : utf8Bytes(decodeURIComponent(payload.replace(/\+/g, '%20')));
    return Object.freeze({ bytes, mediaType });
  } catch (_) {
    return null;
  }
}

export function packageAssetBytes(asset = {}) {
  if (asset.bytes instanceof Uint8Array || asset.bytes instanceof ArrayBuffer || ArrayBuffer.isView(asset.bytes) || Array.isArray(asset.bytes)) {
    return Object.freeze({ bytes: toUint8Array(asset.bytes), mediaType: String(asset.type || asset.mimeType || 'application/octet-stream'), representation: 'raw-bytes' });
  }
  if (typeof asset.dataUrl === 'string' && asset.dataUrl) {
    const decoded = bytesFromDataUrl(asset.dataUrl);
    if (decoded) return Object.freeze({ bytes: decoded.bytes, mediaType: String(asset.type || asset.mimeType || decoded.mediaType || 'application/octet-stream'), representation: 'decoded-data-url' });
  }
  if (typeof asset.content === 'string') return Object.freeze({ bytes: utf8Bytes(asset.content), mediaType: String(asset.type || asset.mimeType || 'text/plain'), representation: 'utf8-content' });
  if (typeof asset.text === 'string') return Object.freeze({ bytes: utf8Bytes(asset.text), mediaType: String(asset.type || asset.mimeType || 'text/plain'), representation: 'utf8-text' });
  return Object.freeze({ bytes: new Uint8Array(), mediaType: String(asset.type || asset.mimeType || 'application/octet-stream'), representation: 'unavailable' });
}

export function packageFileByteView(file = {}) {
  if (file.data instanceof Uint8Array) return file.data;
  if (file.bytesData instanceof Uint8Array) return file.bytesData;
  if (file.bytes instanceof Uint8Array) return file.bytes;
  return packageFileBytes(file);
}

export function packageFileBytes(file = {}) {
  if (file.data instanceof Uint8Array || file.data instanceof ArrayBuffer || ArrayBuffer.isView(file.data) || Array.isArray(file.data)) return toUint8Array(file.data);
  if (file.bytesData instanceof Uint8Array || file.bytesData instanceof ArrayBuffer || ArrayBuffer.isView(file.bytesData) || Array.isArray(file.bytesData)) return toUint8Array(file.bytesData);
  if (typeof file.content === 'string') return utf8Bytes(file.content);
  if (typeof file.markdown === 'string') return utf8Bytes(file.markdown);
  if (file.bytes instanceof Uint8Array || file.bytes instanceof ArrayBuffer || ArrayBuffer.isView(file.bytes) || Array.isArray(file.bytes)) return toUint8Array(file.bytes);
  return new Uint8Array();
}

export function stableFingerprintBytes(value) {
  const bytes = toUint8Array(value);
  let hash = 2166136261;
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 16777619);
  }
  return `tixfp1-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export function sha256Hex(value) {
  const bytes = readOnlyUint8View(value);
  const words = [];
  const bitLength = bytes.length * 8;
  const paddedLength = (((bytes.length + 9 + 63) >> 6) << 6);
  const padded = new Uint8Array(paddedLength);
  padded.set(bytes);
  padded[bytes.length] = 0x80;
  const view = new DataView(padded.buffer);
  const high = Math.floor(bitLength / 0x100000000);
  const low = bitLength >>> 0;
  view.setUint32(paddedLength - 8, high, false);
  view.setUint32(paddedLength - 4, low, false);

  let h0 = 0x6a09e667, h1 = 0xbb67ae85, h2 = 0x3c6ef372, h3 = 0xa54ff53a;
  let h4 = 0x510e527f, h5 = 0x9b05688c, h6 = 0x1f83d9ab, h7 = 0x5be0cd19;
  const w = new Uint32Array(64);

  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i += 1) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) >>> 0;
    }
    let a = h0, b = h1, c = h2, d = h3, e = h4, f = h5, g = h6, h = h7;
    for (let i = 0; i < 64; i += 1) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      // Keep compression-round additions inline. A rest-parameter add helper allocates
      // per round and turns large recipient-package integrity checks into a CPU hotspot.
      const temp1 = (h + s1 + ch + K[i] + w[i]) >>> 0;
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) >>> 0;
      h = g; g = f; f = e; e = (d + temp1) >>> 0;
      d = c; c = b; b = a; a = (temp1 + temp2) >>> 0;
    }
    h0 = (h0 + a) >>> 0; h1 = (h1 + b) >>> 0; h2 = (h2 + c) >>> 0; h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0; h5 = (h5 + f) >>> 0; h6 = (h6 + g) >>> 0; h7 = (h7 + h) >>> 0;
  }
  words.push(h0, h1, h2, h3, h4, h5, h6, h7);
  return words.map((word) => (word >>> 0).toString(16).padStart(8, '0')).join('');
}


function readOnlyUint8View(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  if (Array.isArray(value) && value.every((item) => Number.isInteger(item) && item >= 0 && item <= 255)) return Uint8Array.from(value);
  if (value === undefined || value === null) return new Uint8Array();
  return utf8Bytes(String(value));
}

function rotr(value, bits) { return (value >>> bits) | (value << (32 - bits)); }
function decodeBase64(value = '') {
  const clean = String(value || '').replace(/\s+/g, '');
  if (typeof atob === 'function') {
    const binary = atob(clean);
    const out = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) out[i] = binary.charCodeAt(i);
    return out;
  }
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let buffer = 0, bits = 0;
  const out = [];
  for (const char of clean.replace(/=+$/, '')) {
    const valueIndex = alphabet.indexOf(char);
    if (valueIndex < 0) throw new Error('invalid-base64');
    buffer = (buffer << 6) | valueIndex;
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      out.push((buffer >>> bits) & 0xff);
    }
  }
  return Uint8Array.from(out);
}

const K = new Uint32Array([
  0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
  0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
  0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
  0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
  0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
  0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
  0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
  0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
]);
