# Continuation Guide

Start by reading `README.md`, `docs/architecture/*.md`, and `src/schemas/README.md`.

Do not import from `.old/`. Treat `.old/` as legacy evidence only. Keep v82 focused on schema binding hardening until the shell, bindings, validators, surfaces, readers, i18n, and audit boundaries are accepted.


## v82 local-open correction

The active reset shell must open directly through local `index.html`. Do not make the first visible startup path depend on ES module loading, a dev server, generated `.site-publish`, or legacy `.old/app.js`. Future React/TypeScript ownership can be added behind a build/dev path, but Q's manual validation loop must keep a file-local entrypoint until explicitly changed.


## v85 Source Boundary Discipline

Workspace state now records whether material came from a static fixture, a user-selected local file, pasted draft text, or an explicit source-backed descriptor. Local, draft, and static material must not be promoted into GitHub source authority by guesswork.
