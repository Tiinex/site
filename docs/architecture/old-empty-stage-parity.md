# Old Empty Stage Parity

Status: v108 implementation note.

The empty start is a product state, not an onboarding dashboard.

When no workspace is loaded, the viewer shows only:

- the global dock,
- the `.workspace.md` configured empty-stage subtitle,
- the footer.

It must not render a workspace shell, source strip, mode row, cards, or large explanatory panel before a workspace exists. `Create` remains the primary affordance in the dock. The multiverse switch sits immediately left of the Tiinex logo so the root/universe control has a stable location before workspaces exist.

The subtitle is read from the workspace config parser so future `.workspace.md` material can change the empty-stage text without editing UI code.
