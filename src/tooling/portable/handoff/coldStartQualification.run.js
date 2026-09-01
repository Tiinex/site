import {
  COLD_START_INGRESS_KINDS,
  normalizeIngressKind
} from './coldStartQualification.contract.js';
import { groundPortableColdConsumer } from './coldStartQualification.grounding.js';
import { createColdStartMaterialContext, projectGroundedContinuation } from './coldStartQualification.materials.js';
import { qualifyPortableColdStartTrace } from './coldStartQualification.observation.js';
import { deepFreeze, normalizeToken } from './coldStartQualification.shared.js';

export function qualifyPortableColdStartRun(input = {}, options = {}) {
  const ingressKind = normalizeIngressKind(input.ingressKind || input.kind || COLD_START_INGRESS_KINDS.HANDOFF);
  const bundle = input.bundle || input.package || input;
  const route = String(input.route || input.routeId || input.routePath || '').trim();
  const coldStartMaterialContext = createColdStartMaterialContext();
  const hostEvidence = normalizeOneShotHostEvidence(input.hostEvidence || input.preTakeover || input.preTiinex || input.hostPreTakeover || 'unverified', input.hostEvidenceSource || input.evidenceSource || '');
  const grounding = groundPortableColdConsumer({
    ...input,
    bundle,
    package: bundle,
    ingressKind,
    route,
    toolingAvailable: input.toolingAvailable === false ? false : true
  }, { ...options, coldStartMaterialContext });
  const events = [];
  if (hostEvidence.mode === 'minimal-bootstrap-only') events.push({ mechanism: 'native-host', action: 'read declared Start/bootstrap nodes and materialize verified portable Tooling bootstrap', semanticClass: 'minimal-bootstrap', status: 'completed', read: true, arbitrary: false, candidateArtifacts: 0 });
  else if (hostEvidence.mode === 'native-archaeology') events.push({ mechanism: 'native-host', action: 'native package/archive/filesystem inspection before Tiinex takeover', semanticClass: 'semantic-archaeology', status: 'completed', read: true, arbitrary: true, candidateArtifacts: Math.max(1, Number(input.candidateArtifacts || 1) || 1) });
  else if (hostEvidence.mode === 'none') { /* Tooling was already callable; no native bootstrap action is declared. */ }
  events.push({ mechanism: 'tiinex', operation: 'orient-handoff-package', status: String(grounding.orientation?.status || 'blocked') });
  events.push({ mechanism: 'tiinex', operation: 'ground-cold-consumer', status: String(grounding.status || 'blocked') });
  const traceInput = {
    ingressKind,
    toolingAvailable: input.toolingAvailable === false ? false : true,
    events,
    grounding,
    outcome: grounding.status === 'blocked' ? { state: 'failed' } : hostEvidence.mode === 'unverified' ? { state: 'unknown' } : { state: 'recovered' },
    hostEvidence: { state: hostEvidence.mode === 'unverified' ? 'unverified' : 'provided', source: hostEvidence.source, mode: hostEvidence.mode },
    requireHostEvidence: true
  };
  const qualification = qualifyPortableColdStartTrace(traceInput, options);
  const continuation = projectGroundedContinuation({ bundle, route, grounding, qualification, packageSourcePath: input.packageSourcePath || '' }, coldStartMaterialContext);
  return deepFreeze({
    ...qualification,
    grounding,
    continuation,
    oneShot: Object.freeze({
      state: grounding.status === 'blocked' ? 'blocked' : 'completed',
      routeSelector: route,
      hostEvidence: Object.freeze(hostEvidence),
      toolingEvidence: 'generated-by-qualify-cold-start-run',
      evidenceAttribution: Object.freeze({
        tooling: Object.freeze({ source: 'portable-tooling', independentlyObserved: true, covers: Object.freeze(['orientation', 'route-resolution', 'recipient-grounding']) }),
        preTakeoverHost: Object.freeze({ source: hostEvidence.source, mode: hostEvidence.mode, independentlyObservedByTooling: false })
      }),
      boundary: 'Tooling can generate and qualify its own orientation/grounding receipts. Pre-takeover native-host behavior is not directly observable by portable Tooling unless supplied by a host observer; caller-declared host evidence remains explicitly attributed rather than promoted to independent proof.'
    })
  });
}

export function isOneShotColdStartQualificationInput(input = {}) {
  const bundle = input?.bundle || input?.package || null;
  if (!bundle || !Array.isArray(bundle.files)) return false;
  const explicitEvents = input?.events || input?.observations || input?.trace;
  return !(Array.isArray(explicitEvents) && explicitEvents.length);
}

export function normalizeOneShotHostEvidence(value, source = '') {
  const raw = typeof value === 'object' && value ? value : { mode: value };
  const token = normalizeToken(raw.mode || raw.state || raw.kind || value || 'unverified');
  const mode = ['minimal-bootstrap-only', 'minimal-bootstrap', 'bootstrap-only'].includes(token)
    ? 'minimal-bootstrap-only'
    : ['none', 'tooling-preinstalled', 'already-available'].includes(token)
      ? 'none'
      : ['native-archaeology', 'archaeology', 'fallback'].includes(token)
        ? 'native-archaeology'
        : 'unverified';
  return Object.freeze({
    mode,
    source: String(raw.source || source || (mode === 'unverified' ? 'unverified' : 'caller-declared')).trim(),
    independentlyObservedByTooling: false
  });
}
