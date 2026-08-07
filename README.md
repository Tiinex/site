# Tiinex Site v322

Checkpoint: `v322`
Version: `0.2.142-v322`
Runtime: `react-v322-authority-mutability-boundaries`

This checkpoint continues from v321. It keeps the GitHub sidecar path convention intact and adds a small authority/mutability read-model so source-backed, imported-local, local-draft, workspace-candidate, and unavailable material are easier to distinguish without making tree paths provenance truth.

## Behavior

- Discovery `Leaves only` remains fixed from v313.
- `tiinex.topic.v1` still exposes one compact transition quick action: `Continue · Create task`.
- Static card actions keep their learned order. Schema-owned transition quick actions are appended as the right-edge dynamic group instead of being inserted between source/share/static controls.
- The Task quick action remains icon-only on desktop, with tooltip/aria text carrying Continue intent and Task result.
- The continuation dialog no longer trips the missing React `useState` import.
- The B0 design contract records form ownership: a transition may reference a form, but the result schema companion owns fields/defaults/validation/rendering, and unsupported form references must fail closed.
- Continuation drafts default to the parent directory with `.trace.md` paths and canonical dimension-prefix child names when the parent path carries one. Recovered GitHub comment/source wording is not copied into the child prefix.
- Browser-local transition draft records expose the same parent trace/origin/schema metadata as their generated Markdown, so loaded lineage can resolve them without an import roundtrip.
- Browser-local transition drafts expose a delete/remove action; source-backed material remains protected.
- Source-backed parent material remains read-only; Task drafts do not inherit GitHub/source provenance.
- No broad schema migration, Reference relation implementation, remote writes, source-backed direct edit, or universal form engine was added.

## Diagnostics

Known legacy issue-comment lineage limits from v311 remain non-blocking for the authoring slice. New Create/Edit/Export work should produce canonical envelopes so problematic PoC-era issue artifacts can be re-exported instead of forcing more reader fallbacks.

## Validation

Run:

```bash
npm run validate
npm run architecture:shape
npm run ui:shape
npm run metrics
npm run storage:scan
npm run typecheck
npm run portable:smoke
```

`npm run build:public` remains unqualified in this sandbox when Vite public output cannot be produced with useful diagnostics.

## Supported local start

```bash
npm install
npm run dev
```


## v322 authority and mutability boundaries

- Added `src/workspaces/workspace.authority.js` as a bounded read-model for record authority/mutability.
- Record cards and tree rows now expose an authority badge such as `source-backed`, `imported local`, `local draft`, or `source-backed · unavailable`.
- Imported archive/package material remains browser-local/session and can be removed from the current workspace without gaining guessed GitHub provenance.
- Source-backed records keep source affordances only from explicit source boundaries and do not expose local delete.
- Path-tree items carry presentation/source/provenance path fields separately; normalized tree display is still not source truth.
- Source-boundary diagnostics now respect package-import/local-session boundaries instead of treating every non-local adapter id as source-backed.
- No edit surface, export/import package rewrite, path migration, Map/Atlas/Verse runtime, or `project-live-lineage` operation was added.

## v317 transition draft sibling paths

- Repeated Topic → Continue → Task drafts no longer overwrite earlier sibling drafts.
- The transition draft path allocator uses deterministic suffixes when a local draft path already exists.
- Final create rechecks active workspace records so stale dialogs cannot replace an existing draft.
- The transition-authoring contract documents local draft storage path policy.


## v318 transition draft placement and delete

- Topic → Continue → Task draft paths now default beside the parent record path instead of a top-level `continuations/` folder.
- Dimensioned parent filenames allocate child prefixes, for example `12-01` → `12-01-01`, so the filename still reflects lineage placement.
- Issue-comment recovered parents keep drafts in the same logical issue folder, but the result remains browser-local/session material and does not inherit source provenance.
- Repeated drafts still allocate unique siblings and final create still rechecks against active workspace records.
- Browser-local transition drafts can be removed from the session with a danger-styled delete action.
- Source-backed records cannot be removed through this local-draft action.


## v321 GitHub sidecar path convention

- GitHub issue and discussion sidecar material now lives under `.topics/.github/<owner>/<repo>/.issues/<issue>/` instead of `.topics/.issues/github/<owner-repo>/<issue>/`.
- Repo files remain displayed at their exact repository paths. No `.repo` wrapper was introduced.
- `.github` is adapter-owned only inside the Tiinex namespace, so user-created `github/` folders and real repo `.github/` folders remain distinct.
- Internal source/cache keys may still use compact slugs, but workspace paths use owner/repo folders for navigation.
- Continuation drafts still default to the parent folder and continue to use canonical dimension prefixes such as `001-1`, `001-2`.

## v320 canonical dimension-prefix draft paths

- Transition children from recovered issue-comment parents now use canonical dimension prefixes instead of source/recovery-flavoured `comment-*` prefixes.
- A parent such as `comment-001-5008615398-recovered-lagar-och-regler.trace.md` now allocates `001-1-...trace.md`, then `001-2-...trace.md` in the same folder.
- This keeps storage near the parent while avoiding a second filename convention for local drafts.
- Source-backed parent records still remain read-only; local drafts placed beside issue material remain browser-local and do not inherit source provenance.
