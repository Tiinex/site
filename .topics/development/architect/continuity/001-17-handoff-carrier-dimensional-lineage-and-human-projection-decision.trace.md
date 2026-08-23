# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-23 13:23:00
  - Trace: [ChatGPT host transport budget and single-primary-deliverable feedback](001-16-chatgpt-host-transport-budget-and-single-primary-deliverable-feedback.trace.md)
  - Origin:
    - [relative](001-16-chatgpt-host-transport-budget-and-single-primary-deliverable-feedback.trace.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-23 14:38:00
  - Authors: Anchor
  - Why: Preserve the transport-naming and dimensional-lineage model exposed by Q's host workflow without promoting disposable ZIP filenames into Handoff, Parent, completion, or package-schema authority.
  - Summary: Treat Handoff carrier dimensions as local human pathing/progress projection, default outer filenames to workspace/dimension/from-to, allow parallel carriers to share a dimension, and keep all semantic continuity inside artifacts/package truth.
  - Status: accepted/local

---

# Handoff carrier dimensional lineage and human projection decision

## Decision

- State: accepted
- Subject: disposable outer Handoff-carrier naming, dimensional lineage vocabulary, parallel transport naming, and collision handling
- Decision: outer Handoff ZIP filenames are disposable human transport projections. Their dimension is a local readability/pathing projection associated with the controlling Handoff artifact allocation, not semantic Parent/Trace/Origin and not package authority. A default single-route carrier name should be generated from workspace identity, dimensional path, and route-readable From/To labels; parallel carriers may intentionally share the same dimension when From/To or optional purpose slugs disambiguate them.
- Trust Level: local transport/readability decision / not canonical ZIP schema semantics
- Does Not Mean: filename path implies Parent, dimension proves completion, major bump closes prior work, From/To in a filename assigns a Role, renamed ZIP bytes lose continuity, or the current Handoff package format becomes canonical merely because filenames are standardized.

## Vocabulary

- Dimensional Lineage: local allocation/navigation/progress lineage such as `003`, `003-1`, `003-1-1`; useful for pathing and human orientation, never a replacement for explicit Parent/Trace/Origin.
- Handoff Turn: one local allocation/node in that dimensional lineage. This term is distinct from an LLM/chat turn.
- Major Dimension: the first normally zero-padded three-digit segment, e.g. `001`, `002`, `003`.
- Phase: human interpretation of a major as a larger progress interval. It is a signal, not a completion promise.
- Branch: parallel or diverging local dimensional paths. Similar numeric shape does not itself create semantic relations.

## Default Carrier Projection

Preferred single-route human filename shape:

```text
<workspace-name-slug>-<dimension>-<from>-to-<to>[optional-short-purpose].handoff-package.zip
```

Examples:

```text
tiinex-site-003-1-anchor-to-loom.handoff-package.zip
tiinex-site-003-1-anchor-to-axiom.handoff-package.zip
tiinex-site-003-1-anchor-to-kodax.handoff-package.zip
tiinex-site-003-1-1-loom-to-anchor.handoff-package.zip
```

- `workspace-name-slug` is the workspace-readable slug; in current Tiinex repositories it commonly resembles organization plus repository name, e.g. `tiinex-site`, but the convention is workspace identity rather than a universal `<org>-<repo>` semantic split.
- `dimension` is copied/projected from the locally allocated controlling-artifact dimensional path. Carrier naming must not invent or bump an artifact dimension merely to avoid a filesystem collision.
- `from-to` is a human route/disambiguation projection only; authoritative Handoff parties remain inside the Handoff artifact.
- Optional purpose text should remain short and only be added when route labels are insufficient for human distinction.

## Parallelism And Shared Dimensions

- Same workspace + same dimension + different From/To is normal and collision-free. Parallel work does not need artificial child dimensions merely to make filenames unique.
- Example parallel outbound carriers may all use `003-1` while their route slugs differ: `anchor-to-loom`, `anchor-to-axiom`, `anchor-to-kodax`.
- Parallel returns may likewise share the same return dimension while route slugs distinguish `loom-to-anchor`, `axiom-to-anchor`, and `kodax-to-anchor`.
- Different child dimensions remain available when the work intentionally expresses different local dimensional paths/turns; uniqueness alone is not sufficient reason to allocate them.
- A future shared physical carrier may contain multiple independently qualified Handoff routes so one immutable source package can be carried to multiple recipients with different minimal routing texts. Until Tooling supports this explicitly, human prose must not override a package companion that names only one controlling Handoff.

## Collision Rule

If the full projected filename would collide even after workspace + dimension + route/purpose disambiguation, first materialized carrier keeps the clean filename. Later physical copies may receive a transport-only suffix such as:

```text
tiinex-site-003-1-loom-to-anchor.handoff-package.zip
tiinex-site-003-1-loom-to-anchor--2.handoff-package.zip
tiinex-site-003-1-loom-to-anchor--3.handoff-package.zip
```

The `--N` suffix is disposable filename-instance hygiene only. It must not be parsed as dimensional lineage, Handoff turn, Parent, retry semantics, or source authority.

## Downloads / Host Workspace Boundary

- Q's Downloads/host library should be treated operationally as a disposable transport workspace: filenames should avoid accidental replacement and remain easy to identify, but old carrier files may be deleted without continuity loss.
- Renaming an outer ZIP is safe because package/artifact identity and continuity live inside the package. A ZIP carrier need not retain durable history after successful transport.
- Current docs explicitly keep dimension prefixes as local allocation/readability convention and Parent/Trace/Origin as semantic continuity authority. Current `tiinex.zip.v1` is reserved/not maintained and therefore supplies no canonical ZIP-artifact semantics to upgrade this transport convention.

## Progress Interpretation

- A major bump is a strong local readability/progress signal that work has moved into another coherent phase; it is not proof that every prior branch is closed.
- Completion/closure remains owned by explicit Result/Decision/Validation/Handoff state.
- Major counts may later support estimation only after observed major cost/variance is measured; `N majors remaining` is initially a planning projection, not a fixed-duration unit.

## Consequences

- Outer carrier naming can become deterministic Tooling projection while remaining rename-safe and non-authoritative.
- Q can visually follow progress and parallel routes without parsing package internals or conflating numeric filename shape with Parent semantics.
- Multi-route shared-carrier support and single-primary human output remain implementable Tooling concerns; they should consume this decision rather than re-derive transport semantics from chat memory.

## Review Conditions

Revisit this decision if maintained Tiinex ZIP/package semantics later define stronger carrier identity, if canonical filename rules explicitly cover outer Handoff packages, or if shared-route manufacturing reveals a collision between this human projection and authoritative package routing. Preserve the semantic boundary even if display syntax changes.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:IKAjPHFSv3D5d_3zyi17qTEqsBbGUx1rwyJwKdynM6U
