# Validation Notes v322


## v322 source-draft-import authority/mutability discovery slice

Root-cause hypothesis: v321 had separate heuristics for source boundary, material role, card actions, path-tree presentation, lifecycle removal, and import/export package handling. That made source-backed and local transition drafts mostly safe, but imported archive/package material could look immutable or source-like after import, while tree paths risked being read as provenance truth.

Fix: add a small `workspace.authority` read-model instead of a broad path/export/import rewrite. The helper classifies record authority and mutability as source-backed, imported-local, local-draft, workspace-candidate, local/session, unavailable, or unknown. Card/tree presentation consumes the label; actions and lifecycle removal use the same local-removable policy for browser-local drafts/imports; source-boundary diagnostics respect explicit `sourceBacked: false` and local-session package imports.

Explicit non-goals: no `project-live-lineage`, no new edit surface, no Map/Atlas/Verse runtime, no schema-specific policy, no path/import/export migration, and no remote traversal.

Targeted validation added/run:

```bash
node src/workspaces/workspace.authority.test.mjs
node src/actions/record.actions.test.mjs
node src/workspaces/workspace.lifecycle.test.mjs
node src/workspaces/workspace.pathTree.test.mjs
node src/workspaces/workspace.summary.test.mjs
node src/diagnostics/sourceBoundary.report.test.mjs
node src/workspaces/workspace.auditView.test.mjs
node src/workspaces/workspace.lineageView.test.mjs
```

Open risk: this clarifies authority/mutability labels and local removal, but does not yet solve the larger export/import roundtrip/path presentation disagreement observed during v321 browser testing.


## v316 transition dialog form-first cleanup

Root cause: the first transition dialog surfaced metadata badges, explanatory boundary prose, conformance success, and generated Markdown affordances before the actual form inputs. Creating the draft also selected the new record, opening the generic read/share preview immediately after creation. That made the flow feel backwards compared with the expected pre-create form/summary interaction.

Fix: keep the Task continuation dialog form-first; move generated metadata and Markdown preview behind a collapsed `Generated details` disclosure; only show transition validation when it needs attention; and after create, insert the local draft into the workspace without opening the post-create record detail/share modal.

Guards / validation:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
npm run portable:smoke
```

Known limit: this is still a minimal Topic → Continue → Task slice. It does not introduce the full form registry, full Task edit, Reference semantics, or remote writes.

## Root-cause hypothesis

v314 proved the first Topic → Continue → Task quick action, but browser testing exposed two issues:

- `workspace.recordDialogs.views.jsx` used `useState` in the deferred record read view without importing it from React.
- The transition quick action was inserted before source/share actions. That made schema-owned/dynamic actions appear among static learned controls, so the Task action was hard to find and violated the intended action-budget behavior.

The same test pass also clarified an authoring-contract point: transitions may need different forms by context, but form behavior should remain schema-owned rather than becoming a generic monolithic card/dialog engine.

## Change

- Imported `useState` in `workspace.recordDialogs.views.jsx`.
- Added `src/schemas/workspace/workspace.cardActions.js` as a small readmodel helper for card action ordering.
- Transition quick actions now append after static record actions as the right-edge dynamic group.
- Transition actions get a distinct `tx-transition-action` class while remaining icon-only on desktop.
- Added `workspace.cardActions.test.mjs` to guard static-action order and right-edge transition placement.
- Updated `transition-authoring-contract-v1.md` with form ownership/selection rules:
  - transitions may reference a form contract,
  - result schema companions own fields/defaults/validation/rendering,
  - multiple forms can exist per schema when context requires it,
  - unsupported form references fail closed instead of falling back to a broad schema picker.

## Commands run

Targeted before full validation:

```bash
node src/schemas/workspace/workspace.cardActions.test.mjs
node src/transitions/transition.presentation.test.mjs
node src/transitions/transition.definitions.test.mjs
node src/transitions/record.transitions.test.mjs
node src/actions/record.actions.test.mjs
node src/schemas/capability.registry.test.mjs
```

Full validation for the candidate:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
npm run portable:smoke
```

Known non-blockers remain unchanged:

```bash
npm run build:public
# unqualified in this sandbox if Vite output fails without useful diagnostics
```

## Known limits

- `tiinex.task.v1` is still only the first minimal authoring target.
- Task draft editing is not complete in this checkpoint.
- Reference relation semantics remain deferred.
- Mobile FAB/action-sheet presentation is still design-contract only; current card action remains compact/icon-only.
- Transition-specific forms are now specified in the design contract, but only the locked Task continuation dialog is implemented.
- Legacy PoC issue-comment envelope variants remain known limitations rather than B1 blockers.


## v317 transition draft sibling path guard

Root cause: the first Topic → Continue → Task slice used one deterministic path per parent/target pair (`continuations/<parent>--task.md`). Creating a second Task from the same parent reused that path, and the workspace lifecycle correctly treated identical local paths as replacement/edit semantics.

Fix: transition draft creation now allocates deterministic sibling suffixes (`-2`, `-3`, …) when a path already exists, and the final create path is guarded against stale dialog state before insertion. This keeps generic local record replacement semantics intact while making transition creation no-overwrite by construction.

Validation: `node src/transitions/record.transitions.test.mjs` covers sibling allocation and final add guarding; full validation remains green except public build is still not qualified in the sandbox.


## v318 transition draft placement and local delete

Root cause: v317 fixed no-overwrite siblings but still treated continuation output as a generic `continuations/` bucket. That was too disconnected from Tiinex lineage path conventions and made created leaves look physically unrelated to their parent.

Fix: the transition draft allocator now defaults to the parent record directory, uses `.trace.md`, preserves lineage-style child prefixes when the parent filename has a dimension prefix, and still guarantees no overwrite through sibling allocation and final create recheck. Local placement remains separate from provenance: drafts near source-backed paths remain browser-local/session material.

Also added a bounded local-draft remove action for unpublished browser-local transition drafts. The workspace lifecycle refuses removal for source-backed material and keeps exact same-path upsert semantics for future edit flows.

Targeted validation: `node src/transitions/record.transitions.test.mjs`, `node src/actions/record.actions.test.mjs`, `node src/workspaces/workspace.lifecycle.test.mjs`, and `node src/schemas/workspace/workspace.cardActions.test.mjs`.


## v321 GitHub issue sidecar path convention

Root cause: v320 fixed filename dimensions but kept issue material under `.topics/.issues/github/<owner-repo>/<issue>/`, which mixed a transport/cache slug with browsable Tiinex pathing. That also made owner/repo navigation poorer when multiple repositories belong to the same owner.

Fix: canonical GitHub issue sidecars now use `.topics/.github/<owner>/<repo>/.issues/<issue>/`. The `.github` folder is Tiinex-adapter-owned only inside `.topics`, not workspace root, so real repo `.github` folders remain ordinary repo-file material when repo files are loaded.

Compatibility: legacy `.topics/.github/.issues/<owner-repo>-issue-<n>/...` and v320 `.topics/.issues/github/<owner-repo>/<n>/...` paths still normalize into the new sidecar tree. Internal source/cache ids remain separate from workspace paths.

Targeted validation: `node src/workspaces/workspace.pathTree.test.mjs`, `node src/adapters/github/github.issueSnapshot.test.mjs`, `node src/workspaces/workspace.lifecycle.test.mjs`, `node src/transitions/record.transitions.test.mjs`, `node src/actions/record.actions.test.mjs`, and `node src/lineage/lineage.resolve.test.mjs`.

## v320 canonical dimension-prefix transition paths

Root cause: v319 fixed issue-comment overwrite and parent metadata, but still kept a source/recovery-flavoured child prefix: `comment-001-1-...`. That mixed the canonical Tiinex dimension-prefix convention with GitHub issue-comment recovery wording. The docs repo examples show a branch/root artifact such as `001.trace.md` continuing to a concrete child such as `001-1.trace.md`; local transition drafts should follow that same dimension-prefix convention rather than inventing origin-specific variants.

Fix: recovered issue-comment parent filenames still yield the parent dimension `001`, but the generated child path is now `001-1-...`, then `001-2-...`, in the same folder. `comment-` and the GitHub comment id remain source/recovery identity only; they are not copied into local draft child dimensions.

Targeted validation: `node src/transitions/record.transitions.test.mjs` covers canonical `001-1` / `001-2` allocation from a recovered issue-comment parent and loaded lineage resolution remains covered from v319.
