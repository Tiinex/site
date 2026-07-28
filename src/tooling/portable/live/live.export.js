import { validatePortableDraft } from '../draft/draft.operations.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import { buildPortableLiveLineageClosure } from './live.lineage.closure.js';
import { normalizePortableLiveLineageState } from './live.lineage.js';
import { appendLiveOperationReceipt, summarizeLiveOperationChain } from './live.protocol.js';

export const PORTABLE_LIVE_LINEAGE_EXPORT_SCHEMA_ID = 'tiinex.portable.live-lineage.export.v1';

export function exportPortableLiveLineage(input = {}, options = {}) {
  const findings = [];
  const state = normalizePortableLiveLineageState(input.state || input.liveLineage || {}, findings);
  const material = normalizePortableInput(input.materials || input);
  const selectedIds = new Set(normalizeStrings(input.artifactIds));
  const selected = state.artifacts.filter((entry) => entry.status !== 'withdrawn' && (!selectedIds.size || selectedIds.has(entry.id)));
  const updateReceipts = state.receipts.filter((entry) => entry.operation === 'update-live-lineage');
  const prepareReceipts = state.receipts.filter((entry) => entry.operation === 'prepare-live-response');
  const dialogueMode = classifyDialogueMode(updateReceipts, prepareReceipts);

  if (!selected.length) findings.push(portableFinding('error', 'live-lineage.export.empty', 'No active live artifacts are available for export.'));
  if (state.protocol.latestTurnSequence > state.protocol.preparedTurnSequence) findings.push(portableFinding('error', 'live-lineage.export.response-preflight-pending', 'Export is blocked because the latest dialogue turn was not processed into bounded response context.', { latestTurnSequence: state.protocol.latestTurnSequence, preparedTurnSequence: state.protocol.preparedTurnSequence }));
  if (!updateReceipts.length) findings.push(portableFinding('error', 'live-lineage.export.turn-receipt-missing', 'Export requires at least one recorded dialogue-turn transaction.'));
  if (prepareReceipts.length !== updateReceipts.length) findings.push(portableFinding('error', 'live-lineage.export.turn-pair-incomplete', 'Every recorded dialogue turn must have one response-preflight receipt before export.', { turnReceipts: updateReceipts.length, responseReceipts: prepareReceipts.length }));
  if (!updateReceipts.some((entry) => entry.decision === 'artifact-change')) findings.push(portableFinding('error', 'live-lineage.export.artifact-change-receipt-missing', 'Export requires an artifact change recorded during a dialogue-turn transaction.'));
  if (input.requireInterleaved === true && dialogueMode !== 'live-interleaved') findings.push(portableFinding('error', 'live-lineage.export.interleaved-required', 'This acceptance profile requires at least two processed dialogue turns before export.', { dialogueMode, turns: updateReceipts.length }));

  const artifacts = [];
  for (const entry of selected) {
    const validation = validatePortableDraft({ ...material, ...entry.draft, schemaId: entry.schemaId }, options);
    findings.push(...(validation.findings || []).filter((finding) => finding.severity === 'error').map((finding) => portableFinding(finding.severity, finding.code, finding.message, { ...finding, artifactId: entry.id })));
    if (validation.status !== 'clean') findings.push(portableFinding('error', 'live-lineage.export.validation-blocked', 'Live artifact is not clean under the shared validator and cannot be exported.', { artifactId: entry.id, validationStatus: validation.status }));
    artifacts.push(Object.freeze({
      proposalId: entry.id,
      parentProposalId: entry.parentRef.startsWith('live:') ? entry.parentRef.slice(5) : '',
      parentLoadedRef: entry.parentRef.startsWith('loaded:') ? entry.parentRef.slice(7) : '',
      draft: Object.freeze({ ...entry.draft, changeRole: entry.changeRole || 'created', baseSha256: entry.baseSha256 || '' }),
      validation
    }));
  }

  const lineageClosure = buildPortableLiveLineageClosure(material, selected);
  const hasErrors = findings.some((finding) => finding.severity === 'error');
  let operationReceipt = summarizeLiveOperationChain({ protocol: state.protocol, receipts: state.receipts });
  if (!hasErrors) {
    const appended = appendLiveOperationReceipt({
      protocol: state.protocol,
      receipts: state.receipts,
      operation: 'export-live-lineage',
      eventSequence: state.protocol.latestEventSequence,
      coversThroughEventSequence: state.protocol.preparedEventSequence,
      turnSequence: state.protocol.latestTurnSequence,
      coversThroughTurnSequence: state.protocol.preparedTurnSequence,
      latestEventSequence: state.protocol.latestEventSequence,
      preparedEventSequence: state.protocol.preparedEventSequence,
      latestTurnSequence: state.protocol.latestTurnSequence,
      preparedTurnSequence: state.protocol.preparedTurnSequence,
      exportCount: state.protocol.exportCount + 1,
      artifactIds: selected.map((entry) => entry.id),
      clock: options.clock,
      decision: dialogueMode,
      details: { artifactCount: selected.length, genericFileFallback: false, dialogueMode, processedTurns: updateReceipts.length }
    });
    operationReceipt = summarizeLiveOperationChain({ protocol: appended.protocol, receipts: appended.receipts });
  }
  return Object.freeze({
    schema: PORTABLE_LIVE_LINEAGE_EXPORT_SCHEMA_ID,
    status: hasErrors ? 'blocked' : 'created-clean',
    dialogueMode,
    artifacts: Object.freeze(artifacts),
    lineageClosure,
    assets: Object.freeze(normalizeAssets(input.assets)),
    state: Object.freeze({ schema: state.schema, version: state.version, focusArtifactId: state.focusArtifactId, artifactIds: Object.freeze(selected.map((entry) => entry.id)), protocol: state.protocol }),
    operationReceipt,
    boundary: Object.freeze({
      dialogueMode,
      processedDialogueTurns: updateReceipts.length,
      artifactsChangedBeforeExport: updateReceipts.some((entry) => entry.decision === 'artifact-change'),
      retrospectiveArtifactSynthesis: dialogueMode === 'export-time-synthesis',
      everyRecordedTurnPrepared: prepareReceipts.length === updateReceipts.length,
      provesEveryProviderTurnObserved: false,
      portableOperationReceiptsRecorded: !hasErrors,
      genericFileFallback: false,
      sourceMutation: false,
      remoteWrite: false,
      bootstrapIncluded: false
    }),
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
}

function classifyDialogueMode(updateReceipts, prepareReceipts) {
  if (!updateReceipts.length) return 'export-time-synthesis';
  if (prepareReceipts.length !== updateReceipts.length) return 'unverified';
  if (updateReceipts.length === 1) return 'single-turn';
  return 'live-interleaved';
}
function normalizeAssets(value) {
  return normalizeArray(value).filter((entry) => entry && typeof entry === 'object' && (
    String(entry.path || '').trim()
    || String(entry.content ?? entry.data ?? '').length
    || Number(entry.bytes || 0) > 0
  ));
}
function normalizeStrings(value) { return [...new Set(normalizeArray(value).map(clean).filter(Boolean))].sort(); }
function normalizeArray(value) { return Array.isArray(value) ? value : value == null ? [] : [value]; }
function clean(value) { return String(value || '').replace(/\s+/g, ' ').trim(); }
