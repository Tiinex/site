# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.preservation.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/preservation/tiinex.preservation.v1.schema.md)
  - Created At: 2026-08-28 12:34:00
  - Authors: Loom
  - Summary: Preserve bounded/restartable validation profiling semantics, focused verification, and real checkpoint cursor evidence.
  - Status: preserved/local

---

# Restartable Bounded Validation Profiling Preservation

## Preserved Material

- Material Description: profiler batch/checkpoint/resume contract plus focused and real validation-chain evidence.
- Material Kind: restartable non-authoritative profiling evidence.
- Fast Gate: PASS, 14/14 steps, 1,897.572 ms.
- Real Batch 1: steps 1-5, 188.303 ms, one recorded nonzero exit.
- Real Batch 2 Resume: steps 6-10, 394.398 ms, three recorded nonzero exits.
- Checkpoint Cursor: last profiled 10, current/next 11, cumulative failures 4, exact failure steps 4/6/7/8.
- Identity Contract: resume rejects changed validation-chain SHA-256 identity.
- Completion Contract: resume against a completed checkpoint executes zero child commands.

## Preservation Act

- Preservation Method: focused pure regression, atomic checkpoint writes, two real bounded validation batches, and current fast-gate execution.
- Preservation Time Or State: current warm Site state after task 027.

## Provenance

- Known Source: current `package.json` `validate` chain and current Site profiling/checkpoint tools.
- Provenance Limits: profiling records timing/nonzero exits but is not a correctness gate.

## Fidelity And Loss

- Fidelity Notes: command strings remain exact current validation-chain commands; nonzero exits are recorded rather than normalized away.
- Known Losses: failure output is bounded to a tail and prior-batch per-step bodies are not repeated in later batch receipts.

## Custody Or Storage Boundary

- Storage Or Custody State: caller-selected host-local checkpoint plus current Site source and this preservation artifact.
- Reuse Boundary: suitable for long validation timing work across bounded host calls or turns.

## Interpretation Limits

- Does Not Prove: why an unbounded host call exceeded its window, that failures are acceptable, or that external review behavior changes.
- Not Yet Used As: final validation acceptance or Anchor acceptance.
- Must Not Be Treated As: replacement for the final correctness gate or authority to skip unprofiled steps.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:dZzQDKisT7eBbLxzEggS9OEXiF6JdBdfGli3rQBtsGQ
