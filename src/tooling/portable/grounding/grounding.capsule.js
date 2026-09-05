import { projectParticipantAuthority } from './grounding.participantAuthority.js';
import { projectWorkProvenance } from './grounding.workProvenance.js';
import { projectGroundingSourceEvidence } from './grounding.sourceEvidence.js';
import { projectGroundingPlanningContext } from './grounding.planningContext.js';

export const PORTABLE_GROUNDING_CAPSULE_SCHEMA_ID = 'tiinex.portable.grounding-capsule.v1';

const MAX_CONTEXT = 8;
const MAX_EXCLUSIONS = 6;

export function projectGroundingCapsule({ authority = null, continuation = null, contextAudit = null, requiredContext = [], records = [], topology = {}, blockers = [] } = {}) {
  const routeRecords = selectedRouteRecords(authority, records);
  const workProvenance = projectWorkProvenance({ records, topology });
  const participantAuthority = projectParticipantAuthority(authority);
  return Object.freeze({
    schema: PORTABLE_GROUNDING_CAPSULE_SCHEMA_ID,
    semanticReductions: Object.freeze(requiredContext.slice(0, MAX_CONTEXT).map(reduceRequiredContext)),
    frontier: projectFrontier(topology, blockers),
    exclusions: Object.freeze(routeRecords.flatMap((record) => parseExclusions(record.markdown || '')).slice(0, MAX_EXCLUSIONS)),
    sourceEvidence: projectGroundingSourceEvidence({ records, contextAudit, continuation }),
    planningContext: projectGroundingPlanningContext(requiredContext),
    roleState: Object.freeze({
      recipient: String(authority?.role?.endpoint?.label || authority?.handoff?.to || ''),
      recipientState: String(authority?.role?.state || 'unresolved'),
      holder: String(authority?.holderBinding?.roleLabel || ''),
      holderState: String(authority?.holderBinding?.state || 'unresolved'),
      compatibility: String(authority?.holderBinding?.recipientCompatibility || 'unresolved')
    }),
    participantAuthority,
    workProvenance,
    unresolved: Object.freeze([...workProvenance.unresolved]),
    boundary: 'Full Required Context bodies remain selector-gated.'
  });
}

function reduceRequiredContext(entry = {}) {
  const qualified = String(entry.state || '') === 'qualified';
  const markdown = qualified && typeof entry.content === 'string' ? entry.content : '';
  const signals = markdown ? semanticSignals(markdown) : [];
  return Object.freeze({
    id: String(entry.requirementId || entry.name || ''),
    state: String(entry.state || 'unresolved'),
    workspace: String(entry.workspaceId || ''),
    path: String(entry.innerPath || entry.workspaceRelativePath || ''),
    title: markdown ? firstHeading(markdown) : String(entry.name || ''),
    signals: Object.freeze(signals),
    basis: markdown ? 'exact-qualified-body-reduction' : 'qualified-locator-without-body'
  });
}

function semanticSignals(markdown = '') {
  const preferred = ['Objective', 'Purpose', 'Decision', 'Scope', 'Done Criteria', 'Completion Expectation', 'Dependencies'];
  const out = [];
  for (const heading of preferred) {
    const text = section(markdown, heading);
    if (!text) continue;
    out.push(Object.freeze({ heading, text: compact(sectionMeaning(text), 220) }));
    if (out.length === 2) break;
  }
  if (!out.length) {
    const summary = field(markdown, 'Summary');
    if (summary) out.push(Object.freeze({ heading: 'Summary', text: compact(summary, 220) }));
  }
  return out;
}

function projectFrontier(topology = {}, blockers = []) {
  const frontier = (topology.currentFrontier || []).slice(0, 4).map((item) => Object.freeze({
    path: String(item.path || ''),
    status: String(item.declaredStatus || ''),
    objective: compact(item.objective || '', 180)
  }));
  return Object.freeze({
    state: frontier.length ? 'resolved' : 'unresolved',
    rationale: frontier.length ? 'nearest nonterminal Task ancestor(s) to the exact selected Handoff route by declared Parent distance' : 'no exact-qualified nonterminal Task ancestor resolved on the selected route Parent lineage',
    items: Object.freeze(frontier),
    blockers: Object.freeze((blockers || []).slice(0, 4).map((item) => Object.freeze({ code: String(item.code || item.id || ''), detail: compact(item.detail || item.message || item.label || '', 180) })))
  });
}

function parseExclusions(markdown = '') {
  const body = section(markdown, 'Exclusions And Dependencies');
  if (!body) return [];
  const blocks = body.split(/\n(?=-\s+[^\s])/g).map((item) => item.trim()).filter(Boolean);
  return blocks.map((block) => {
    const id = (block.match(/^-\s+([^\n]+)/) || [])[1] || '';
    return Object.freeze({
      id: id.trim(),
      kind: field(block, 'Kind'),
      description: compact(field(block, 'Description'), 220)
    });
  }).filter((item) => item.id);
}

function selectedRouteRecords(authority = {}, records = []) {
  const workspace = String(authority?.selectedRoute?.workspaceId || '');
  const inner = String(authority?.selectedRoute?.workspaceRelativeHandoffPath || '').replace(/^\/+/, '');
  const expected = workspace && inner ? `${workspace}/${inner}` : '';
  return expected ? records.filter((record) => String(record.path || '') === expected) : [];
}

function section(markdown = '', heading = '') {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(markdown || '').match(new RegExp(`(?:^|\\n)##\\s+${escaped}\\s*\\r?\\n([\\s\\S]*?)(?=\\n##\\s+|$)`, 'i'));
  return match ? match[1].trim() : '';
}

function field(markdown = '', label = '') {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = String(markdown || '').match(new RegExp(`^\\s*-\\s+${escaped}:\\s*(.+)$`, 'mi'));
  return match ? stripMarkdown(match[1]) : '';
}

function firstHeading(markdown = '') {
  const match = String(markdown || '').match(/^#\s+(.+)$/m);
  return match ? stripMarkdown(match[1]) : '';
}

function sectionMeaning(text = '') {
  const description = field(text, 'Description');
  if (description) return description;
  const purpose = field(text, 'Purpose');
  if (purpose) return purpose;
  return String(text || '').replace(/^\s*-\s+/gm, '').replace(/^\s{2,}-\s+/gm, ' ').replace(/\s+/g, ' ').trim();
}

function stripMarkdown(value = '') { return String(value || '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[`*_]/g, '').trim(); }
function compact(value = '', limit = 220) { const text = stripMarkdown(String(value || '').replace(/\s+/g, ' ')); return text.length > limit ? `${text.slice(0, limit - 1).trimEnd()}…` : text; }
