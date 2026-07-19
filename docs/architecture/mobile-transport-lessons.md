# Legacy Mobile and Transport Lessons

The archived app carried useful behavior that should survive the refactor without copying old ownership.

## Keep

- Card actions remain usable on mobile.
- Action sheets can reveal secondary actions without widening the card.
- Continue/create flows work best as a small number of visible steps.
- Transport must feel reliable from the first interaction.

## Improve

- Reduce static helper text inside mobile surfaces.
- Avoid controls that duplicate platform behavior; file input can cover camera capture when the platform supports it.
- Do not hide remote-control or Chromecast-like behavior inside generic share.
- Keep validation/degraded status visible when parent traversal or checksum verification is incomplete.

## Boundary

Mobile and transport are ergonomics and adapter concerns. They must not promote local/draft material into source-backed material, and they must not claim checksum or lineage completeness before audit/verification has authority.
