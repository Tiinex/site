import { posix } from 'node:path';
import { parseArtifactMarkdown } from '../../../artifacts/artifact.parse.js';

const MAX_PARENT_DEPTH = 6;
const CONTEXT_HEADINGS = Object.freeze([
  Object.freeze({ kind: 'project', headings: Object.freeze(['Project Identity', 'Project Context']) }),
  Object.freeze({ kind: 'organization', headings: Object.freeze(['Organization Identity', 'Organization Context']) })
]);

export function projectQualifiedWorkTargetContext(target = {}, byPath = new Map()) {
  const start = String(target.resolvedPath || '');
  const chain = qualifiedContextChain(start, byPath);
  const contexts = [];
  for (let distance = 0; distance < chain.length; distance += 1) {
    const record = chain[distance];
    for (const definition of CONTEXT_HEADINGS) {
      for (const heading of definition.headings) {
        const text = section(record.markdown || '', heading);
        if (!text) continue;
        contexts.push(Object.freeze({
          kind: definition.kind,
          state: 'qualified-carried',
          label: field(text, 'Name') || String(record.title || ''),
          path: String(record.path || ''),
          schemaId: String(record.schemaId || ''),
          description: compact(field(text, 'Description') || text, 220),
          declaredBoundary: compact(field(text, 'Boundary'), 180),
          basis: Object.freeze({ kind: 'explicit-qualified-context-section', heading, targetPath: start, parentDistance: distance }),
          membershipClaim: false
        }));
        break;
      }
    }
  }
  const project = contexts.find((item) => item.kind === 'project') || unresolved('project-context-unresolved', 'No explicit qualified project identity/context section was recoverable from the work target or its qualified direct Parent context.');
  const organization = contexts.find((item) => item.kind === 'organization') || unresolved('organization-context-unresolved', 'No explicit qualified organization identity/context section was recoverable from the work target or its qualified direct Parent context.');
  const qualifiedCount = Number(project.state === 'qualified-carried') + Number(organization.state === 'qualified-carried');
  return Object.freeze({
    state: qualifiedCount === 2 ? 'qualified' : qualifiedCount === 1 ? 'qualified-partial' : 'unresolved',
    project,
    organization,
    contexts: Object.freeze(contexts),
    boundary: 'Direct Parent continuity may be followed only to inspect already-declared qualified context. Parent is not reinterpreted as work provenance, project membership, organization membership, responsibility transfer, or controlling-work authority.'
  });
}

function qualifiedContextChain(startPath = '', byPath = new Map()) {
  const out = [];
  let path = startPath;
  const seen = new Set();
  for (let depth = 0; depth < MAX_PARENT_DEPTH && path && !seen.has(path); depth += 1) {
    seen.add(path);
    const matches = byPath.get(path) || [];
    if (matches.length !== 1) break;
    const record = matches[0];
    if (!record.hasContinuityContext || !record.hasIntegrity) break;
    out.push(record);
    let parsed;
    try { parsed = parseArtifactMarkdown(record.markdown || ''); } catch { break; }
    const parent = String(parsed?.envelope?.parent?.trace || '').trim();
    if (!parent || /^[a-z][a-z0-9+.-]*:\/\//i.test(parent)) break;
    path = resolvePath(parent, record.path || '');
  }
  return out;
}
function resolvePath(reference = '', ownerPath = '') { const raw = String(reference || '').split('#')[0].trim(); const cross = raw.match(/^([^:/\\]+)::(.+)$/); const candidate = cross ? `${cross[1]}/${cross[2].replace(/^\/+/, '')}` : raw.startsWith('/') ? raw.slice(1) : posix.join(posix.dirname(String(ownerPath || '')), raw); const normalized = posix.normalize(candidate).replace(/^\.\//, ''); return !normalized || normalized === '..' || normalized.startsWith('../') ? '' : normalized; }
function unresolved(code, detail) { return Object.freeze({ state: 'unresolved', code, detail, membershipClaim: false }); }
function section(markdown = '', heading = '') { const escaped = escape(heading); return String(markdown || '').match(new RegExp(`(?:^|\\n)##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|\\n#\\s+Continuity Integrity|$)`, 'i'))?.[1]?.trim() || ''; }
function field(markdown = '', label = '') { const escaped = escape(label); return strip(String(markdown || '').match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+)$`, 'mi'))?.[1] || ''); }
function strip(value = '') { return String(value || '').replace(/^\[([^\]]+)\]\([^)]+\)$/, '$1').replace(/[`*_]/g, '').trim(); }
function compact(value = '', limit = 220) { const text = strip(String(value || '').replace(/\s+/g, ' ')); return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text; }
function escape(value = '') { return String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
