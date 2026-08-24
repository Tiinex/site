export const C14N_V2_METHOD_ID = 'sha256-base64url-c14n-v2';

export function canonicalC14nV2SelfState(markdown = '') {
  const normalized = normalizeCanonicalSource(markdown);
  const located = locateSelfEntries(normalized);
  if (located.integrityHeading < 0) return Object.freeze({ state: 'unavailable', reason: 'integrity-footer-missing', entries: Object.freeze([]) });
  if (located.entries.length !== 1) return Object.freeze({ state: 'ambiguous', reason: located.entries.length ? 'multiple-primary-self-entries' : 'primary-self-entry-missing', entries: Object.freeze(located.entries) });
  const entry = located.entries[0];
  if (entry.valueLines.length !== 1) return Object.freeze({ state: 'ambiguous', reason: entry.valueLines.length ? 'multiple-value-fields' : 'value-field-missing', entries: Object.freeze(located.entries) });
  const valueLine = entry.valueLines[0];
  const canonicalLines = located.lines.slice();
  canonicalLines[valueLine.index] = `${valueLine.label}${valueLine.spacing}`;
  const canonical = canonicalLines.join('\n');
  const computedValue = sha256Base64Url(canonical);
  const declaredValue = valueLine.value;
  return Object.freeze({
    state: declaredValue && declaredValue === computedValue ? 'verified' : declaredValue ? 'mismatch' : 'prepared',
    reason: declaredValue && declaredValue !== computedValue ? 'digest-mismatch' : '',
    method: C14N_V2_METHOD_ID,
    towards: 'self',
    declaredValue,
    computedValue,
    canonical,
    entryIndex: entry.entryIndex,
    valueLineIndex: valueLine.index
  });
}


export function validatedC14nV2PrimarySelfDigest(markdown = '') {
  const state = canonicalC14nV2SelfState(markdown);
  if (state.state !== 'verified') return Object.freeze({
    state: state.state,
    reason: state.reason || state.state,
    value: '',
    declaredValue: state.declaredValue || '',
    computedValue: state.computedValue || ''
  });
  return Object.freeze({
    state: 'verified',
    reason: '',
    value: state.declaredValue,
    declaredValue: state.declaredValue,
    computedValue: state.computedValue
  });
}

export function verifyC14nV2TargetSelfDigest({ value = '', targetMarkdown = '' } = {}) {
  const expectedValue = String(value || '').trim();
  const target = validatedC14nV2PrimarySelfDigest(targetMarkdown);
  if (target.state !== 'verified') return Object.freeze({
    state: target.state === 'mismatch' ? 'target-self-mismatch' : target.state,
    reason: target.reason || target.state,
    expectedValue,
    targetValue: target.declaredValue || '',
    computedTargetValue: target.computedValue || ''
  });
  return Object.freeze({
    state: expectedValue && expectedValue === target.value ? 'verified' : 'mismatch',
    reason: !expectedValue ? 'comparison-value-missing' : expectedValue === target.value ? '' : 'target-self-digest-mismatch',
    expectedValue,
    targetValue: target.value,
    computedTargetValue: target.computedValue
  });
}

export function sealC14nV2Self(markdown = '') {
  const state = canonicalC14nV2SelfState(markdown);
  if (!['verified', 'mismatch', 'prepared'].includes(state.state)) return Object.freeze({ state: state.state, reason: state.reason, markdown: String(markdown || ''), value: '' });
  const normalized = normalizeCanonicalSource(markdown);
  const lines = normalized.split('\n');
  const located = locateSelfEntries(normalized);
  const valueLine = located.entries[0]?.valueLines?.[0];
  if (!valueLine) return Object.freeze({ state: 'ambiguous', reason: 'value-field-missing', markdown: String(markdown || ''), value: '' });
  lines[valueLine.index] = `${valueLine.label}${valueLine.spacing}${state.computedValue}`;
  return Object.freeze({ state: 'sealed', reason: '', markdown: lines.join('\n'), value: state.computedValue });
}

export function sha256Base64Url(text = '') {
  return base64Url(sha256Bytes(new TextEncoder().encode(String(text || ''))));
}

function normalizeCanonicalSource(markdown = '') {
  return String(markdown || '')
    .replace(/\r\n?/g, '\n')
    .replace(/[ \t]+$/gm, '')
    .trimEnd();
}

function locateSelfEntries(normalized = '') {
  const lines = String(normalized || '').split('\n');
  const integrityHeading = lines.findIndex((line) => line === '# Continuity Integrity');
  if (integrityHeading < 0) return { lines, integrityHeading, entries: [] };
  const allEntries = [];
  let current = null;
  const finish = (end) => {
    if (!current) return;
    current.end = end;
    allEntries.push(current);
    current = null;
  };
  for (let index = integrityHeading + 1; index < lines.length; index += 1) {
    const line = lines[index];
    if (/^#\s+/.test(line)) { finish(index); break; }
    const top = line.match(/^-\s+(.+?)\s*$/);
    if (top) {
      finish(index);
      current = { entryIndex: allEntries.length, start: index, end: lines.length, method: stripMarkdownLink(top[1].trim()), towards: '', valueLines: [] };
      continue;
    }
    if (!current) continue;
    const towards = line.match(/^\s+-\s+Towards:\s*(.*?)\s*$/);
    if (towards) current.towards = stripMarkdownLink(towards[1].trim());
    const value = line.match(/^(\s+-\s+Value:)([ \t]*)(.*)$/);
    if (value) current.valueLines.push({ index, label: value[1], spacing: value[2], value: value[3].trim() });
  }
  finish(lines.length);
  const entries = allEntries.filter((entry) => entry.method === C14N_V2_METHOD_ID && entry.towards === 'self');
  return { lines, integrityHeading, entries };
}

function stripMarkdownLink(value = '') {
  const text = String(value || '').trim();
  const link = text.match(/^\[([^\]]+)\]\([^)]+\)$/);
  return (link ? link[1] : text).trim();
}

function sha256Bytes(bytes) {
  const K = [
    0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
    0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
    0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
    0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
    0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
    0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
    0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
    0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2
  ];
  const length = bytes.length;
  const bitLength = length * 8;
  const paddedLength = (((length + 9 + 63) >> 6) << 6);
  const buffer = new Uint8Array(paddedLength);
  buffer.set(bytes);
  buffer[length] = 0x80;
  const view = new DataView(buffer.buffer);
  const high = Math.floor(bitLength / 0x100000000);
  const low = bitLength >>> 0;
  view.setUint32(paddedLength - 8, high, false);
  view.setUint32(paddedLength - 4, low, false);
  let h0=0x6a09e667,h1=0xbb67ae85,h2=0x3c6ef372,h3=0xa54ff53a,h4=0x510e527f,h5=0x9b05688c,h6=0x1f83d9ab,h7=0x5be0cd19;
  const w = new Uint32Array(64);
  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let i = 0; i < 16; i += 1) w[i] = view.getUint32(offset + i * 4, false);
    for (let i = 16; i < 64; i += 1) {
      const a=w[i-15], b=w[i-2];
      const s0=(rotr(a,7)^rotr(a,18)^(a>>>3))>>>0;
      const s1=(rotr(b,17)^rotr(b,19)^(b>>>10))>>>0;
      w[i]=(w[i-16]+s0+w[i-7]+s1)>>>0;
    }
    let a=h0,b=h1,c=h2,d=h3,e=h4,f=h5,g=h6,h=h7;
    for (let i=0;i<64;i+=1) {
      const S1=(rotr(e,6)^rotr(e,11)^rotr(e,25))>>>0;
      const ch=((e&f)^(~e&g))>>>0;
      const t1=(h+S1+ch+K[i]+w[i])>>>0;
      const S0=(rotr(a,2)^rotr(a,13)^rotr(a,22))>>>0;
      const maj=((a&b)^(a&c)^(b&c))>>>0;
      const t2=(S0+maj)>>>0;
      h=g; g=f; f=e; e=(d+t1)>>>0; d=c; c=b; b=a; a=(t1+t2)>>>0;
    }
    h0=(h0+a)>>>0; h1=(h1+b)>>>0; h2=(h2+c)>>>0; h3=(h3+d)>>>0;
    h4=(h4+e)>>>0; h5=(h5+f)>>>0; h6=(h6+g)>>>0; h7=(h7+h)>>>0;
  }
  const out = new Uint8Array(32);
  const outView = new DataView(out.buffer);
  [h0,h1,h2,h3,h4,h5,h6,h7].forEach((value,index)=>outView.setUint32(index*4,value,false));
  return out;
}
function rotr(value, shift) { return ((value >>> shift) | (value << (32 - shift))) >>> 0; }
function base64Url(bytes) {
  const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
  let out='';
  for (let i=0;i<bytes.length;i+=3) {
    const a=bytes[i], b=i+1<bytes.length?bytes[i+1]:0, c=i+2<bytes.length?bytes[i+2]:0;
    const triple=(a<<16)|(b<<8)|c;
    out+=alphabet[(triple>>>18)&63]+alphabet[(triple>>>12)&63];
    if (i+1<bytes.length) out+=alphabet[(triple>>>6)&63];
    if (i+2<bytes.length) out+=alphabet[triple&63];
  }
  return out;
}
