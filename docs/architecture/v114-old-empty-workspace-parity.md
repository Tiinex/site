# v114 Old Empty Workspace Parity

Side-by-side video showed that a newly created workspace in the old viewer does
not become an onboarding card. It opens a normal Column workspace shell with a
source/drop hint and an empty discovery result: `No nodes match this view.`

Rules kept in v114:

- Feed and Tree remain Discovery mode until a concrete artifact is selected.
- `Lineage root reached.` is not shown merely because Tree is active.
- A newly created workspace shows the drop/source affordance and empty result.
- Local Markdown controls disclose local/session provenance and do not infer
  GitHub source truth.
- Visible buttons must be backed by behavior or hidden until the use-case exists.
