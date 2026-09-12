# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 01:09:42
  - Trace: [002-1-kodax-to-anchor-site-major-005-zero-ambiguity-sigma-windows-fron.trace.md](handoffs/002-1-kodax-to-anchor-site-major-005-zero-ambiguity-sigma-windows-fron.trace.md)
  - Origin:
    - [relative](handoffs/002-1-kodax-to-anchor-site-major-005-zero-ambiguity-sigma-windows-fron.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 08:06:34
  - Authors: Anchor
  - Why: Kodax removed source-path, npm/Node and browser-resolution ambiguity; the remaining gate is one bounded human-host execution.
  - Summary: Run the exact full-source one-command real-browser gate on Sigma Windows and return only the structured result.
  - Status: ready/local

---

# Site Major 005 — Sigma Real Browser Execution Gate

## Objective

Execute the exact current self-contained local-source browser harness on Sigma's normal Windows Tiinex checkout using one unambiguous command and return the structured result without source mutation or troubleshooting-by-guessing.

## Done Criteria

- The exact carried Core, App, Site and Verse Playthings source frontier is present locally from this full carrier before execution.
- Sigma runs exactly `npm run test:browser:local-source` from the Site repository root.
- No VS Code launch configuration, sibling path argument, browser path argument, first-party npm publication or first-party registry package is required for the normal path.
- The harness may use normal public npm access for exact declared third-party dependencies and an already-installed supported browser selected by its deterministic resolver.
- Sigma returns the printed structured result or the generated `result.json` unchanged.
- A successful result must say `status: passed` and `realBrowser: true`; anything else remains a technical blocker and is returned as-is rather than debugged manually.

## Scope

Human execution only. No source edits, dependency-version substitutions, npm publication, browser download, F5 launch-profile selection, or product acceptance is requested.

## Acceptance Boundary

This gate proves only technical real-browser execution of the current Playthings candidate through the current Site/App host. It does not itself close Playthings Major 003 or constitute Sigma's later UX/product acceptance.

## Dependencies

- Accepted Site Major 005 zero-ambiguity front-door return.
- Exact current Core/App/Site/Verse Playthings source frontier carried by the test package.
- Normal public npm access for exact third-party dependencies when not already cached.
- An already-installed supported browser resolvable by the bounded browser resolver.

## Acceptance Boundary

Technical PASS requires `status: passed` and `realBrowser: true` from the harness. This is not Sigma product/UX acceptance and does not itself close Playthings Major 003.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [002-1-kodax-to-anchor-site-major-005-zero-ambiguity-sigma-windows-fron.trace.md](handoffs/002-1-kodax-to-anchor-site-major-005-zero-ambiguity-sigma-windows-fron.trace.md)
  - Value: 8D1f1nq8UCgt1oIttzeCDnWrdi6cPzp_kyFd97YUIVw

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 7J8DDayNZL14xZXWR7pPHp5U3srjS-vH_PtuBbkr91Y