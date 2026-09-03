export const HANDOFF_HUMAN_OUTPUT_PRESENTATION = Object.freeze({
  copyableSurfaceRequired: true,
  exactContentRequired: true,
  fencedCodeBlockWhenSupported: 'required',
  markdownCapableHostRendering: 'fenced-code-block',
  equivalentCopyableSurfaceAllowed: true,
  wrapperAuthority: 'none',
  hostCapabilityRule: 'Use a fenced code block when the chat host supports fenced copyable blocks; otherwise use an equivalent copyable host surface without changing routing content.'
});

export const HANDOFF_NORMAL_EMISSION_BOUNDARY = Object.freeze({
  allowed: Object.freeze(['primary', 'normalInlineRouting']),
  canonicalFilePayloadCount: 1,
  workspaceArtifactsAsLooseTransportFiles: false,
  semanticWorkSummaryProse: false,
  internalHumanOutputJson: false,
  helperArtifacts: false,
  manuallyReconstructedRouting: false,
  duplicateNormalFileChoices: false,
  exception: 'Only when the user explicitly asks for explanation or review evidence.'
});
