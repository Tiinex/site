# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-08-21 23:22:01
  - Authors: Tiinusen; Architect
  - Why: Durable design direction from Tiinusen + Architect dogfooding discussion; recorded so future workers do not have to reconstruct hosted/local workspace bootstrap intent from chat history.
  - Summary: Site workspace configuration bootstrap and discovery direction
  - Status: draft/local

---

# Site workspace configuration bootstrap and discovery direction

This topic captures the current direction for Site workspace configuration bootstrap and discovery direction.

## Current Read

Tiinex Site should use workspace artifacts as the durable authority for what a Viewer workspace discovers. The local/refactor Site worktree should carry a repository-owned default workspace configuration that discovers the development artifacts in the Site repository. The hosted tiinex.dev deployment should be configurable with an explicit workspace-config artifact URL; the initial hosted config may live in a selected GitHub Issue and may discover the selected Issue set, including the Issue that contains the config artifact itself. A separate user-selectable workspace such as “Work in Progress” may point discovery at Tiinex/site repository files so ongoing development lineage can be observed publicly.

## Design Direction

Treat the initial workspace-config location as a minimal bootstrap/configuration seam, not as source-specific product logic. Resolution of that reference belongs to existing adapters/resolvers; the resolved workspace artifact owns ordinary source discovery. Verify existing Site/PoC capability before adding implementation: if the web app can already be configured with a workspace artifact URL and existing adapters can resolve that representation, this direction should require configuration/deployment wiring rather than a new GitHub-Issue loader. Keep .topics as a configurable workspace convention/default rather than semantic authority. Remote workspace/schema/companion/transition material remains declarative data; no remote executable code is introduced. Mutable workspace config identity may resolve to a current representation while execution receipts preserve which concrete representation was actually used.

## Next Artifacts

After the v478 schema material/reference closure, verify the current Site and PoC bootstrap/config URL path, adapter resolution for workspace-config artifacts, self-containing Issue discovery/deduplication, and hosted/local default selection before proposing code. Preserve a “Published/curated” hosted default and a selectable “Work in Progress” workspace only if existing capability evidence supports the configuration model.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: gB9V9MyEDKycZy5zzl2KvmTGOS6CTgwtemtIOaWldko
