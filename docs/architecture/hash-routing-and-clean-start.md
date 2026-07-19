# Hash routing and clean start

UC-001 uses the URL hash as visible route truth. Browser localStorage is a recovery/cache mirror only; a clean URL must open the clean empty stage even if stale cache exists.

Route rules:

- `#state=` carries the current local view state.
- Refresh with `#state=` restores the workspace.
- Clean URL opens the empty start.
- Create, close, and Feed/Tree changes are push-history events so browser back/forward can move across user-visible view states.
- Search-like transient changes may replace the current route rather than push a new history entry.
- The centered Tiinex logo returns to the clean viewer route and clears local session workspace state.

This mirrors the old viewer principle: URL owns view continuity, while browser storage helps recovery and performance without silently changing the meaning of a clean link.
