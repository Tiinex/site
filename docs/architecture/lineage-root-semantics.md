# Lineage Root Semantics

Lineage root disclosure belongs to Lineage/Tree mode, not Discovery mode.

## Rule

- Discovery mode shows artifact cards for scanning.
- Lineage mode shows declared parent/child continuity.
- `Lineage root reached.` is a trailing card in the Lineage/Tree stack.
- It is not a footer, persistent page banner, or Discovery-mode status.
- Audit output may use a compact banner, but it must not replace the Lineage root trailing-card semantics.

## Boundary

The current Column runtime still audits only loaded records. Full lineage traversal remains a later audit operation. The UI must not imply that hidden or unloaded parents have been traversed.
