# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-08-31 23:02:58
  - Trace: [Static Closure Debt Tranche A Source Recovery — Loom To Anchor](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-loom-to-anchor-tranche-a-source-recovery-return-handoff.trace.md)
  - Origin:
    - [relative](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-loom-to-anchor-tranche-a-source-recovery-return-handoff.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-09-01 01:17:00
  - Authors: Anchor; Sigma
  - Why: Keep Foundation validation small, use-case-oriented, and resistant to permanent regression-test accumulation while preserving truthful acceptance.
  - Summary: Foundation Test Strategy Consolidation
  - Status: accepted/local

---

# Foundation Test Strategy Consolidation

The current pre-production Foundation test corpus is too large and historically additive for the intended Tiinex development loop. This decision establishes the test shape that now governs bounded Foundation work.

## Decision

- State: accepted
- Subject: Site/Foundation automated test strategy during pre-production and later production bug repair
- Decision: permanent automated tests should primarily be component- and use-case-based acceptance surfaces. Standalone regression tests are not the default pre-production response to implementation changes. When a production bug requires exact reproduction, a regression test may be introduced as temporary bug evidence, but after the fix its durable behavior should normally be absorbed into the relevant component/use-case suite and the standalone regression test retired unless it protects a genuinely separate invariant that cannot be represented truthfully there.
- Operating Rule: the test corpus must be actively consolidated rather than allowed to grow monotonically. New development should update an existing component/use-case contract before creating another permanent test entrypoint.
- Validation Shape: routine validation should expose only a few fast suite entrypoints. Broad integration/closure may add explicit non-test validators for distinct risks, but must not regain hundreds of historical regression-test steps merely by enumeration.

## Basis

- The current accepted Site Workspace contains 338 `*.test.mjs` files. The dominant concentrations are 97 under `src/acceptance`, 82 under `src/tooling`, 48 under `src/app`, and 33 under `src/workspaces`.
- Current validation profiles have already accumulated hundreds of integration/closure steps while ordinary LLM recipients tend to run available tests ambitiously during cold work. The resulting shape increases iteration cost and encourages further additive regression tests.
- Sigma explicitly prefers component/use-case testing as the permanent contract surface and regards standalone regression testing as primarily appropriate for reproducing production bugs before folding the behavior back into the durable use case.
- The cleanup is justified by iteration speed, human comprehensibility, cold-start discipline, smaller transport/runtime surface, and reduced implementation-shape coupling even if current hypotheses about external host false-positive checks are later falsified. No hidden host trigger is claimed known.

## Consequences

- Aggressive test consolidation is authorized before broad work on the seven larger inherited static owners.
- Loom may statically harvest the unique behavior contracts represented by the current test corpus, build a small set of component/use-case suites, move still-valid behavior into those suites, and delete historical/duplicative implementation-shape tests and fixtures that add no unique current contract.
- Routine `smoke` and `focused/tooling` should converge on a single-digit number of meaningful suite entrypoints and complete in low minutes or less under the current local runtime.
- `integration` and `closure` should compose the same small permanent suites plus explicitly named validators for distinct risks; they must not use exhaustive historical `*.test.mjs` enumeration as a substitute for contract design.
- A large retained standalone test set requires explicit unique-contract justification in return evidence rather than being preserved by inertia.
- Test reduction must not weaken current semantic truth, carrier/cold-start behavior, component/use-case behavior, or the strict static closure boundary.
- Host-safety hypotheses remain observational only and must not be turned into evasion, bypass, suppression, or claims about hidden platform internals.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [Static Closure Debt Tranche A Source Recovery — Loom To Anchor](002-1-1-1-1-1-1-1-1-1-1-1-2-1-1-1-1-1-1-1-1-1-1-1-1-1-loom-to-anchor-tranche-a-source-recovery-return-handoff.trace.md)
  - Value: 1uhWQgIh1h9TpC-5dYbgzxYxoBx7JN6HH1BXIyhdJmE

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:0DO_cXiilw7vz62ka0KFVryZC7v40NIbeVmleq8U67U
