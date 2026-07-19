# 0001 Reset Runtime Ownership

Decision: archive v79 under `.old/` and start new runtime ownership under `src/`.

Reason: the legacy app is functional and valuable as UX evidence, but `app.js` should no longer signal or own the forward architecture. The new app must grow with schema modules, surfaces, i18n, readers, audit, source boundaries, and workspace layout as first-class owners.


## v81 local-open correction

The active reset shell must open directly through local `index.html`. Do not make the first visible startup path depend on ES module loading, a dev server, generated `.site-publish`, or legacy `.old/app.js`. Future React/TypeScript ownership can be added behind a build/dev path, but Q's manual validation loop must keep a file-local entrypoint until explicitly changed.
