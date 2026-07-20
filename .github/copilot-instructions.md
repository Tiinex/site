# Copilot Instructions — Tiinex Site

- Source of truth: use the active `refactor` branch and current repository state. Do not rely on memory when code, diagnostics, or browser evidence contradict it.
- Git safety: do not open PRs, do not target `main`/`master`, and do not push or merge into `main`/`master`.
- Repo hygiene: do not commit temporary files, screenshots, Playwright traces, workspaceStorage, scratch notes, or changelogs unless explicitly requested.
- Evidence first: before changing behavior, identify the likely owner/root cause. For UI changes, capture browser evidence including console, network, and persisted state when relevant.
- Browser checks: UI behavior changes require a short browser/Playwright check. Focus/activate the page before interactions. Do not replace browser evidence with static validation.
- Source boundaries: local/session material must remain local. Never guess GitHub/source-backed provenance for local material.
- Provenance boundaries: source-backed material must preserve explicit source identity, path/ref, and reviewable state transitions.
- Loading/progress: do not add fake loading or progress indicators. Only show progress backed by real lifecycle/adapter state.
- Architecture: keep transport/adapters, artifact parsing, workspace lifecycle, and React presentation separate.
- LLM/provider integration: keep future agent/LLM integrations provider-agnostic. Model output should become a reviewable proposal/transition, not automatic source truth.

Validation:
- `git status --porcelain`
- direct node validation chain is enough:
  `node tools/validate-static.mjs; node tools/validate-schema-bindings.mjs; node tools/validate-workspace-schema.mjs; node src/workspaces/workspace.lifecycle.test.mjs; node src/sources/github/github.loader.test.mjs`

If green:
- commit on `refactor`
- push `origin refactor`

Commit message:
`chore: add Copilot repo guardrails`

Report:
- commit hash
- changed files
- validation result
