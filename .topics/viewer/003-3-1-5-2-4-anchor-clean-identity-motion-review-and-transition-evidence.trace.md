# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-06 17:19:34
  - Trace: [Pilot To Anchor — Clean Identity Then Motion Retarget Return](003-3-1-5-2-3-pilot-to-anchor-clean-identity-then-motion-retarget-return-handoff.trace.md)
  - Origin:
    - [relative](003-3-1-5-2-3-pilot-to-anchor-clean-identity-then-motion-retarget-return-handoff.trace.md)
- Current
  - Current Schema: [tiinex.evidence.v1](https://github.com/Tiinex/docs/blob/089427470f04336dfcc100c4dcf6289d51bf0291/.topics/.schemas/core/evidence/tiinex.evidence.v1.schema.md)
  - Created At: 2026-09-06 20:08:00
  - Authors: Anchor; Sigma
  - Why: Record Anchor-side review of the returned two-phase identity/motion execution, deterministic motion preview, Pilot process observations, reusable UAL authority infrastructure, and the basis for a full-scale fresh-Anchor transition.
  - Summary: Clean static identity plus independent motion retarget is continuation-ready; Pilot multi-turn guidance worked, exact outputs are preserved, and final promotion remains intentionally open for the next Anchor.
  - Status: accepted/local

---

# Anchor Clean Identity Motion Review And Major Transition Evidence

## Supported Claim Or Question

- Supported Claim Or Question: The Playthings visual-production track now has a reproducible two-phase pattern that separates static character identity from authored motion, a functioning Pilot-mediated multi-turn execution boundary, deterministic alpha/motion review tooling, and a self-contained UAL motion-authority source/factory suitable for continued sheet-family production.
- Evidence Role: transition and process evidence; supports continuation readiness without pretending every generated image is already a stable production asset.
- Target Artifact: [Pilot-Mediated Clean Identity Then Motion Retarget](003-3-1-5-2-pilot-clean-identity-then-motion-retarget-task.trace.md)

## Exact Returned Outputs

- Phase-1 static identity master: [003-3-1-5-2-2-generated-identity-01.png](003-3-1-5-2-2-generated-identity-01.png), SHA-256 `34bab9ff6cb26d790f91198812b6497b60c540a7bfe1c5346b9242ebb8a13676`.
- Phase-2 motion source: [003-3-1-5-2-2-generated-motion-01.png](003-3-1-5-2-2-generated-motion-01.png), SHA-256 `7d95a5ee1a37cb8954ccfe463b224175fca60dd9f5f1c00d7bf5c9943f2620d8`.
- Pilot preserved both native files byte-for-byte before return and made no visual acceptance claim.

## Anchor Motion Review

- Stabilized transparent review: [003-3-1-5-2-4-review-motion.webp](003-3-1-5-2-4-review-motion.webp), SHA-256 `b207ae6e5d90c527b9433473663b937e57e87c57c3906f12b106645bb326e4c0`.
- Ordered contact review: [003-3-1-5-2-4-contact-review.png](003-3-1-5-2-4-contact-review.png), SHA-256 `7334bb49943b521d3f54a7090437acb635b70d6199fc6bcce9e856ce8fb37fe6`.
- Machine report: [003-3-1-5-2-4-review-report.json](003-3-1-5-2-4-review-report.json), SHA-256 `7502b8dc9addcb9908ef01cca531e0e590a614d2512e8a2a0e2eb83d6f981f87`.
- The motion PNG is 1536×1024 RGBA. Lossless WebP round-trip preserved alpha exactly in Anchor review. Mean adjacent normalized silhouette IoU was approximately 0.568 and wrap IoU approximately 0.715, providing useful phase separation without the near-static adjacent-frame behavior seen in earlier rejected attempts.
- Human observation during the track judged the newer externally-authoritied walk behavior natural enough to continue. This Evidence intentionally leaves final stable promotion of this specific new identity/motion pair to the next Anchor rather than collapsing process proof into asset acceptance.

## Process Findings

- **Static identity first:** identity authority should be non-animated by default for motion work. The successful Phase-1 turnaround avoided the motion contamination seen when identity references also contained walk frames.
- **External motion authority:** authored motion references work better than asking the image model to invent biomechanics. UAL-based color-coded skeleton authorities are deterministic and can produce multiple directions from one animation clip.
- **Pilot multi-turn:** Pilot successfully guided Phase 1 and Phase 2, preserved outputs, and returned a lineage-correct package. Human control needed explicit phase/terminal signals in this host; language-neutral/English operational control is preferred for cold-started Pilot guidance.
- **Terminal containment:** after explicit final return instruction, Pilot completed Evidence + return manufacture. Ambient return-target searching observed earlier is a containment concern already reported to the main Anchor; Playthings continues to work around it without redefining generic tooling authority.
- **File lifetime:** transient generated identity/motion remain beside their execution Evidence. Do not move them into stable reference storage until a reviewing Anchor explicitly promotes selected bytes or deterministic derivatives.

## Stable Reusable Motion Infrastructure

- UAL Standard CC0 source: `reference/playthings/external/ual-standard/UAL1_Standard.glb` plus bundled license/readme.
- Deterministic factory: `tools/playthings/generative_visual/ual_motion_template_factory.py`.
- Proven Walk_Loop authorities: `reference/playthings/production/carrier-003/ual-template-factory-v01/`.
- Existing deterministic sprite postprocess/review tool: `tools/playthings/generative_visual/motion_sheet_tool.py` with tests.

## Carrier Boundary

Previous Pilot experiments accidentally projected some malformed Carrier continuations. Artifact lineage remained independent and is preserved here. The next full-scale Handoff intentionally advances the last known correct Carrier Major 003 line to **Carrier Major 004**. This Major transition is transport/progress metadata only; it does not rewrite the `003-...` artifact lineage or imply product completion.

## Interpretation Limits

- Does Not Prove: every future sheet family will retarget perfectly; this exact identity/motion pair is already a stable production asset; provider internals are deterministic; or the generic Pilot/tooling hardening work is complete.
- Must Not Be Used To Claim: asset promotion without an explicit disposition, schema truth from pixels, or that Carrier Major 004 changes artifact Parent/Trace/Origin semantics.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Pilot To Anchor — Clean Identity Then Motion Retarget Return](003-3-1-5-2-3-pilot-to-anchor-clean-identity-then-motion-retarget-return-handoff.trace.md)
  - Value: mTTO6y8gekUDZ4LjvFe3dmXpqzazHjRk4gM5cwNSfb8

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: M40CaSl7zjURJBpgjnyobcm4l0PZ6jPeDr_uoyMG-00
