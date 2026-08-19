export const CANONICAL_TRANSITION_SCHEMA_CACHE_COMMIT = 'd69b8ff55a56b8cb9282b8684db6a938a4435b94';
export const CANONICAL_INTERPRETATION_SCHEMA_CACHE_COMMIT = '053d46ce082d4ec261b82abc44ecca403d61e240';
export const CANONICAL_REFERENCE_SCHEMA_CACHE_COMMIT = CANONICAL_INTERPRETATION_SCHEMA_CACHE_COMMIT;
export const CANONICAL_TOPIC_SCHEMA_CACHE_COMMIT = '52ecdea0a75893882ce282214d155f70e1309c2a';
export const CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST = Object.freeze([
  Object.freeze({ schemaId: 'tiinex.root.v1', repository: 'Tiinex/docs', commit: CANONICAL_TRANSITION_SCHEMA_CACHE_COMMIT, path: '.topics/.schemas/tiinex.root.v1.schema.md', gitBlob: '7078e4832872be0df0df4ee944ee1bcd1d886f12' }),
  Object.freeze({ schemaId: 'tiinex.transition.definition.v1', repository: 'Tiinex/docs', commit: CANONICAL_TRANSITION_SCHEMA_CACHE_COMMIT, path: '.topics/.schemas/transition/definition/tiinex.transition.definition.v1.schema.md', gitBlob: '548dac027abcc4fddf918e294a80b5aca1603c46' }),
  Object.freeze({ schemaId: 'tiinex.task.v1', repository: 'Tiinex/docs', commit: CANONICAL_TRANSITION_SCHEMA_CACHE_COMMIT, path: '.topics/.schemas/core/task/tiinex.task.v1.schema.md', gitBlob: 'e4d545ad45382a150351ead587339d8b43cc0fb2' }),
  Object.freeze({ schemaId: 'tiinex.topic.v1', repository: 'Tiinex/docs', commit: CANONICAL_TOPIC_SCHEMA_CACHE_COMMIT, path: '.topics/.schemas/core/topic/tiinex.topic.v1.schema.md', gitBlob: 'c36472b0d20ad97d01cc1ca78a50fc69ce35fdae' }),
  Object.freeze({ schemaId: 'tiinex.interpretation.v1', repository: 'Tiinex/docs', commit: CANONICAL_INTERPRETATION_SCHEMA_CACHE_COMMIT, path: '.topics/.schemas/core/interpretation/tiinex.interpretation.v1.schema.md', gitBlob: '330d8668e78cd6d164a76093982b02f616fd6ab4' }),
  Object.freeze({ schemaId: 'tiinex.relation.v1', repository: 'Tiinex/docs', commit: CANONICAL_REFERENCE_SCHEMA_CACHE_COMMIT, path: '.topics/.schemas/relation/tiinex.relation.v1.schema.md', gitBlob: '46c476c6b24f448f462c9f67e56cb1a40751ee14' }),
  Object.freeze({ schemaId: 'tiinex.schema.contract.v1', repository: 'Tiinex/docs', commit: CANONICAL_REFERENCE_SCHEMA_CACHE_COMMIT, path: '.topics/.schemas/schema/contract/tiinex.schema.contract.v1.schema.md', gitBlob: '02d42cee2e797c770f9e5596da9afdf8368c7c9c' }),
  Object.freeze({ schemaId: 'tiinex.schema.generation.v1', repository: 'Tiinex/docs', commit: CANONICAL_REFERENCE_SCHEMA_CACHE_COMMIT, path: '.topics/.schemas/schema/contract/generation/tiinex.schema.generation.v1.schema.md', gitBlob: '46d803c0e17371121fa094add7be8f6459b6becb' })
]);

export function qualifyCanonicalTransitionSchemaCache(entries = []) {
  return qualifyCanonicalTransitionSchemaCacheSubset(entries, CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item) => item.schemaId));
}

export function qualifyCanonicalTransitionSchemaCacheSubset(entries = [], requiredSchemaIds = []) {
  const requested = new Set((Array.isArray(requiredSchemaIds) ? requiredSchemaIds : []).map((value) => String(value || '').trim()).filter(Boolean));
  const expectedEntries = CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.filter((item) => requested.has(item.schemaId));
  const findings = [], qualified = [];
  for (const expected of expectedEntries) {
    const matches = (Array.isArray(entries) ? entries : []).filter((item) => String(item?.schemaId || '') === expected.schemaId);
    if (matches.length !== 1) {
      findings.push(Object.freeze({ code: matches.length ? 'schema-cache-entry-duplicate' : 'schema-cache-entry-missing', schemaId: expected.schemaId }));
      continue;
    }
    const item = matches[0], markdown = String(item.markdown ?? item.content ?? '');
    const actualBlob = gitBlobSha1(markdown);
    if (String(item.repository || '') !== expected.repository || String(item.commit || '') !== expected.commit || String(item.path || '') !== expected.path || actualBlob !== expected.gitBlob) {
      findings.push(Object.freeze({ code: 'schema-cache-source-identity-mismatch', schemaId: expected.schemaId, expectedBlob: expected.gitBlob, actualBlob }));
      continue;
    }
    qualified.push(Object.freeze({ ...expected, markdown, sourceQualification: 'source-qualified' }));
  }
  const complete = findings.length === 0 && qualified.length === expectedEntries.length && expectedEntries.length === requested.size;
  if (expectedEntries.length !== requested.size) {
    for (const schemaId of requested) if (!CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.some((item) => item.schemaId === schemaId)) findings.push(Object.freeze({ code: 'schema-cache-schema-unregistered', schemaId }));
  }
  return Object.freeze({
    status: complete ? 'qualified' : 'unqualified',
    sourceQualified: complete,
    entries: Object.freeze(qualified),
    findings: Object.freeze(findings)
  });
}

export function gitBlobSha1(text = '') {
  const content = utf8Bytes(String(text));
  const header = utf8Bytes(`blob ${content.length}\0`);
  const bytes = new Uint8Array(header.length + content.length);
  bytes.set(header); bytes.set(content, header.length);
  return sha1Hex(bytes);
}

function utf8Bytes(text) {
  if (typeof TextEncoder !== 'undefined') return new TextEncoder().encode(text);
  const encoded = unescape(encodeURIComponent(text));
  return Uint8Array.from(encoded, (char) => char.charCodeAt(0));
}
function sha1Hex(input) {
  const bitLength = input.length * 8, padLength = ((56 - (input.length + 1) % 64) + 64) % 64;
  const data = new Uint8Array(input.length + 1 + padLength + 8); data.set(input); data[input.length] = 0x80;
  const view = new DataView(data.buffer); view.setUint32(data.length - 4, bitLength >>> 0, false); view.setUint32(data.length - 8, Math.floor(bitLength / 0x100000000), false);
  let h0=0x67452301,h1=0xefcdab89,h2=0x98badcfe,h3=0x10325476,h4=0xc3d2e1f0;
  const w = new Uint32Array(80), rol=(n,b)=>((n<<b)|(n>>>(32-b)))>>>0;
  for (let offset=0; offset<data.length; offset+=64) {
    for (let i=0;i<16;i++) w[i]=view.getUint32(offset+i*4,false);
    for (let i=16;i<80;i++) w[i]=rol(w[i-3]^w[i-8]^w[i-14]^w[i-16],1);
    let a=h0,b=h1,c=h2,d=h3,e=h4;
    for (let i=0;i<80;i++) {
      const f=i<20?(b&c)|((~b)&d):i<40?b^c^d:i<60?(b&c)|(b&d)|(c&d):b^c^d;
      const k=i<20?0x5a827999:i<40?0x6ed9eba1:i<60?0x8f1bbcdc:0xca62c1d6;
      const t=(rol(a,5)+f+e+k+w[i])>>>0; e=d; d=c; c=rol(b,30); b=a; a=t;
    }
    h0=(h0+a)>>>0; h1=(h1+b)>>>0; h2=(h2+c)>>>0; h3=(h3+d)>>>0; h4=(h4+e)>>>0;
  }
  return [h0,h1,h2,h3,h4].map((n)=>n.toString(16).padStart(8,'0')).join('');
}
