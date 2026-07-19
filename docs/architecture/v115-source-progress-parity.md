# v115 Source Progress Parity

v115 keeps UC-001 focused on Column while restoring the old viewer's source/progress disclosure shape.

Observed from side-by-side/reference material:

- a plain local empty workspace may have no source row;
- when multiple sources exist, source pills remain visible with counts and close controls;
- repository/source preparation is disclosed as a compact progress panel in the workspace body;
- Tree remains part of Discovery mode, not Lineage mode;
- workspace chrome starts high enough to reserve the viewport for content.

Implemented boundary:

- created local workspaces still do not infer GitHub provenance;
- configured repository sources are attached only through an explicit source action;
- the progress panel is state-owned and route-restored, not an implicit hidden fetch;
- source/progress rendering lives in `src/sources/source.presenter.js` so future source adapters can reuse the same presentation contract.
