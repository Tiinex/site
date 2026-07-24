import React from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { buildWorkspaceAuditView } from '../../workspaces/workspace.auditView.js';
import { buildWorkspaceRecoverabilityView } from '../../workspaces/workspace.recoverabilityView.js';
import { compactPath, validationStateLabel } from './workspace.viewFormatting.js';

export function WorkspaceAuditState({ workspace, query = '', records = [], assets = [], workspaceCandidates = [], onOpenRecord }) {
  const audit = buildWorkspaceAuditView(workspace, { records, query });
  const recovery = buildWorkspaceRecoverabilityView(workspace, { records, assets, workspaceCandidates });
  const counts = audit.visibleCounts || audit.counts || {};
  return (
    <section className="tx-workspace-audit-state" aria-label="Loaded audit">
      <header className="tx-audit-header">
        <div>
          <strong><Icon name="audit" /> {audit.title}</strong>
          <small>{audit.boundary}</small>
        </div>
        <div className="tx-audit-stats" aria-label="Audit stats">
          <span><strong>{counts.records || 0}</strong><small>records</small></span>
          <span><strong>{counts.invalid || 0}</strong><small>invalid</small></span>
          <span><strong>{counts.degraded || 0}</strong><small>degraded</small></span>
          {counts.supporting ? <span><strong>{counts.supporting}</strong><small>supporting</small></span> : null}
          {counts.validationPartial ? <span><strong>{counts.validationPartial}</strong><small>partial validation</small></span> : null}
          <span><strong>{counts.missingLineage || 0}</strong><small>missing lineage</small></span>
        </div>
      </header>
      <div className="tx-audit-finding-summary" aria-label="Audit finding summary">
        <span><Icon name={counts.errors ? 'warning' : 'check'} /> {counts.errors || 0} errors</span>
        <span><Icon name={counts.warnings ? 'warning' : 'check'} /> {counts.warnings || 0} warnings</span>
        <span><Icon name="audit" /> {counts.rootFallback || counts.fallbackUsed || 0} root fallback</span>
        <span><Icon name="open" /> {counts.rootReadable || 0} root-readable</span>
        {counts.unavailableBody ? <span><Icon name="warning" /> {counts.unavailableBody} body unavailable</span> : null}
        {counts.childValidatorUnavailable ? <span><Icon name="warning" /> {counts.childValidatorUnavailable} validator unavailable</span> : null}
        {counts.integrityV2 ? <span><Icon name="check" /> {counts.integrityV2} v2 integrity methods</span> : null}
        <span><Icon name="lineage" /> {counts.lineageFindings || 0} lineage findings</span>
      </div>
      {audit.lineage.findings.length ? (
        <div className="tx-audit-lineage-findings" aria-label="Loaded lineage audit findings">
          {audit.lineage.findings.slice(0, 6).map((finding, index) => (
            <span key={`${finding.code}-${finding.nodeId}-${index}`} className={`tx-lineage-finding tx-${finding.severity || 'info'}`} title={finding.message}>
              <Icon name={(finding.severity === 'warning' || finding.severity === 'error') ? 'warning' : 'check'} /> {finding.code}
            </span>
          ))}
        </div>
      ) : null}
      <AuditRecoverabilitySummary recovery={recovery} />
      <div className="tx-audit-record-list" role="list" aria-label="Loaded audit records">
        {audit.items.map((item) => <AuditRecordRow key={item.id} item={item} onOpenRecord={onOpenRecord} />)}
      </div>
      {audit.empty ? <p className="tx-tree-empty">No loaded records match this audit view.</p> : null}
    </section>
  );
}

function AuditRecoverabilitySummary({ recovery }) {
  if (!recovery) return null;
  const counts = recovery.counts || {};
  const latest = recovery.latestImport;
  return (
    <section className={`tx-audit-recovery-summary tx-recovery-${recovery.status || 'recoverable'}`} aria-label="Recoverability summary">
      <header>
        <strong><Icon name={recovery.status === 'needs-attention' ? 'warning' : 'check'} /> {recovery.status || 'recoverable'}</strong>
        <small>{recovery.boundary}</small>
      </header>
      <div className="tx-audit-recovery-grid">
        <span><strong>{counts.localRecords || 0}</strong><small>local records</small></span>
        <span><strong>{counts.sourceBackedRecords || 0}</strong><small>source-backed</small></span>
        <span><strong>{counts.assets || 0}</strong><small>assets</small></span>
        <span><strong>{counts.workspaceCandidates || 0}</strong><small>workspaces</small></span>
        <span><strong>{counts.previewOmitted || 0}</strong><small>preview omitted</small></span>
      </div>
      {latest ? <p className="tx-audit-recovery-latest"><Icon name={latest.ok ? 'check' : 'warning'} /> {latest.message}</p> : null}
      {recovery.publicationPreflight ? <AuditPublicationPreflight preflight={recovery.publicationPreflight} /> : null}
      {recovery.reingestPlan ? <AuditReingestPlan plan={recovery.reingestPlan} /> : null}
      {recovery.exportPackagePreflight ? <AuditExportPackagePreflight preflight={recovery.exportPackagePreflight} /> : null}
      {recovery.exportPackageManifest ? <AuditExportPackageManifest manifest={recovery.exportPackageManifest} receipt={recovery.exportPackageReceipt} /> : null}
      <ul className="tx-audit-recovery-guarantees">
        {(recovery.guarantees || []).slice(0, 4).map((item) => <li key={item}>{item}</li>)}
      </ul>
      {(recovery.errors?.length || recovery.warnings?.length) ? (
        <div className="tx-audit-recovery-issues">
          {[...(recovery.errors || []), ...(recovery.warnings || [])].slice(0, 6).map((issue, index) => (
            <span key={`${issue.code}-${issue.path}-${index}`} title={issue.message || issue.code}><Icon name="warning" /> {issue.code}{issue.path ? ` · ${compactPath(issue.path)}` : ''}</span>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function AuditPublicationPreflight({ preflight }) {
  const counts = preflight.counts || {};
  return (
    <div className={`tx-audit-publication-preflight tx-preflight-${preflight.status || 'unknown'}`} aria-label="Publication preflight">
      <span><Icon name={preflight.status === 'blocked' ? 'warning' : 'check'} /> publication preflight: <strong>{preflight.status || 'unknown'}</strong></span>
      <span>{counts.publishableLocalDrafts || 0} publishable local draft{(counts.publishableLocalDrafts || 0) === 1 ? '' : 's'}</span>
      <span>{counts.sourceReferences || 0} source reference{(counts.sourceReferences || 0) === 1 ? '' : 's'}</span>
      {(counts.errors || counts.warnings) ? <span>{counts.errors || 0} errors · {counts.warnings || 0} warnings</span> : null}
    </div>
  );
}

function AuditExportPackagePreflight({ preflight }) {
  const counts = preflight.counts || {};
  return (
    <div className={`tx-audit-publication-preflight tx-export-package-${preflight.status || 'unknown'}`} aria-label="Export package preflight">
      <span><Icon name={preflight.status === 'blocked' ? 'warning' : 'check'} /> export package: <strong>{preflight.status || 'unknown'}</strong></span>
      <span>{counts.packageEntries || 0} package entr{(counts.packageEntries || 0) === 1 ? 'y' : 'ies'}</span>
      <span>{counts.localDraftEntries || 0} local draft{(counts.localDraftEntries || 0) === 1 ? '' : 's'} · {counts.sourceReferenceEntries || 0} source ref{(counts.sourceReferenceEntries || 0) === 1 ? '' : 's'}</span>
      {(counts.errors || counts.warnings) ? <span>{counts.errors || 0} errors · {counts.warnings || 0} warnings</span> : null}
    </div>
  );
}

function AuditExportPackageManifest({ manifest, receipt }) {
  const counts = manifest.counts || {};
  return (
    <div className={`tx-audit-publication-preflight tx-export-manifest-${manifest.status || 'unknown'}`} aria-label="Export package manifest">
      <span><Icon name={manifest.status === 'blocked' ? 'warning' : 'check'} /> package manifest: <strong>{manifest.status || 'unknown'}</strong></span>
      <span>{counts.entries || 0} planned entr{(counts.entries || 0) === 1 ? 'y' : 'ies'} · {counts.blocked || 0} blocked</span>
      <span>{manifest.integrity?.fingerprint || 'no fingerprint'}</span>
      {receipt ? <span>receipt: {receipt.state || 'unknown'}</span> : null}
    </div>
  );
}

function AuditReingestPlan({ plan }) {
  const counts = plan.counts || {};
  return (
    <div className={`tx-audit-publication-preflight tx-reingest-${plan.status || 'unknown'}`} aria-label="Re-ingest plan">
      <span><Icon name={plan.status === 'blocked' ? 'warning' : 'check'} /> re-ingest plan: <strong>{plan.status || 'unknown'}</strong></span>
      <span>{counts.pinnedSourceTargets || 0}/{counts.sourceTargets || 0} pinned source target{(counts.sourceTargets || 0) === 1 ? '' : 's'}</span>
      <span>{counts.localDraftTargets || 0} local draft target{(counts.localDraftTargets || 0) === 1 ? '' : 's'}</span>
      {(counts.errors || counts.warnings) ? <span>{counts.errors || 0} errors · {counts.warnings || 0} warnings</span> : null}
    </div>
  );
}

function AuditRecordRow({ item, onOpenRecord }) {
  const findings = item.findings || [];
  return (
    <button type="button" className={`tx-audit-record-row tx-audit-status-${item.status || 'unknown'}`} role="listitem" onClick={() => onOpenRecord?.(item.id)} title={item.path || ''}>
      <span className="tx-audit-record-main">
        <Icon name={item.status === 'readable' ? 'check' : 'warning'} />
        <strong>{item.title}</strong>
      </span>
      <span className="tx-audit-record-meta">
        <Badge>{item.status}</Badge>
        <Badge>{item.readState || 'read-state unknown'}</Badge>
        <Badge>{validationStateLabel(item.validationState)}</Badge>
        <Badge>{item.schemaId || 'markdown'}</Badge>
        <Badge>{item.sourceBacked ? 'source-backed' : 'local/session'}</Badge>
        {item.fallbackUsed ? <Badge>root fallback</Badge> : null}
        {item.path ? <small>{compactPath(item.path)}</small> : null}
      </span>
      {findings.length ? <small className="tx-audit-record-findings">{findings.slice(0, 3).map((finding) => finding.code).join(' · ')}</small> : null}
    </button>
  );
}
