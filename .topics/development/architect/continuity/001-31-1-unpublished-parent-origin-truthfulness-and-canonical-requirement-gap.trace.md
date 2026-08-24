# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-24 09:06:00
  - Authors: Anchor
  - Why: Preserve a semantic contract tension exposed while designing truthful Parent repair: current Root text requires a `browse + git` Parent Origin when Parent exists, while local/unpublished Parent material may have no truthful immutable published locator.
  - Summary: Unpublished-Parent permalink availability must be classified semantically before repair tooling invents or weakens Parent Origin requirements; Tooling must fail closed rather than fabricate publication provenance.
  - Status: draft/local

---

# Unpublished Parent Origin truthfulness and canonical requirement gap feedback

## Observed Signal

- Maintained Root currently makes `browse + git` a required Parent Origin field when `Parent` exists.
- Local continuation authoring can occur before the Parent has any truthful immutable published representation, creating an apparent contract tension for repair/creation tooling.

## Source

- Source: maintained `tiinex.root.v1` at the currently qualified Tiinex/docs representation.
- Source: Q design feedback that unpublished Parent artifacts must not receive fabricated commit-pinned GitHub permalinks merely to satisfy tooling.

## Interpretation

- Tooling cannot truthfully solve this by guessing a repository/commit or by silently weakening canonical semantics.
- The correct behavior is fail-closed reporting until Anchor/Axiom determines whether the Root requirement intentionally blocks such continuations, permits another explicit unresolved/local state, is already expressible through another Source/Origin mechanism, or needs semantic clarification.

## Feedback Target

- Target: maintained Root `Parent -> Origin` contract and any Tooling that validates, repairs, or proposes publication locators for a declared Parent.
- Target: future Axiom/Anchor semantic classification of truthful Parent Origin behavior for local/unpublished continuations.

## Feedback Received

- A legitimate local continuation may be authored before its Parent representation has been published to any immutable remote source.
- In that state there may be no truthful commit-pinned `browse + git` permalink to add. Fabricating one would be a stronger integrity/provenance defect than preserving unresolved availability.
- Parent-target digest verification may still be independently possible against qualified local Parent bytes; that does not by itself prove remote publication or authorize a fabricated permalink.
- Tooling should therefore surface the conflict/blocker explicitly rather than silently weakening a canonical requirement or inventing Git repository/commit identity.

## Disposition

- State: semantic-classification-required
- Follow-Up: Anchor/Axiom should later determine whether Parent-bearing local/unpublished artifacts are intentionally blocked until a qualifying portable Parent Origin exists, whether Root should permit an explicit unresolved/local state, whether another existing Source/Origin mechanism already expresses the case, or whether the apparent tension is only representation wording.
- Follow-Up: until classified, Loom may inspect and report this state but must not mutate canonical schema meaning.

## Limits

- This feedback does not authorize Root/schema mutation.
- Do not fabricate GitHub repository, branch, commit, or publication identity.
- Do not silently substitute mutable/latest locators for an immutable exact-representation locator.
- Do not infer that local Parent bytes being available means the Parent is published.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:93Aq7ltsxZd3bh8Kgik3K2mXQW72YdvHftRzcgjG3Qw
