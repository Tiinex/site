# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-08-22 18:46:05
  - Trace: [Cold-start validation method](001-5-cold-start-validation-method.trace.md)
  - Origin:
    - [relative](001-5-cold-start-validation-method.trace.md)
- Current
  - Current Schema: [tiinex.validation.method.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/validation/method/tiinex.validation.method.v1.schema.md)
  - Created At: 2026-08-22 23:24:00
  - Authors: Architect
  - Why: Define the repeatable method used to decide whether a fresh Tiinex role can recover its work from durable material without hidden project/chat coaching.
  - Summary: Architect cold-start role qualification method for zero-coaching artifact-grounded recovery.
  - Status: draft/local

---

# Tiinex Role Cold-Start Qualification Method

## Method Identity

- Name: Tiinex role cold-start qualification
- Version: 1
- Method Family: runtime reproduction and human/LLM continuity validation
- Canonical Identifier: tiinex.role-cold-start-qualification.v1

## Verification Scope

- Verifies: that one declared role, under the recorded host/model/runtime/tool/material conditions, can recover its stable Role boundary, current Handoff/Task responsibility, relevant operating/roadmap context, authority limits, tooling discovery path, uncertainty state, and terminal-return discipline without unrecorded semantic coaching.
- Does Not Verify: permanent model capability, universal cross-model robustness, product correctness, canonical schema truth beyond supplied authority, Handoff acceptance, holder identity, long-term memory, future platform behavior, or that every role is trusted because one role passed.
- Target Types: one cold-start role session and its supplied Tiinex material/transport boundary
- Required Inputs: exact Role artifact/reference; exact current Handoff; controlling Task/current-state material; required operating/roadmap context for the tested role; declared transport/package/workspace; environment declaration; expected completion signal
- Output Signal: bounded PASS, PASS-WITH-LIMITS, or FAIL recorded through a `tiinex.validation.report.v1` artifact plus durable Feedback when correction is required

## Trust Boundary

- Trust Boundary: the exact supplied artifacts/package/workspaces, recorded host/model/runtime/tool availability, observable conversation/tool actions during the run, and the reviewer applying this method. The method trusts no hidden Project Instructions or prior chat unless their presence is explicitly declared as part of a non-baseline variant.
- Required Context: this method artifact; tested Role; current Handoff/Task; orientation baseline; package/workspace identity; applicable source/docs authority; explicit environment declaration
- Machine Verifiable: partial
- Human Verifiable: yes
- Replayable: yes, subject to model/runtime/platform variation

## Failure Modes

- Failure Modes: hidden Project Instructions or prior-chat contamination; manual rescue/coaching not recorded; transport text carrying work semantics that artifacts should own; stale or incomplete Required Context; source/package identity drift; role artifact too vague to recover pushback boundary; tooling unavailable but misclassified as Tiinex capability absence; worker guesses unknown authority; ceremonial one-shot tool use mistaken for sustained adoption; reviewer promotes one successful run into permanent trust; platform/model changes make a prior run non-representative.
- Ambiguity Risks: a medium-warm worker may appear cold if prior project context leaks; a correct fail-closed blocker may be misread as incompetence; host limitations may obscure whether the role or environment failed.
- Misuse Risks: using this method as model ranking, personality evaluation, employment assessment, or proof that no future regression can occur.

## Recommended Use

- Recommended Use: first qualification of Architect/Tooling/Dev/Schemer in a fresh project; regression qualification after Role/bootstrap/Handoff/tooling changes; comparison of no-Project-Instructions baseline versus optional project-instruction optimization.
- Not Recommended For: permanent trust labels after one run, product/Q acceptance, or replacing normal source/schema validation.
- Example UI Labels: cold-start qualified once; cold-start regression PASS; cold-start FAIL - missing context; cold-start PASS with environment limits

## Required Context

A baseline zero-coaching run records before execution:

- Project Instructions: absent
- inherited project chats/context: absent
- predecessor conversation: absent
- manual semantic coaching: none after run start
- routing message: template-only and preserved verbatim
- supplied workspace/package filenames and hashes where available
- tested Role and exact Role artifact/reference
- model/runtime/host identity as observable
- available tools/connectors/network and sandbox limits

Success pressure must cover:

- Role recovery and pushback boundary;
- current Handoff/Task/current-gate recovery;
- Architect macro-roadmap/refactor-exit recovery when Architect is tested;
- authority-dimension separation and unresolved-state preservation;
- no semantic instructions invented from package/path/chat adjacency;
- tooling discovery and repeated appropriate use when Tiinex-specific operations require it;
- bounded multi-turn scope retention;
- durable result/evidence/Feedback behavior;
- truthful terminal transport/workspace return.

Qualification levels:

- `qualification-once`: one bounded clean run under declared conditions;
- `regression-qualified`: repeated after material/tooling/Role changes under comparable baseline conditions;
- `repeatable`: multiple independent clean runs under materially similar conditions;
- `cross-runtime-robust`: demonstrated across more than one suitable model/runtime/host class;
- `trusted`: not inferred automatically from the labels above; any stronger trust claim requires separate explicit authority and evidence.

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value:0mD9Htk-A4RIPl3Cdqj1S9D-Z0Oc2Co5ohRgkuTR9so