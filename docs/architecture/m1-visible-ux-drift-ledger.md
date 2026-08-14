# M1 visible UX drift ledger

Checkpoint: v369

This ledger records visible differences from the `.old/` PoC that are **not** silently claimed as parity by the M1 recovery.

| Surface | PoC | Refactor v369 | Classification | Milestone owner |
| --- | --- | --- | --- | --- |
| Default workspace config | Embedded/local default workspace without newer schema-origin/transport extensions | Default config still contains internal `Schema Origins` / newer transport declarations, but they are not surfaced in current parity chrome | Intended internal extension; not PoC parity | later schema/config review |
| Global share label | `Share` | `Share` | Preserved | M1 |
| Global dock extra feature | no Multiverse control in parity chrome | Multiverse control removed from current global dock | Deferred feature, not parity UI | later verse/multiverse milestone |
| Help schema diagnostics | no schema-origin/module-count badges | schema-origin/module-count badges removed from current Help UI | Deferred schema-building UX | M10 |
| Clean startup | Config/default bootstrap, then local continuity where applicable | query/runtime/host/hosted/config/default ownership establishes canonical workspace first; startup resolving is withheld from product EmptyStage; matching local deltas augment canonical state; unmatched durable local work remains recoverable alongside it | Intended architecture refinement preserving PoC ownership | M1 |
| Explicit route/cache authority | route/hash state determines the requested product material set | route owns source/record/asset membership; session cache hydrates only matching identities | Preserved authority through split cache architecture | M1 |
| Home / clean-route return | returns to configured/default workspace home | reusable startup transition resolves the same ownership contract instead of committing a blank state | Preserved behavior through new architecture | M1 |
| Legacy workspace candidates | workspace artifact role/action on normal artifact spine | old candidate-bearing persistence is migrated at I/O; normal local/source/startup paths enforce zero runtime candidates | Necessary compatibility migration | M1 |
| Local persistence failure | user-visible failure when durable local work is at risk | failed newer durable write preserves last-known-good local delta/recovery index and emits a visible warning | Intended safety improvement over weak failure behavior | M1 |
| Workspace Artifact Open | Open replaces prior non-draft workspaces while preserving unpublished/local durable work; Merge retains/adds context | replacement/retention split is retained and now consumes the shared workspace-entrypoint lifecycle | v367 correction architect-verified; lifecycle consolidated in v368 | M1 |
| Hosted/config first useful workspace set | all `Workspace Entrypoints` with `Open On Apply` contribute to initial workspace set in declared order | startup consumes the shared workspace-entrypoint set lifecycle and materializes the configured set instead of reducing it to one source | v367 correction architect-verified; lifecycle consolidated in v368 | M1 |
| Add primary hierarchy | Manual files / Manual folder / GitHub source / Explicit URLs / Drag and drop | same primary set; Paste trace remains secondary Advanced import; app config is not an Add-to-workspace action | v368 product-domain correction | M1 |
| Page/global workspace file | workspace entrypoint affects workspace set through Open/Merge | page/global local workspace file routes through explicit Workspace entrypoint Open/Merge lifecycle | v368 correction architect-verified; v369 contract closure | M1 |
| Concrete-workspace workspace file | added/dropped material belongs to that workspace; it is not silently applied as global config | concrete workspace stops global drop propagation and materializes the workspace file as a canonical artifact/entrypoint role | v368 correction architect-verified; v369 contract closure | M1 |
| Workspace schema definition | schema/type material describes workspace schema; it is not itself an Openable workspace | schema-definition paths are classified before workspace capability; `tiinex.workspace.v1.schema.md` has no Open/Merge | v368 correction architect-verified; v369 contract closure | M1 |
| Workspace card architecture copy | product cards communicate artifact/value | internal “source/local states are roles” explanation removed from primary workspace cards | v368 UX cleanup tied to model correction | M1 |
| Workspace-stage scrolling | PoC internal feed/grid scrolling has a simpler perceived owner | refactor still has nested overflow ownership and may feel clipped | Known UX regression; explicitly deferred from v368 | later bounded UX correction |

## Guardrail

Entries here are not permission to accumulate drift. A difference remains explicit until its owning milestone either proves parity, records an approved intended improvement, or removes it.
