<!-- Contract-only test fixture for Tiinex/docs@068241174421716b941421e95931ec5a6e95b0da. Portal Time schema/body contract is byte-unchanged from the prior canonical baseline; only machine-authoritative validation contract surface is retained here. -->
# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: tiinex.portal.v1
  - Trace: portal.trace.md
  - Origin: portal.trace.md
- Current
  - Current Schema: tiinex.portal.time.v1
  - Created At: 2026-07-02 00:00:00

---

# Portal Time

## Schema Validation Contract

### Portal Time Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.portal.time.v1`

Rules

- `tiinex.portal.time.v1` identifies artifacts whose main job is to define or record a time-bounded source-resolution portal.
- A time portal inherits portal semantics from `tiinex.portal.v1` and adds requested time, time resolution policy, source-state anchor, and temporal interpretation boundaries.
- A time portal must not use artifact `Created At` as proof of source state when a resolved source anchor is unavailable or contradictory.
- Prose outside `Schema Validation Contract` may explain the schema, but it does not add required validation rules.

### Portal Time Body

Required Shape

- first body heading after the continuity envelope
- `## Portal Intent` section
- `## Requested Time` section
- `## Target Source` section
- `## Time Resolution Policy` section
- `## Resolution State` section
- `## Result Boundary` section
- `## Interpretation Limits` section

Optional Sections

- `Resolved Source State`
- `Discovery Scope`
- `User Input Boundary`
- `Follow-up Actions`
- `Related Artifacts`
- `Examples`
- `Relationship to Portal Base`

Rules

- Required sections should be readable without specialized tooling.
- Required sections should make the temporal request, resolution boundary, result state, and interpretation limits clear.
- Optional sections must not imply historical completeness unless backed by a resolved source-state anchor or appropriate method.

### Portal Intent

Required Fields

- Portal Type
- Reason

Optional Fields

- Portal ID
- Intended Reader
- Intended Use
- Not For

Rules

- `Portal Type` should be `time` or a clear time-specialized child value.
- `Reason` should state why a time-bounded source view is needed.
- A time portal must remain a source-resolution boundary, not a generic timeline or UI state.

### Requested Time

Required Fields

- Requested Time
- Timezone
- Interpretation

Optional Fields

- Time Window Start
- Time Window End
- Precision
- Source Clock
- User Local Time
- Artifact Created At Fallback

Allowed Labels

- at
- at-or-before
- at-or-after
- before
- after
- between
- nearest-before
- nearest-after
- current-state-fallback

Rules

- Requested time must be human-readable.
- Timezone or unknown timezone state must be explicit.
- If the requested time is approximate, precision must be stated.
- Artifact `Created At` may be used as fallback projection metadata, not as proof of source state.

### Target Source

Required Fields

- Source Kind
- Source Identifier

Optional Fields

- Repository
- Ref
- Branch
- Root Path
- Source URL
- Source Schema
- Source Artifact
- Source Trust Boundary

Rules

- Target source identifies the source whose temporal state is requested.
- Target source does not prove temporal availability, completeness, evidence status, or preservation.

### Time Resolution Policy

Required Fields

- Resolution Mode
- Required Inputs
- Fallback Behavior

Optional Fields

- Historical Source Capability
- No API Policy
- Accepted User Inputs
- User-Invoked Source UI
- Resolver
- Completeness Policy
- Failure Policy
- Source Access Mode
- Git Ref Policy
- Local Git Archive Boundary
- Browser Remote Git Boundary
- Service Boundary

Allowed Labels

- git-commit-at-or-before
- git-tree-url
- git-local-log
- git-local-blob-read
- git-remote-shallow-fetch
- archive-snapshot
- mirror-snapshot
- source-timestamp
- user-supplied-anchor
- current-state-fallback
- no-api-manual-ref
- unavailable
- web-surface
- local-working-tree
- local-git-archive
- browser-remote-git
- service-backed-git

Rules

- Resolution mode must state how the requested time may be translated into a source-state anchor.
- Git-backed time resolution may use `web-surface`, `local-working-tree`, `local-git-archive`, `browser-remote-git`, or `service-backed-git`, but the access mode must remain separate from the time-resolution result.
- `local-git-archive` should mean an explicitly user-provided local repository containing Git history; it must not imply hidden upload, hidden network access, source completeness, evidence status, or preservation.
- `browser-remote-git` should state shallow, branch, checkout, CORS, authentication, browser storage, memory, and repository-size boundaries when they affect resolution.
- `service-backed-git` should state service trust, authentication, privacy, and disclosure boundaries when they affect resolution.
- If a full source-state anchor is required but missing, `needs-input` should be used instead of `failed`.
- A user-supplied anchor must remain labeled as user-supplied unless independently resolved or verified.
- Short commit labels may be displayed, but full commit SHAs should be preferred when available.
- A resolved commit, tree, or blob is a source-state anchor; it does not by itself create evidence, validation, preservation, or truth.

### Resolution State

Required Fields

- State
- Resolved By

Optional Fields

- Resolver
- Resolved At
- Resolution Confidence
- User Input Used
- Missing Inputs
- Failure Reason

Allowed Labels

- not-started
- needs-input
- resolving
- resolved
- partial
- failed
- unavailable
- skipped
- deferred

Rules

- Resolution state describes time-portal resolution, not artifact validity or evidence status.
- `needs-input` means the portal needs more input; it is not a failure state.
- `resolved` should identify a source-state anchor or explain why the resolution is current-state-only.

### Resolved Source State

Required Fields

- Anchor Kind
- Anchor

Optional Fields

- Commit SHA
- Short Label
- Tree URL
- Archive URL
- Mirror ID
- Snapshot ID
- Source Timestamp
- Observed At
- Resolution Confidence

Rules

- Resolved anchors should be stable enough to revisit or audit when the source supports stable anchors.
- Full commit SHAs should be recorded when available; short SHAs may be used as display labels only.
- A resolved source state does not by itself preserve source material.

### Result Boundary

Required Fields

- Snapshot Boundary
- Completeness
- Preservation State
- Evidence State

Optional Fields

- Historical Guarantee
- Known Limits
- Fallback Semantics
- Promotable To Finding
- Promotable To Evidence

Rules

- Snapshot boundary must state whether the result is source-ref-bounded, current-web-state-only, user-supplied-anchor, manifest-bounded, partial, or unknown.
- Preservation and evidence state must remain distinct from source resolution.
- Current web state must not be presented as a historical snapshot.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Optional Fields

- Known Ambiguities
- Trust Boundary
- Overclaim Risk
- Missing Context

Rules

- A time portal must disclose what the temporal view cannot prove.
- A time portal must not claim historical completeness, source completeness, evidence status, preservation, truth, authorship, consent, or validation unless supported elsewhere.
