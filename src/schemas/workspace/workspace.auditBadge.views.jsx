import React, { useState } from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Modal } from '../../ui/primitives/Modal.jsx';
import { readStateLabel, schemaCoverageLabel, validationStateLabel, validatorLabel } from './workspace.viewFormatting.js';

export function auditBadgeForRecord(record = {}, auditItem = null) {
  const item = auditItem || null;
  const status = String(item?.status || '').toLowerCase();
  const readState = String(item?.readState || '').toLowerCase();
  const bodyAvailability = String(item?.bodyAvailability || '').toLowerCase();
  if (status === 'readable') {
    if (readState === 'root-readable') return { label: 'root ok', tone: 'ok', title: 'Root envelope is readable through the Root companion.' };
    if (item?.fallbackUsed || readState === 'root-fallback') return { label: 'fallback', tone: 'fallback', title: 'Readable through Root fallback; exact child schema companion did not validate this card.' };
    return { label: 'schema ok', tone: 'ok', title: 'Loaded leaf passed schema/audit checks; byte-level integrity is not claimed.' };
  }
  if (status === 'supporting-material') return { label: 'doc', tone: 'open', title: 'Plain Markdown supporting material; not an invalid Tiinex leaf.' };
  if (status === 'pending-unavailable' || readState === 'unavailable-body' || bodyAvailability === 'unavailable-body') return { label: 'body missing', tone: 'pending', title: 'The route/session preserved metadata, but the Markdown body is not loaded.' };
  if (status === 'degraded') return { label: (item?.fallbackUsed || readState === 'root-fallback') ? 'fallback' : 'open', tone: (item?.fallbackUsed || readState === 'root-fallback') ? 'fallback' : 'pending', title: (item?.fallbackUsed || readState === 'root-fallback') ? 'Readable through Root fallback with warnings; child-specific companion is not available.' : 'Readable with warnings; review lineage/source confidence.' };
  if (status) return { label: 'mismatch', tone: 'mismatch', title: 'Audit found errors or incomplete Tiinex leaf structure.' };
  if (record?.hasIntegrity || record?.hasContinuityContext || record?.schemaId) return { label: 'open', tone: 'pending', title: 'Lineage/audit status is not fully resolved yet.' };
  return { label: 'doc', tone: 'open', title: 'Supporting material.' };
}

export function AuditStatusBadge({ record, item }) {
  const [open, setOpen] = useState(false);
  const badge = auditBadgeForRecord(record, item);
  const title = record?.title || item?.title || 'Artifact';
  return (
    <>
      <button type="button" className={`tx-badge tx-audit-badge tx-audit-badge-${badge.tone} tx-audit-badge-button`} title={`${badge.title} Open compact status explainer.`} aria-label={`Explain ${badge.label} status for ${title}`} onClick={(event) => { event.preventDefault(); event.stopPropagation(); setOpen(true); }}>{badge.label}</button>
      {open ? <AuditBadgeDialog record={record} item={item} badge={badge} onDismiss={() => setOpen(false)} /> : null}
    </>
  );
}

export function AuditBadgeDialog({ record = {}, item = null, badge = {}, onDismiss }) {
  const status = String(item?.status || 'not audited');
  const readState = String(item?.readState || (record?.markdown ? 'not indexed' : 'unknown'));
  const coverage = String(item?.schemaCoverage || 'unknown');
  const body = String(item?.bodyAvailability || (record?.markdown ? 'available' : 'unknown'));
  const validationState = String(item?.validationState || item?.validation?.state || 'validation unknown');
  const validationCoverage = String(item?.validationCoverage || item?.validation?.coverage || 'unknown');
  const childValidator = String(item?.childValidator || item?.validation?.childValidator || 'unknown');
  const integrityVersions = Array.isArray(item?.integrityMethodVersions) ? item.integrityMethodVersions : (Array.isArray(item?.validation?.integrityMethodVersions) ? item.validation.integrityMethodVersions : []);
  const findings = Array.isArray(item?.findings) ? item.findings : [];
  const summary = item?.summary || {};
  const hasFindings = findings.length > 0;
  return (
    <Modal title={`${badge.label || 'Status'} · ${record.title || item?.title || 'Artifact'}`} onDismiss={onDismiss} className="tx-audit-badge-dialog">
      <div className="tx-badge-diagnostic-summary">
        <Badge className={`tx-audit-badge tx-audit-badge-${badge.tone || 'open'}`}>{badge.label || 'status'}</Badge>
        <span>{badge.title || 'Compact status explanation.'}</span>
      </div>
      <div className="tx-badge-diagnostic-grid" aria-label="Badge diagnostic facts">
        <span><strong>Audit</strong><small>{status}</small></span>
        <span><strong>Read state</strong><small>{readStateLabel(readState)}</small></span>
        <span><strong>Schema coverage</strong><small>{schemaCoverageLabel(coverage)}</small></span>
        <span><strong>Body</strong><small>{body === 'unavailable-body' ? 'body unavailable' : body}</small></span>
        <span><strong>Validation</strong><small>{validationStateLabel(validationState)}</small></span>
        <span><strong>Validator</strong><small>{validatorLabel(childValidator, validationCoverage)}</small></span>
        {integrityVersions.length ? <span><strong>Integrity method</strong><small>{integrityVersions.join(', ')}</small></span> : null}
        {record?.schemaId || item?.schemaId ? <span><strong>Schema</strong><small>{record.schemaId || item?.schemaId}</small></span> : null}
        {record?.source?.label || item?.sourceLabel ? <span><strong>Source</strong><small>{record.source?.label || item?.sourceLabel}</small></span> : null}
      </div>
      <div className="tx-badge-diagnostic-panels">
        <section>
          <strong>What this means</strong>
          <ul>
            {badge.tone === 'ok' ? <li>The loaded material passed this card's current validation/read check.</li> : null}
            {badge.tone === 'fallback' ? <li>The artifact is readable through Root fallback, but no exact child companion owns the read view yet.</li> : null}
            {childValidator === 'unavailable' ? <li>Root v1 validation ran, but the child schema-specific validator did not run because no exact validator is registered.</li> : null}
            {validationState === 'exact-schema-validated' ? <li>The exact schema companion validator ran for this loaded material.</li> : null}
            {body === 'unavailable-body' ? <li>The source boundary or route shell is known, but the Markdown body is not loaded in this session.</li> : null}
            {badge.tone === 'mismatch' ? <li>Audit found errors or incomplete Tiinex leaf structure.</li> : null}
            {badge.tone === 'pending' || badge.tone === 'open' ? <li>The card remains inspectable, but one or more checks are incomplete, degraded, or awaiting material.</li> : null}
          </ul>
        </section>
        <section>
          <strong>What this does not verify</strong>
          <ul>
            <li>It does not prove authorship, consent, or semantic correctness.</li>
            <li>It does not fetch missing remote material or repair stale lineage.</li>
            <li>It does not turn Root fallback into a schema-owned companion.</li>
            <li>It does not claim child-schema validation when the validator is unavailable.</li>
          </ul>
        </section>
      </div>
      <details className="tx-badge-diagnostic-findings">
        <summary>Findings · {findings.length}</summary>
        {hasFindings ? findings.slice(0, 8).map((finding, index) => (
          <p key={`${finding.code || 'finding'}-${index}`}><strong>{finding.code || finding.severity || 'finding'}</strong><span>{finding.message || 'No message.'}</span></p>
        )) : <p>No findings attached to this card status.</p>}
        <p className="tx-muted">Summary: {Number(summary.error || 0)} errors · {Number(summary.warning || 0)} warnings · {Number(summary.info || 0)} info</p>
      </details>
    </Modal>
  );
}
