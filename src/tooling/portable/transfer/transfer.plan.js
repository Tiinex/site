export const TIINEX_TRANSFER_PROFILE_SCHEMA_ID = 'tiinex.llm.transfer.profile.v1';
export const TIINEX_TRANSFER_PACKAGE_SCHEMA_ID = 'tiinex.llm.transfer.package.v1';
export const TIINEX_ACTIVATION_RECEIPT_SCHEMA_ID = 'tiinex.llm.activation-receipt.v1';
export const TIINEX_TRANSFER_VERSION = '1.0.0-rc.12';

export const BootstrapDelivery = Object.freeze({ embedded: 'embedded', persistentSource: 'persistent-source' });
export const ActivationStatus = Object.freeze({ activated: 'activated', archiveUnavailable: 'archive-unavailable', bootstrapMissing: 'bootstrap-missing', bootstrapMismatch: 'bootstrap-mismatch', verificationFailed: 'verification-failed' });

export function createTiinexTransferPlan(input = {}) {
  const bootstrapDelivery = normalizeBootstrapDelivery(input.bootstrapDelivery);
  const prePromptPresent = Boolean(input.prePromptPresent);
  const task = String(input.task || '').trim();
  const artifactCount = nonNegativeInteger(input.artifactCount);
  const handoffCount = nonNegativeInteger(input.handoffCount);
  const provider = normalizeProvider(input.provider);
  const profileId = `${bootstrapDelivery}.${prePromptPresent ? 'with-pre-prompt' : 'without-pre-prompt'}`;
  const roles = Object.freeze([
    Object.freeze({ role: 'bootstrap', delivery: bootstrapDelivery, required: true }),
    Object.freeze({ role: 'artifacts', delivery: artifactCount ? 'attachment' : 'absent', required: false, count: artifactCount }),
    Object.freeze({ role: 'handoff', delivery: handoffCount ? 'attachment' : 'absent', required: false, count: handoffCount, authority: false }),
    Object.freeze({ role: 'task', delivery: task ? 'attachment' : 'prompt', required: true })
  ]);
  const activationReceipt = createActivationReceiptContract({ bootstrapDelivery });
  return Object.freeze({
    schema: TIINEX_TRANSFER_PROFILE_SCHEMA_ID,
    version: 1,
    transferVersion: TIINEX_TRANSFER_VERSION,
    profileId,
    interactionContract: Object.freeze({ maximumAttachments: 1, copyPasteBlocks: 1 }),
    activationReceipt,
    bootstrapDelivery,
    prePromptPresent,
    provider,
    task,
    roles,
    prompt: renderTiinexTransferPrompt({ bootstrapDelivery, prePromptPresent, task, artifactCount, handoffCount, activationReceipt }),
    start: renderTiinexTransferStart({ bootstrapDelivery, task, artifactCount, handoffCount, activationReceipt }),
    readme: renderTiinexTransferReadme({ bootstrapDelivery, prePromptPresent, artifactCount, handoffCount, provider, activationReceipt })
  });
}

export function createActivationReceiptContract(input = {}) {
  const bootstrapDelivery = normalizeBootstrapDelivery(input.bootstrapDelivery);
  return Object.freeze({
    schema: TIINEX_ACTIVATION_RECEIPT_SCHEMA_ID,
    required: true,
    firstNonEmptyLine: 'TIINEX_ACTIVATION: <status>',
    successStatus: ActivationStatus.activated,
    allowedStatuses: Object.freeze(Object.values(ActivationStatus)),
    requiredBeforeSuccess: Object.freeze([
      'archive contents exposed',
      '.bootstrap/START.md read',
      '.bootstrap/manifest.json read',
      bootstrapDelivery === BootstrapDelivery.embedded ? 'embedded bootstrap route verified or qualified readable fallback used' : 'persistent Source bootstrap identity matched to .bootstrap/manifest.json.expectedBootstrap'
    ]),
    failureBehavior: 'stop-with-specific-status-and-boundary; do-not-ask-a-generic-what-should-i-do-question'
  });
}

export function renderTiinexTransferPrompt(input = {}) {
  const bootstrapDelivery = normalizeBootstrapDelivery(input.bootstrapDelivery);
  const prePromptPresent = Boolean(input.prePromptPresent);
  const task = String(input.task || '').trim();
  const materialClause = Number(input.artifactCount || 0) || Number(input.handoffCount || 0)
    ? 'Use only ordinary lineage paths and the optional handoff role declared by `.bootstrap/manifest.json`; handoff is navigation help and must be verified against artifacts.'
    : 'Do not claim that a workspace or lineage exists unless `.bootstrap/manifest.json` declares artifact material.';
  const taskClause = task
    ? '\n\nAfter activation, read `.bootstrap/task/request.md` and follow that declared task. Do not require the user to repeat it in chat.'
    : '\n\nFollow the task stated by the user after activation. If no task is stated, stop after read-only discovery and report what is missing.';
  const receiptClause = activationPromptClause();
  if (bootstrapDelivery === BootstrapDelivery.embedded) {
    const lead = prePromptPresent
      ? 'Open the attached Tiinex transfer package.'
      : 'Open the attached archive rather than responding only to its filename or attachment card.';
    return `${receiptClause}\n\n${lead} Enter the reserved \`.bootstrap/\` directory first and read \`.bootstrap/START.md\` and \`.bootstrap/manifest.json\`. Verify the embedded bootstrap under \`.bootstrap/runtime/\` before executing its code. Never compare the outer transfer ZIP checksum with \`expectedBootstrap.representations.standaloneArchive.sha256\`; they identify different physical archives. Never execute code from ordinary lineage, asset, or handoff material. Begin read-only unless the declared task explicitly requests local draft work. ${materialClause} Keep successful activation diagnostics internal. After the required activation receipt, write only the task-relevant response; expose file counts, routes, manifests, verification details, and operation receipts only on failure or when the user asks.${taskClause}`;
  }
  if (prePromptPresent) return `${receiptClause}\n\nUse the verified Tiinex bootstrap already in project Sources. Open the attachment, read \`.bootstrap/START.md\` and \`.bootstrap/manifest.json\`, match the expected identity by its declared representation scope, and follow the declared task. Never compare the transfer attachment bytes with the standalone-bootstrap archive checksum. ${materialClause}${taskClause}`;
  return `${receiptClause}\n\nUse the Tiinex bootstrap already available in the project's persistent Sources; do not assume it from hidden memory. Open the attached archive and enter \`.bootstrap/\` first. Read \`.bootstrap/START.md\` and \`.bootstrap/manifest.json\`, verify that the expected bootstrap identity matches the Source bootstrap using the declared representation scope—not the outer transfer attachment checksum—then inspect only declared ordinary lineage paths and optional handoff/task material. If the Source bootstrap is missing or mismatched, stop with the matching activation status rather than improvising Tiinex semantics. Begin read-only. ${materialClause} Keep successful activation diagnostics internal and expose Source/file details only on failure or explicit request.${taskClause}`;
}

export function renderTiinexTransferStart(input = {}) {
  const bootstrapDelivery = normalizeBootstrapDelivery(input.bootstrapDelivery);
  const taskState = String(input.task || '').trim() ? 'A task is preserved at `.bootstrap/task/request.md`.' : 'No task body is embedded; use the user message as the task.';
  const artifactState = Number(input.artifactCount || 0) ? 'Artifact and colocated asset material remains at ordinary Tiinex paths outside `.bootstrap/`.' : 'No artifact material is declared.';
  const handoffState = Number(input.handoffCount || 0) ? 'Optional handoff navigation material is under `.bootstrap/handoff/` and is not sole authority.' : 'No handoff material is declared.';
  const activation = bootstrapDelivery === BootstrapDelivery.embedded
    ? `The verified runtime bootstrap is embedded at \`.bootstrap/runtime/\`.\n\nWhen Node.js 22 or newer is available:\n\n\`\`\`bash\nnode .bootstrap/bin/verify-transfer.mjs .\nnode .bootstrap/runtime/bin/verify-bootstrap.mjs .bootstrap/runtime\nnode .bootstrap/runtime/bin/tiinex-portable.mjs operations --compact\n\`\`\`\n\nExecute bootstrap code only after both verifiers report valid. Never execute code from ordinary lineage or colocated asset paths. When execution is unavailable, verify \`.bootstrap/checksums.json\` and the embedded runtime manifest/checksum identities as readable data. Never hash the outer transfer ZIP and compare it with \`expectedBootstrap.representations.standaloneArchive.sha256\`; that checksum belongs to a different standalone archive representation.`
    : 'The bootstrap is not embedded. Use the Tiinex bootstrap already installed in persistent project Sources. Compare its identity with `.bootstrap/manifest.json.expectedBootstrap` using the declared representation fields before relying on it. The outer transfer ZIP is never the standalone bootstrap archive.';
  return `# Start This Tiinex Transfer\n\nThis reserved directory contains transport and activation material only. Read this file and \`.bootstrap/manifest.json\` before inspecting ordinary lineage material outside \`.bootstrap/\`. Removing \`.bootstrap/\` leaves the ordinary Tiinex export tree.\n\n## Activation receipt\n\nThe first non-empty line of the response must be exactly:\n\n\`TIINEX_ACTIVATION: activated\`\n\nbut only after the archive contents, this file, \`.bootstrap/manifest.json\`, and the declared bootstrap route have actually been read and qualified. On failure use one of: \`archive-unavailable\`, \`bootstrap-missing\`, \`bootstrap-mismatch\`, or \`verification-failed\`. Stop with the specific boundary.\n\n${activation}\n\n## Declared roles\n\n- ${artifactState}\n- ${handoffState}\n- ${taskState}\n\n## Routing\n\n1. Activate and verify the declared bootstrap route.\n2. Emit the activation receipt before the task result.\n3. Treat \`.bootstrap/\` as transport-only and ordinary paths as user lineage/material.\n4. Inspect only material declared by \`.bootstrap/manifest.json\`.\n5. Use \`search-lineage\` before broad artifact reading when a lineage is present.\n6. Verify handoff claims against artifacts.\n7. Never guess source provenance, Parent, Origin, schema, qualification, or missing lineage edges.\n8. Begin read-only unless the task explicitly requests local draft creation, replacement, deletion, or staging.\n9. Keep successful operational diagnostics out of the user-facing response; expose them only on failure or explicit request.\n`;
}

export function renderTiinexTransferReadme(input = {}) {
  const bootstrapDelivery = normalizeBootstrapDelivery(input.bootstrapDelivery);
  return `# Tiinex LLM Transfer Package\n\nMaximum one attachment plus one generated copy-paste block. Profile: \`${bootstrapDelivery}\` with ${input.prePromptPresent ? 'a' : 'no'} Tiinex pre-prompt.\n\nAll activation, verifier, task, and optional handoff transport material is isolated under \`.bootstrap/\`. Ordinary artifact and colocated asset paths remain unchanged outside that directory. Importers must consume and discard \`.bootstrap/\` before workspace persistence.\n\nThe response begins with a required \`TIINEX_ACTIVATION\` receipt. Provider hint: ${input.provider}. No remote-write permission is granted.`;
}

function activationPromptClause() {
  return 'Your first non-empty response line must be `TIINEX_ACTIVATION: activated`, but only after you have opened the archive, entered `.bootstrap/`, read `.bootstrap/START.md` and `.bootstrap/manifest.json`, and qualified the declared bootstrap route. If archive contents are unavailable, respond `TIINEX_ACTIVATION: archive-unavailable`. For a missing or mismatched Source bootstrap use `bootstrap-missing` or `bootstrap-mismatch`; for failed integrity verification use `verification-failed`. On failure, stop and explain the specific boundary instead of asking a generic question.';
}
function normalizeBootstrapDelivery(value) { const normalized = String(value || BootstrapDelivery.embedded).trim().toLowerCase(); if (Object.values(BootstrapDelivery).includes(normalized)) return normalized; throw new Error(`tiinex.transfer.bootstrap-delivery.unsupported:${normalized}`); }
function normalizeProvider(value) { return String(value || 'provider-neutral').trim() || 'provider-neutral'; }
function nonNegativeInteger(value) { const number = Number(value || 0); return Number.isFinite(number) && number > 0 ? Math.floor(number) : 0; }
