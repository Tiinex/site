# Audit Status Parity

V103 keeps Column as the only runtime verse and changes audit disclosure back toward the old Tiinex.dev pattern. Audit output should be compact and operational: a small lineage/audit status row, not a dashboard card.

## Rule

- Default state may show a compact terminal row such as `Lineage root reached.`
- Running audit may show a compact status banner with OK / mismatch / open / pending counts.
- The banner must not create page-level scroll.
- Detailed audit explanation belongs behind diagnostics/details, not the primary Column flow.
- Audit still only evaluates loaded records unless explicit source traversal exists.

## Boundary

This is presentation parity only. It does not claim full lineage traversal, byte checksum verification, or hidden source fetching.

## v104 correction

`Lineage root reached.` is no longer a general footer/status row. It appears only as a trailing card in Lineage/Tree mode. Discovery mode remains a scanning surface and must not show lineage-root completion as if discovery had traversed lineage.
