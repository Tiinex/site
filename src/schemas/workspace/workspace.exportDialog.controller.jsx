import React, { useMemo, useState } from 'react';
import { buildWorkspaceExportPlan, ExportType } from '../../export/export.plan.js';
import { buildWorkspaceGithubPublicationPreflight, buildWorkspaceGithubPublicationProduct, confirmWorkspaceGithubPublicationMutation, copyWorkspaceGithubPublicationPayload, GITHUB_PUBLICATION_MODE, openWorkspaceGithubPublicationTarget, publicationProgressFor, verifyWorkspaceGithubPublication } from '../../app/workspaceGithubPublication.js';
import { WorkspaceExportDialog } from './workspace.exportDialog.views.jsx';

export function WorkspaceExportDialogController({ workspace = {}, onDismiss, onExecute, onPublicationResult }) {
  const [exportType, setExportType] = useState(ExportType.tree);
  const [publicationInput, setPublicationInput] = useState({ mode: GITHUB_PUBLICATION_MODE.createIssue, recordId: '', repository: '', targetInput: '', finalTarget: '' });
  const [publicationProgress, setPublicationProgress] = useState({ copiedPlanSha256: '', openedPlanSha256: '', mutationAttestation: null, verificationPlanSha256: '', result: null, notice: '' });
  const plan = useMemo(() => buildWorkspaceExportPlan(workspace, { exportType }), [workspace, exportType]);
  const publicationPreflight = useMemo(() => exportType === ExportType.githubPublish ? buildWorkspaceGithubPublicationPreflight(workspace) : null, [workspace, exportType]);
  const publication = useMemo(() => exportType === ExportType.githubPublish ? buildWorkspaceGithubPublicationProduct(workspace, publicationInput, { preflight: publicationPreflight }) : null, [workspace, exportType, publicationInput, publicationPreflight]);
  const currentPlanSha256 = publication?.plan?.planSha256 || '';
  const progress = publicationProgressFor(publication?.plan || {}, publication?.verificationTarget || publicationInput.finalTarget, publicationProgress);
  function updatePublicationInput(patch = {}) {
    const identityBearing = ['mode', 'recordId', 'repository', 'targetInput', 'finalTarget'].some((key) => Object.prototype.hasOwnProperty.call(patch, key));
    setPublicationInput((current) => ({ ...current, ...patch }));
    setPublicationProgress((current) => ({ ...current, mutationAttestation: identityBearing ? null : current.mutationAttestation, verificationPlanSha256: '', result: null, notice: '' }));
  }
  async function copyPublication() {
    const result = await copyWorkspaceGithubPublicationPayload(publication?.plan || {}, { clipboard: typeof navigator !== 'undefined' ? navigator.clipboard : null });
    setPublicationProgress((current) => ({ ...current, copiedPlanSha256: result.ok ? currentPlanSha256 : '', verificationPlanSha256: '', result: null, notice: result.notice || '' }));
  }
  function openPublication() {
    const result = openWorkspaceGithubPublicationTarget(publication?.plan || {}, { window: typeof window !== 'undefined' ? window : null });
    setPublicationProgress((current) => ({ ...current, openedPlanSha256: result.ok ? currentPlanSha256 : '', verificationPlanSha256: '', result: null, notice: result.notice || '' }));
  }

  function attestPublication(confirmed = true) {
    if (!confirmed) return setPublicationProgress((current) => ({ ...current, mutationAttestation: null, verificationPlanSha256: '', result: null, notice: 'Human mutation confirmation cleared.' }));
    const result = confirmWorkspaceGithubPublicationMutation(publication?.plan || {}, { finalTarget: publication?.verificationTarget || publicationInput.finalTarget });
    setPublicationProgress((current) => ({ ...current, mutationAttestation: result.ok ? result.mutationAttestation : null, verificationPlanSha256: '', result: null, notice: result.notice || '' }));
  }
  async function verifyPublication() {
    const result = await verifyWorkspaceGithubPublication(publication?.plan || {}, { finalTarget: publication?.verificationTarget || publicationInput.finalTarget, mutationAttestation: publicationProgress.mutationAttestation, fetchImpl: typeof fetch !== 'undefined' ? fetch : null });
    setPublicationProgress((current) => ({ ...current, verificationPlanSha256: result.ok ? currentPlanSha256 : '', result: result.result || null, notice: result.notice || '' }));
    if (result.ok) onPublicationResult?.(result.result, publication?.plan || {}, result.executionAttestation || null);
  }
  return <WorkspaceExportDialog workspace={workspace} plan={plan} publication={publication} publicationInput={publicationInput} publicationProgress={progress} onPublicationInput={updatePublicationInput} onPublicationCopy={copyPublication} onPublicationOpen={openPublication} onPublicationAttest={attestPublication} onPublicationVerify={verifyPublication} onDismiss={onDismiss} onExecute={onExecute} onSelectExportType={setExportType} />;
}
