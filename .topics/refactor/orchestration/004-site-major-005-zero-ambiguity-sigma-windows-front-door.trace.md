# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.handoff.v1](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.schemas/coordination/handoff/tiinex.handoff.v1.schema.md)
  - Created At: 2026-09-12 00:31:22
  - Trace: [001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-kodax-to-anchor-site-major-005-windows-local-source-harness-invo.trace.md](handoffs/001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-kodax-to-anchor-site-major-005-windows-local-source-harness-invo.trace.md)
  - Origin:
    - [relative](handoffs/001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-kodax-to-anchor-site-major-005-windows-local-source-harness-invo.trace.md)
- Current
  - Current Schema: [tiinex.task.v1](https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/core/task/tiinex.task.v1.schema.md)
  - Created At: 2026-09-12 00:51:00
  - Authors: Anchor
  - Why: Windows npm invocation is repaired, but the current front door still asks Sigma to supply four path placeholders and browser location manually.
  - Summary: Finish Site Major 005 human execution ergonomics so the standard Sigma action is one command with sibling-source and browser resolution handled safely.
  - Status: ready/local

---

# Site Major 005 — Zero-Ambiguity Sigma Windows Front Door

## Objective

Finish the human execution ergonomics of the still-open Site Major 005 browser gate so Sigma can run one ordinary command from the standard Tiinex Site checkout without supplying sibling-repository paths, choosing a VS Code launch profile, or manually locating a browser executable on a normal supported Windows installation.

## Done Criteria

- On the standard Tiinex multi-repository checkout layout, `npm run test:browser:local-source` defaults Core, App and Verse Playthings roots to the expected sibling repositories and still validates exact package names/versions before use.
- Explicit `--core`, `--app`, `--playthings`, `--site`, and `--browser` overrides remain supported and take precedence.
- Browser smoke can resolve an already-installed compatible Chrome/Chromium/Edge executable on Windows through a bounded deterministic candidate list, or use an available Playwright-managed browser; it reports the chosen executable/source explicitly.
- No browser is downloaded automatically and no aggressive probing/polling is introduced.
- The only normal Sigma action becomes `npm run test:browser:local-source` from the Site checkout; failures remain structured by stage and tell Anchor the smallest next blocker.
- Add Windows/path-with-spaces/default-root/browser-resolution regressions and preserve the existing first-party local-pack, source-state and no-publication guarantees.
- If this execution host still lacks public third-party dependencies, return the exact blocker without manufacturing browser PASS.

## Scope

Site-owned local-source harness/browser smoke operator ergonomics only, continuing the existing Site Carrier Major 005. No Playthings feature work, no App/Core mutation, no Native Verse work, no first-party publication.

## Dependencies

- Accepted Site Major 005 Windows npm invocation repair.
- Exact current Core/App/Verse Playthings sibling source set.
- Existing browser-smoke executable resolution contract and focused Windows regressions.

## Acceptance Boundary

This continuation improves the human front door. A genuine real-browser PASS still requires execution on Sigma's dependency-capable Windows host and remains separate from Prism/Sigma product acceptance.

---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-kodax-to-anchor-site-major-005-windows-local-source-harness-invo.trace.md](handoffs/001-1-1-1-1-1-1-1-1-1-1-1-1-1-1-1-kodax-to-anchor-site-major-005-windows-local-source-harness-invo.trace.md)
  - Value: AjN-1TUaAQge5SmwkVqEynx1BVSM4COyN9ZM-AoFjjo

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: Q3I3wF00Rp-FyjfMqHMNbyMIzuBx03PznQc31rpJ7wU