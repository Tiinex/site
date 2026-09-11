# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-01 09:42:00
  - Trace: [Foundation Human-First CLI And Carrier UX](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-human-first-cli-carrier-ux-decision.trace.md)
  - Origin:
    - [relative](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-human-first-cli-carrier-ux-decision.trace.md)
- Current
  - Current Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-01 09:42:00
  - Authors: Anchor
  - Why: Transfer the final inherited Tooling interface frontier to Loom as one bounded human-first CLI/carrier UX tranche before integration and closure.
  - Summary: Foundation Human-First CLI And Carrier UX — Anchor To Loom

---

# Foundation Human-First CLI And Carrier UX — Anchor To Loom

## Handoff Parties

- Purpose: make ordinary Tiinex command-line and carrier handling usable by humans and LLMs without Node-prefix knowledge or ad hoc wrapper scripts, while preserving exact semantic authority and returning before broad Foundation closure
- From: Anchor
- From Kind: role
- From Reference: [Anchor Role](https://github.com/Tiinex/business/blob/5fa225bbba1fafec91a9a9b948dcd1163037dfa0/.topics/roles/001-1-anchor-role.trace.md)
- To: Loom
- To Kind: role
- To Reference: [Loom Role](https://github.com/Tiinex/business/blob/5fa225bbba1fafec91a9a9b948dcd1163037dfa0/.topics/roles/001-3-loom-role.trace.md)

## Transfers

- human-first-command-front-door
  - Transfer Kind: work-and-responsibility
  - Description: provide a normal `tiinex` executable/package-bin surface backed by the existing runtime so ordinary callers do not need to type a Node prefix or know `tools/tiinex-portable.mjs`
  - Controlling Artifact: [Foundation Human-First CLI And Carrier UX](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-human-first-cli-carrier-ux-decision.trace.md)
  - Boundary: a Node-backed package `bin` is sufficient; do not introduce a new native runtime solely for this tranche

- human-and-llm-discoverability
  - Transfer Kind: work-and-responsibility
  - Description: make `tiinex --help` and the normal command vocabulary concise enough that a fresh human or LLM can discover orientation, bounded validation, and Handoff receive/return/manufacture flows without reading the implementation operation catalog or writing a wrapper script
  - Controlling Artifact: [Foundation Human-First CLI And Carrier UX](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-human-first-cli-carrier-ux-decision.trace.md)
  - Boundary: preserve existing exact portable operation names and JSON contracts for advanced/machine use; friendly verbs/defaults are a convenience layer

- normal-path-defaults
  - Transfer Kind: work-and-responsibility
  - Description: reduce routine Handoff/cold-start flags by reusing exact already-qualified workspace, route, parent-carrier, and projected output facts when those facts are unambiguous
  - Controlling Artifact: [Foundation Human-First CLI And Carrier UX](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-human-first-cli-carrier-ux-decision.trace.md)
  - Boundary: ambiguous or missing semantic authority must fail closed or require explicit input; defaults may not infer Workspace/Handoff/Role meaning from filenames or placement

- carrier-projection-human-ux
  - Transfer Kind: work-and-responsibility
  - Description: keep carrier dimension as human progress/retention convenience while making projected filename/output less likely to be mistaken for semantic artifact versioning; address the observed `site-001-001-...` visual ambiguity if a simpler projection can do so without weakening lineage visibility
  - Controlling Artifact: [Foundation Human-First CLI And Carrier UX](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-human-first-cli-carrier-ux-decision.trace.md)
  - Boundary: carrier filename/dimension remain semantically non-authoritative; do not bump, rewrite, synchronize, or infer artifact lineages to change transport presentation

- remaining-owner-decomposition
  - Transfer Kind: work-and-responsibility
  - Description: enter and decompose the remaining inherited oversized `src/tooling/portable/adapters/cli/cli.run.js` and `src/tooling/portable/handoff/carrierProjection.js` owners where cohesive separation supports the human-first command/carrier surface
  - Controlling Artifact: [Foundation Human-First CLI And Carrier UX](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-human-first-cli-carrier-ux-decision.trace.md)
  - Boundary: no unrelated static-cleanup sweep; new cohesive owners should remain below the existing 24,000-byte discipline

- suite-owned-contract-preservation
  - Transfer Kind: responsibility
  - Description: preserve the one permanent Foundation acceptance entrypoint plus 54 suite-owned component/use-case cases and add/adjust only suite-owned current-contract coverage needed for the executable/front-door/default/carrier UX invariants
  - Controlling Artifact: [Foundation Human-First CLI And Carrier UX](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-human-first-cli-carrier-ux-decision.trace.md)
  - Boundary: do not add standalone regression/unit/acceptance test files

- bounded-human-path-evidence
  - Transfer Kind: work
  - Description: preserve one representative fresh-shell/local-install or equivalent executable-path receipt showing that a caller can discover and invoke the normal Tiinex CLI without a Node prefix or custom wrapper, plus bounded timings only where useful
  - Controlling Artifact: [Foundation Human-First CLI And Carrier UX](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-human-first-cli-carrier-ux-decision.trace.md)
  - Boundary: no hidden-host safety/classifier inference, keyword hunting, or performance guarantee

- full-source-return
  - Transfer Kind: responsibility
  - Description: return one canonical full-source Business+Docs+Site child carrier with the modified Site Workspace, unchanged carried Business and Docs Workspaces, exact endpoint Role bytes, Loom implementation evidence, and Loom→Anchor Handoff
  - Controlling Artifact: [Foundation Human-First CLI And Carrier UX](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-human-first-cli-carrier-ux-decision.trace.md)
  - Boundary: return before broad integration, strict closure, release, publication, or Foundation stable qualification

## Required Context

- human-first-cli-carrier-ux-decision
  - Material: Foundation Human-First CLI And Carrier UX
  - Material Reference: [Anchor Decision](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-human-first-cli-carrier-ux-decision.trace.md)
  - Purpose: exact acceptance state, carrier authority reading, CLI audit findings, human-first acceptance target, owner scope, and closure boundary for this turn
  - Availability: available

## Reference Context

- cold-start-decomposition-return
  - Material: Foundation Cold-Start Qualification Decomposition — Loom To Anchor
  - Material Reference: [Loom Return](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-loom-to-anchor-foundation-cold-start-qualification-decomposition-return-handoff.trace.md)
  - Purpose: accepted previous full-source progression, exact static/runtime evidence, and current two-owner frontier
  - Availability: available

- current-source
  - Material: complete carried Business, Docs, and Site Workspaces
  - Purpose: use exact current source and do not reconstruct carried dependencies from chat or external lookup
  - Availability: available

- carrier-lineage-source-boundary
  - Material: `src/tooling/portable/handoff/carrierLineage.js` and `src/tooling/portable/handoff/coldStartQualification.materials.js`
  - Purpose: preserve the already-explicit rule that carrier lineage is human progress/retention projection only and never artifact semantic authority
  - Availability: available

- test-strategy
  - Material: `docs/architecture/foundation-test-strategy.md`
  - Purpose: preserve permanent component/use-case contracts, narrow-first validation, and temporary-regression absorption discipline
  - Availability: available

## Retained Responsibilities

- architecture-and-progression
  - Retained By: Anchor
  - Responsibility: accept/reject the human-first interface tranche and control the subsequent integration/closure/carrier-major/stable progression

- human-observation-and-acceptance
  - Retained By: Sigma
  - Responsibility: retain human transport/CLI usability observation and final Foundation product acceptance authority wherever explicit human judgment is required

## Exclusions And Dependencies

- semantic-lineage-reinterpretation
  - Kind: excluded-scope
  - Description: do not give carrier dimension, carrier filename, workspace slug, numeric pathing, or transport placement semantic artifact-version authority

- broad-validation-and-closure
  - Kind: excluded-scope
  - Description: broad `validate`, integration, strict closure, release, publication, and Foundation stable qualification remain outside this bounded Loom turn

- host-safety-internals
  - Kind: excluded-scope
  - Description: hidden host scanning, classifier rules, thresholds, trigger keywords, telemetry, and bypass mechanisms are unknown and must not be probed or inferred as fact

- test-corpus-regrowth
  - Kind: excluded-scope
  - Description: do not add standalone regression/unit/acceptance test files; durable current behavior belongs in existing suite-owned use-case/component coverage

- new-runtime-project
  - Kind: excluded-scope
  - Description: do not turn the executable front door into a Rust/Go/native-runtime rewrite; Node may remain the internal runtime while the caller sees `tiinex`

- semantic-authority-shortcuts
  - Kind: excluded-scope
  - Description: convenience defaults must not promote receipt/cache/manifest/hash/timing/filename/placement material into semantic authority or weaken exact Workspace/Handoff/Role/Required Context qualification

## Completion Expectation

- Signal Kind: result
- Signal Meaning: Anchor receives one canonical full-source return where ordinary CLI use has a discoverable `tiinex` front door without a Node prefix, normal orientation/validation/Handoff flows no longer require ad hoc wrapper scripts for the demonstrated path, exact portable operations remain available, carrier projection remains explicitly non-authoritative and is less visually ambiguous, permanent acceptance remains 54/54, focused/tooling remains 4/4, relevant CLI/manufacture/orientation/cold-start/carrier-lineage cases are green, zero new standalone tests are added, zero static regressions are introduced, and the two remaining oversized owners are resolved or any residual blocker is returned explicitly before broad closure
- Return To: Anchor
- Return To Reference: [Anchor Role](https://github.com/Tiinex/business/blob/5fa225bbba1fafec91a9a9b948dcd1163037dfa0/.topics/roles/001-1-anchor-role.trace.md)

## Interpretation Limits

- Does Not Mean: a carrier-major is semantic artifact versioning, a friendly command may guess authority, a Node-backed executable is inferior to a native binary, static zero alone closes Foundation, or host checkpoint behavior is understood
- Must Not Be Used To Claim: permission to synchronize artifact lineages with carrier dimension, permission to infer Handoff/Workspace/Role truth from filenames, permission to remove exact machine operations, permission to regrow the historical test corpus, or permission to enter broad closure without a new Anchor boundary
- Authority Limits: Loom owns this bounded implementation/evidence; Anchor retains architecture/progression acceptance; Sigma retains human usability observation and final product acceptance authority

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Foundation Human-First CLI And Carrier UX](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-anchor-foundation-human-first-cli-carrier-ux-decision.trace.md)
  - Value: EVNQhJdn_hKQ8L6kXwiBGT6pIdb2IIYAaWeObxr8cs4

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:FCm2ZVnHONslwj9BdrsrNluACRAyPiM84DL6PiCPv_Q
