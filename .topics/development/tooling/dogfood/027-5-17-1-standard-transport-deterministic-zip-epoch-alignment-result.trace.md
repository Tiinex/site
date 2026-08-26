# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.decision.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/decision/tiinex.decision.v1.schema.md)
  - Created At: 2026-08-25 19:38:00
  - Authors: Anchor
  - Why: Close the last byte-level reproducibility difference found while preparing the 027-5-17 standardizable recipient-v2 transport: the browser/shared stored-ZIP writer encoded DOS date zero while the portable deterministic writer encoded the valid deterministic epoch 1980-01-01.
  - Summary: Align the shared export ZIP writer with the portable deterministic ZIP epoch so a physically parsed recipient-v2 package can be reserialized with identical outer ZIP bytes rather than only identical file bytes.
  - Status: accepted/local

---

# Tooling 027-5-17.1 — standard transport deterministic ZIP epoch alignment result

## Decision

- State: accepted bounded correction.
- Subject: deterministic stored-ZIP header date used by the shared export writer and portable recipient-v2 writer.
- Decision: use DOS time `00:00:00` and DOS date `0x0021` (`1980-01-01`) in both writers. Do not change compression, entry bytes, filenames, ordering authority, semantic package content, or Handoff behavior.
- Boundary: byte-level transport reproducibility only; no Tiinex semantic schema or artifact identity rule changes.

## Basis

- The first 027-5-17 physical roundtrip produced exact entry paths, lengths, digests, recipient-v2 topology, orientation, context audit, and file-byte comparison, but the outer ZIP SHA differed after reserialization.
- Binary comparison isolated the mismatch to local/central ZIP header DOS date fields: portable output used valid deterministic `1980-01-01`, while the shared export writer used date zero.
- Aligning the epoch removes an implementation-only serializer discrepancy and strengthens reproducible transport without changing carried material bytes.

## Validation Evidence

- `src/export/package.zip.test.mjs`: PASS with explicit deterministic time/date assertions.
- `src/export/package.transportFoundation.test.mjs`: PASS.
- `src/tooling/portable/handoff/archiveCarrierV2.test.mjs`: PASS.
- `tools/validate-static.mjs`: exactly five retained historical oversized-source findings; no new finding.
- `npx --no-install tsc -p tsconfig.json`: PASS in `10.87 s` in the Anchor host.
- Final recipient-v2 package manufacture and physical exact-byte roundtrip are performed after this artifact and correction are present in the Workspace.

## Consequences

- Recipient-v2 physical roundtrip may now require both exact file-byte identity and exact outer deterministic ZIP identity for this serializer path.
- Existing historical ZIPs are not rewritten; their SHA values remain historical transport evidence.
- The correction is shared export/tooling behavior and is not a new Handoff semantic requirement.

## Interpretation Limits

- Does Not Mean: equal ZIP SHA proves semantic truth, Handoff acceptance, or logical artifact identity beyond exact representation equality.
- Must Not Be Used To Claim: historical archives with the prior deterministic date representation are invalid merely because their outer SHA differs.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: -l6BlIXxxS9oP4RQewt2Rr7rnPccQDkWmEXnhSuZGPw
