# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.feedback.v1](https://github.com/Tiinex/docs/blob/e713557f8be630967571d11a73f9ecd05ae329ce/.topics/.schemas/core/feedback/tiinex.feedback.v1.schema.md)
  - Created At: 2026-08-25 19:56:00
  - Authors: Anchor
  - Why: Preserve the first genuinely fresh recipient-v2 cold-start observation after Sigma human acceptance, including both the successful semantic recovery and the concrete preferred-path defects that block default promotion.
  - Summary: 027-5-17 fresh Loom cold-start is recovered-not-preferred: Loom independently found READ, selected Handoff, Loom Role, controlling Task, and package-local Parent lineage, but performed pre-takeover native inspection and ground-cold-consumer failed with portable.cold-start.handoff.route-bytes.unreadable before bounded archive recovery.
  - Status: correction-required/local/recovered-not-preferred

---

# 027-5-17 fresh recipient cold-start observation

## Observed Signal

- Fresh Loom identified `001-1-READ-BEFORE-PROCEEDING.trace.md` as its first meaningful orientation artifact.
- It resolved the selected Handoff through `001-3-1-handoff-pointer.trace.md`, qualified the exact carried Handoff bytes/hash, grounded the Loom Role, and identified Tooling 027-5-17 as the controlling read-only qualification Task.
- It correctly read the package-local Parent chain as Handoff Pointer -> package-local Workspace -> package-local `001` root, while keeping the durable Workspace artifact inside the exact Workspace archive semantically separate.
- It reported that native inspection of visible carrier material occurred before packaged Tooling takeover, so the run was not pristine preferred-path evidence.
- Packaged `orient-handoff-package` returned ready.
- Packaged `ground-cold-consumer` returned blocked with `portable.cold-start.handoff.route-bytes.unreadable` because the recipient-v2 route projection exposed the Workspace ZIP carrier path while the grounding implementation attempted to decode that outer ZIP file directly as Handoff Markdown.
- Loom recovered the exact Handoff, Role, and Task through bounded targeted archive reads rather than broad archaeology.

## Interpretation

- The carrier is semantically understandable to a genuinely fresh recipient and the package-local Parent/pathing model survived fresh consumption.
- This run is not preferred-path PASS and must not promote recipient-v2 or its invocation to default.
- The route-bytes failure is a concrete Tooling defect rather than an LLM interpretation failure: recipient-v2 route grounding must resolve the declared Workspace archive plus workspace-relative Handoff path before parsing Handoff Markdown.
- A separate transport ambiguity remains: a standard outer invocation should name the stable package entry artifact explicitly so a recipient does not infer its initial file when more than one Handoff/material branch exists.

## Feedback Target

- Target: `tiinex-site-027-5-17-anchor-to-loom.handoff-package.zip` and its fresh Loom cold-start consumption under the frozen generic outer invocation.
- Review Surface: first orientation behavior, selected route grounding, package-local Parent traversal, Role/Task recovery, native fallback use, and cold-consumer Tooling disposition.

## Feedback Received

- Fresh Loom reported successful semantic recovery of the intended Handoff, Role, Task, and Parent lineage.
- Fresh Loom explicitly classified the run as `recovered-not-preferred`, not preferred-path PASS.
- Fresh Loom reported one pre-takeover native-inspection deviation and one concrete packaged Tooling blocker: `portable.cold-start.handoff.route-bytes.unreadable`.
- Fresh Loom stated that it recovered through bounded targeted archive reads and was ready to accept only the bounded read-only Handoff, not to promote recipient-v2 to default.

## Source

- Source: fresh Loom 027-5-17 cold-start response observed in the newly created Loom dialogue and relayed to Anchor by Sigma on 2026-08-25.
- Evidence Type: direct fresh-recipient observation plus Loom self-reported Tooling operation outcomes.
- Fidelity Limit: the screenshot and response establish the reported sequence and exact Tooling finding code but do not by themselves prove every internal host action beyond what Loom reported.

## Disposition

- Cold-Start State: recovered-not-preferred.
- Semantic Recovery: PASS.
- Preferred Tooling Path: FAIL.
- Default Promotion: blocked.
- Correction Required: explicit standard entry invocation plus recipient-v2-aware `ground-cold-consumer` route-byte resolution.
- Retest Required: one new genuinely fresh recipient after the correction; do not reuse this Loom dialogue as cold-start evidence.

## Evidence Boundary

- Source: fresh Loom 027-5-17 response observed by Sigma and returned to Anchor on 2026-08-25.
- Preserved Observation: first orientation artifact, selected Handoff, Role, Task, Parent/path interpretation, pre-takeover native-inspection deviation, exact route-byte failure code, bounded recovery, and Loom's recovered-not-preferred disposition.
- Does Not Mean: eventual recovery is preferred-path PASS, one fresh recipient proves every host/provider, filenames independently establish Parent authority, or default promotion is authorized.

## Limits

- Does Not Mean: successful bounded recovery is preferred-path PASS, one fresh Loom proves every provider/host, filenames independently create Parent authority, or this observation authorizes default activation.
- Must Preserve: the accepted package-local Parent/pathing model, exact Workspace archive authority, explicit failure evidence, v1 isolation until promotion, and a genuinely fresh dialogue for the correction retest.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: lRSZGmI0F3CRI-MIqj4IHhXxPRfcJV7zahgAAYVT5bU
