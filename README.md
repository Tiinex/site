# Tiinex Site v254

Checkpoint: `v254`
Version: `0.2.74-v254`
Runtime: `react-v254-desktop-dialog-source-action-polish`

## v254 focus

Milestone A cosmetic/polish candidate after the v253 lineage regression fixes. The video showed the lineage regressions mostly cleared, which made the remaining desktop UX friction visible: small add/details/markdown dialogs, Open source only appearing on some source-backed cards, text-labeled Open source actions, and GitHub source intake not loading both repo files and issues by default.

## Changed in v254

- Desktop add-source, details, and Markdown dialogs are wider and use more viewport height before scrolling.
- GitHub add-source form defaults to both repo files and issue snapshots for new sources. Continuation dialogs still preserve the source's existing surface selection.
- Open source uses an icon-only action on cards instead of a labeled pill.
- Open source URL derivation now uses preserved GitHub browse/raw/source metadata before trying repo/ref/path fallback, so recovered traversed parents can expose source links too.
- Markdown action has a separate icon from details; source uses an external-link style icon.
- Lineage resolver guards from v250-v253 remain unchanged.

## Supported local start

```bash
npm install
npm run dev
```

Open the local Vite URL printed by the dev server.

## Local validation

Run:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
```

Public build remains environment-sensitive in the sandbox; run `npm run build:public && npm run public:check` locally before public deploy.
