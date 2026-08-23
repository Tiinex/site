# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 10:05:00
  - Trace: [Handoff transport workspace and artifact routing](001-9-3-handoff-transport-workspace-artifact-routing-decision.trace.md)
  - Origin:
    - [relative](001-9-3-handoff-transport-workspace-artifact-routing-decision.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 11:00:00
  - Authors: Anchor
  - Why: Loom returned a six-file changed-only carrier exactly because the controlling Handoff requested it. The return was usable by the still-warm Anchor with an exact known base, but it exposed a continuity hazard: a Role-to-Role return that depends on prior workspace/chat state cannot safely survive recipient replacement, context loss, or onward routing to another fresh Role.
  - Summary: Role-to-Role Handoff transport defaults to an independently groundable recipient-relative Handoff package; changed-only carriers are merge conveniences and may substitute only when the human explicitly requests that transport purpose.
  - Status: accepted/local

---

# Handoff carrier purpose boundary

## Decision

- State: accepted
- Subject: carrier-purpose distinction for Tiinex Handoff and merge transport
- Decision: transport between Roles must default to a recipient-relative Handoff package that contains or qualifiedly references the controlling Handoff and the material closure needed by the recipient to ground from package truth without relying on previous chat, workspace, or carrier state. A changed-only ZIP is a merge optimization, not a Handoff package, and must not be used as the normal Role-to-Role continuity carrier.
- Human exception: a changed-only carrier may replace or accompany normal packaging when the human explicitly requests a merge-oriented or otherwise purpose-specific carrier. A Role's own convenience request is not sufficient to silently downgrade Role-to-Role continuity.
- Parallel carriers: when useful, one bounded result may expose both an independently groundable Handoff package for the next Role and a changed-only ZIP for human merge convenience. The two carriers have different purposes and neither inherits the other's authority.

## Basis

- The fresh Loom companion Handoff incorrectly asked Loom to return a `merge-ready changed-only ZIP` even though the semantic transfer was Role-to-Role. Loom correctly followed that Completion Expectation, so the defect belongs to the Handoff/transport design rather than Loom execution.
- The returned carrier contained only six changed files while its result artifact depended on the controlling Handoff, `001-9-2`, `001-9-3`, predecessor Role, successor-migration Task, and current workspace truth outside the carrier. It was therefore reconstructible only because Anchor still held the exact preceding workspace state.
- A session/context limit, fresh Anchor replacement, or onward transfer to Axiom/Kodax would make such a carrier depend on hidden prior state and recreate chat continuity in filesystem form.
- Existing recipient-relative Handoff package machinery already supports explicit material requirements, workspace/source mirrors, provenance, authority boundaries, correlation, descriptor inspection, and roundtrip verification. The safer default therefore exists and should be used rather than weakened for convenience.

## Consequences

- Future Role-to-Role Handoffs must not request changed-only return as their default Completion Expectation. They should require a proper recipient-relative Handoff package or equivalent independently groundable return.
- Changed-only ZIPs remain preferred for `Role -> Q` merge transport when Q explicitly asks for merge material: exact repository hierarchy from ZIP root, changed files only, no wrapper directory, and no implied Handoff semantics.
- A warm Role may inspect or apply a changed-only carrier when its exact base is independently known, but must not forward that carrier as if it were a fresh-recipient Handoff package.
- Package builders/companions may later project carrier purpose (`handoff`, `merge`, or another qualified purpose), but runtime convenience must not redefine Handoff semantics or turn package type into endpoint/acceptance authority.
- Historical Handoffs and returns remain truthful evidence of the contract used at the time; do not rewrite them merely to conform to this later correction.

## Review Conditions

Reopen if a stronger canonical transport contract establishes equivalent independent grounding without a recipient-relative package, if a host can prove an exact shared state boundary that intentionally changes the continuity requirement, or if real Role-to-Role dogfood shows this default introduces material cost without preserving continuity value.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:nK8knX_2JF3ahUCBgb5d6fBmNT1jl-GcY63mnaVpumo
