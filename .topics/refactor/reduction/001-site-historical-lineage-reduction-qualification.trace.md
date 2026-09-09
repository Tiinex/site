# Continuity Context

- Envelope Schema: tiinex.root.v1
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 15:03:19
  - Trace: [001-turn-2-thin-site-integration-frontier.trace.md](../001-turn-2-thin-site-integration-frontier.trace.md)
  - Origin:
    - [relative](../001-turn-2-thin-site-integration-frontier.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-09 15:03:22
  - Authors: Anchor
  - Why: Large historical directories are useful reduction signals but cannot replace semantic/currentness proof.
  - Summary: Requalify a bounded historical Reduction without converting cleanup intent into delete authority.
  - Status: ready/local

---

# Site historical lineage Reduction qualification

## Objective

Reduce inactive Site development lineage only where exact source, currentness, semantic closure, recovery and destructive eligibility are all qualified.

## Done Criteria

- Candidate paths and preimage bytes are exact and immutable for the qualification run.
- Ongoing obligations are retained or truthfully reissued before any historical source disappears.
- Parent/recovery closure remains inspectable after the proposed deletion.
- Partial qualification produces a smaller independently requalified candidate; blocked items remain retained.
- Actual deletion remains behind the final Anchor destructive gate.

## Scope

Historical Site lineage only. No broad cleanup by age, directory size or filename depth alone.

## Dependencies

- Parent Site Turn-2 task.
- Existing `.topics/026-thin-site-hygiene-historical-reduction-task.trace.md` and current Reduction receipts.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-turn-2-thin-site-integration-frontier.trace.md](../001-turn-2-thin-site-integration-frontier.trace.md)
  - Value: Lb9Wx4rW0RKO-0ZHLYrPFSHmdH-u2Y-mEKsoF4R8KmM

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 0ze0AWrzwAebTwGSLHRJXQOvjyfV4ZA70YEUjYpwims