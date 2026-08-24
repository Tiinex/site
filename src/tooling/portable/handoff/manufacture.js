import { prepareRecipientRelativeWorkspaceHandoffExport } from '../../../export/handoff.plan.js';
import { summarizePortableFindings } from '../findings.js';
import { inspectPortableToolingBootstrap } from './toolingBootstrap.js';

export const PORTABLE_HANDOFF_MANUFACTURING_SCHEMA_ID = 'tiinex.portable.handoff-manufacturing.v1';

export function manufactureRecipientRelativeHandoffPackage(input = {}, options = {}) {
  const prepared = prepareRecipientRelativeWorkspaceHandoffExport(input, {
    ...options,
    verifyRoundtrip: options.verifyRoundtrip !== false && input.verifyRoundtrip !== false
  });
  const toolingBootstrapInspection = inspectPortableToolingBootstrap(prepared.bundle);
  const findings = Object.freeze([
    ...(prepared.plan?.findings || []),
    ...(prepared.inspection?.findings || []),
    ...(prepared.closureInspection?.findings || []),
    ...(prepared.carrierInspection?.findings || []),
    ...(prepared.pointerEntrypointInspection?.findings || []),
    ...(prepared.coldConsumerEntrypointInspection?.findings || []),
    ...(prepared.companionInspection?.findings || []),
    ...(prepared.roundtrip?.findings || []),
    ...(toolingBootstrapInspection.findings || [])
  ]);
  const status = prepared.executable && prepared.transportExecutable && toolingBootstrapInspection.status === 'valid' ? prepared.status : 'blocked';
  return Object.freeze({
    schema: PORTABLE_HANDOFF_MANUFACTURING_SCHEMA_ID,
    status,
    executable: prepared.executable,
    transportExecutable: prepared.transportExecutable,
    verification: Object.freeze({
      packageInspection: String(prepared.inspection?.status || 'unavailable'),
      closureInspection: String(prepared.closureInspection?.status || 'unavailable'),
      carrierInspection: String(prepared.carrierInspection?.status || 'unavailable'),
      pointerEntrypointInspection: String(prepared.pointerEntrypointInspection?.status || 'unavailable'),
      coldConsumerEntrypointInspection: String(prepared.coldConsumerEntrypointInspection?.status || 'unavailable'),
      companionInspection: String(prepared.companionInspection?.status || 'unavailable'),
      roundtrip: prepared.roundtrip ? String(prepared.roundtrip.status || 'unknown') : 'not-requested',
      toolingBootstrap: toolingBootstrapInspection.status
    }),
    plan: prepared.plan,
    bundle: prepared.bundle,
    descriptor: prepared.descriptor,
    transportCompanion: prepared.transportCompanion,
    inspection: prepared.inspection,
    closureInspection: prepared.closureInspection,
    carrierProjection: prepared.carrierProjection,
    carrierInspection: prepared.carrierInspection,
    pointerEntrypointProjection: prepared.pointerEntrypointProjection,
    pointerEntrypointInspection: prepared.pointerEntrypointInspection,
    coldConsumerProjection: prepared.coldConsumerProjection,
    coldConsumerEntrypointInspection: prepared.coldConsumerEntrypointInspection,
    companionInspection: prepared.companionInspection,
    roundtrip: prepared.roundtrip,
    toolingBootstrap: input.toolingBootstrap || null,
    manufacturingEvidence: input.manufacturingEvidence || null,
    toolingBootstrapInspection,
    findings,
    findingSummary: summarizePortableFindings(findings),
    boundary: 'Ordinary portable manufacturing facade over the existing recipient-relative Handoff closure/package owners. It does not define canonical Handoff meaning, infer workspace completeness, or assign bootstrap authority by package placement.'
  });
}
