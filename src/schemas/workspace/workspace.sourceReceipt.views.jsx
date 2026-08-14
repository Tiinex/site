import React from 'react';
import { materialLedgerReceiptSummary } from './workspace.viewFormatting.js';

export function SourceReceiptDetails({ latest }) {
  const surfaces = latest?.diagnostics?.surfaces || latest?.diagnostics?.sourcePlan?.surfaces || null;
  const outcome = latest?.diagnostics?.transportOutcome || null;
  const materialLedger = latest?.diagnostics?.materialLedgerReceipt || latest?.diagnostics?.materialLedger || null;
  if (!surfaces && !outcome && !materialLedger) return null;
  const rows = [];
  const pushSurface = (key, label) => {
    const item = surfaces?.[key];
    if (!item?.requested && !item?.attempted && !Number(item?.loaded || 0) && !item?.deferred && !item?.unavailable) return;
    const bits = [];
    if (item.requested) bits.push('requested');
    if (item.attempted) bits.push('attempted');
    if (Number(item.discovered || 0)) bits.push(`${Number(item.discovered || 0)} discovered`);
    if (Number(item.requestedCount || 0) && key !== 'repoFiles') bits.push(`${Number(item.requestedCount || 0)} targets`);
    if (Number(item.loaded || 0)) bits.push(`${Number(item.loaded || 0)} loaded`);
    if (Number(item.failed || 0)) bits.push(`${Number(item.failed || 0)} failed`);
    const surfaceTiers = Array.isArray(item.transportTiers) && item.transportTiers.length ? item.transportTiers.join(' + ') : String(item.transportTier || '').trim();
    if (surfaceTiers) bits.push(`via ${surfaceTiers}`);
    if (item.deferred) bits.push('deferred');
    if (item.unavailable) bits.push('unavailable');
    if (item.skipped) bits.push('skipped');
    rows.push({ key, label, text: bits.join(' · ') || 'no result' });
  };
  pushSurface('repoFiles', 'Repo files');
  pushSurface('explicitFiles', 'Explicit files');
  pushSurface('issueSnapshots', 'Issue snapshots');
  const attempted = Array.isArray(outcome?.attemptedTiers) ? outcome.attemptedTiers.join(' → ') : '';
  const winning = Array.isArray(outcome?.winningTiers) ? outcome.winningTiers.join(' + ') : '';
  return (
    <div className="tx-source-receipt-details" aria-label="Source receipt details">
      {rows.map((row) => <span key={row.key}><strong>{row.label}</strong><small>{row.text}</small></span>)}
      {materialLedger ? <span><strong>Material</strong><small>{materialLedgerReceiptSummary(materialLedger)}</small></span> : null}
      {outcome ? <span><strong>Transport</strong><small>{attempted ? `attempted ${attempted}` : 'attempted tiers unavailable'}{winning ? ` · used ${winning}` : ''}</small></span> : null}
    </div>
  );
}

