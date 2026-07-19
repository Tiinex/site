# Continuation Guide

## Current checkpoint

v86 is a fresh runtime ownership checkpoint. The v79 app is archived under `.old/` as ignored local reference material. The active app starts from `index.html` through `src/main.js` and must remain file-local safe.

## Discipline

- Do not develop new architecture inside `.old/` or `app.js`.
- Preserve local `index.html` testing unless Q explicitly approves a different loop.
- Do not infer GitHub source authority from local, pasted, draft, or static fixture material.
- Keep audit as a domain operation in `src/audit/`, not as per-schema presentation code.
- Keep Verse human-first: a bounded arrangement/experience of artifacts, not a framework component or hidden truth engine.

## Next planned iteration

v87 should implement the audit load-all skeleton: planning traversal, marking missing lineage, rechecking validation when more authority is loaded, and showing audit summary counts without claiming complete validation where authority is unavailable.

## Legacy behavior reference discipline

During the refactor, `.old/` is not runtime and must not be imported. It is still behavior evidence. For every rebuilt feature slice, inspect the corresponding legacy flow first, identify which behavior existed for a reason, and carry that lesson into the new owner structure without copying the monolith.
