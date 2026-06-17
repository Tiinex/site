# Validation Notes v6.23

Validated in sandbox:

- `node --check app.js` passes.
- Zip packaging completed.
- Static file structure remains GitHub Pages-compatible.

Not fully validated in sandbox:

- Real browser behavior for all `.trace.md` link styles.
- External repo/ref workspace creation against all GitHub URL variants.
- GitHub Pages deployment.

Design boundary:

- `.trace.md` references are lineage navigation, not generic markdown attachments.
- Same repo/ref references can open in the same workspace automatically.
- Different repo/ref references require user confirmation before creating a new workspace.
- `Open source` remains available as fallback.


## v6.24 check

- Updated only CSS indentation for discovery tree file rows.
- Desktop and mobile tree-file-row padding both moved one icon slot to the right.


## v6.25 check

Validated in sandbox:

- `node --check app.js` passes.
- CSS-only layout patch packaged successfully.

Not browser-validated in sandbox:

- Exact class coverage for every historical workspace layout alias.
- Ultra-wide visual spacing.


## v6.26 check

Validated in sandbox:

- `node --check app.js` passes.
- Packaged as a static zip.

Not browser-validated in sandbox:

- Exact large-screen visual result on 1920px/ultrawide.
- Interaction with every compact/collapsed workspace combination.


## v6.27 check

Validated in sandbox:

- `node --check app.js` passes.
- Logo asset copied into `assets/tiinex-logo-white-transparent.png`.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Exact visual crispness of logo on all DPR/scales.


## v6.28 check

Validated in sandbox:

- `node --check app.js` passes.
- CSS-only brand theme patch packaged successfully.

Not browser-validated in sandbox:

- Exact visual balance against the provided brand board on all monitors.
- Contrast perception under different display settings.


## v6.29 check

Validated in sandbox:

- `node --check app.js` passes.
- CSS-only topbar correction packaged successfully.

Not browser-validated in sandbox:

- Exact visual width on every browser zoom level.


## v6.30 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Exact tree icon alignment on every display scale.


## v6.31 check

Validated in sandbox:

- `node --check app.js` passes.
- CSS-only workspace header correction packaged successfully.

Not browser-validated in sandbox:

- Exact visual result on all workspace counts and zoom levels.


## v6.32 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Exact toast behavior across every browser history path.
- Whether any older success toast variant remains in rarely used paths.


## v6.33 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Real perceived speed on Tiinex/docs repeated discovery.
- GitHub rate-limit behavior under repeated large repo discovery.
- Policy detection against repos containing each policy filename variant.


## v6.34 check

Validated in sandbox:

- `node --check app.js` passes.
- Policy code now explicitly restricts lookup to the eight root policy/license filenames.

Not browser-validated in sandbox:

- Exact badge wording in every legacy render layer.
- Origin policy lookup against a repo containing each of the eight variants.


## v6.35 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Badge renderer now handles `origin-fallback`.

Not browser-validated in sandbox:

- Live fetch of `Tiinex/docs/LICENSE` and `Tiinex/docs/NOTICE`.
- Exact wrapping behavior when both LICENSE and NOTICE badges are visible.


## v6.36 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Actual drag/drop behavior in Chrome/Edge/Safari.
- Clipboard file paste behavior across browsers.
- Mobile dialog ergonomics beyond static responsive CSS.


## v6.37 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Live search/filter behavior after typing and dropdown changes.


## v6.38 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Live delegated search/filter behavior.
- Narrow mobile Add Lineage scroll behavior on physical devices.


## v6.39 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- File picker ergonomics on iOS/Android.
- Future offline cache workflow.


## v6.40 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Native details/summary behavior across all target mobile browsers.
- Whether default-collapsed URL/repo sections are too hidden for desktop users.


## v6.41 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Directory drag/drop in Chromium/Edge using `webkitGetAsEntry`.
- Directory drag/drop fallback in Firefox/Safari.
- Relative path preservation across all browser File implementations.


## v6.42 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Folder drag/drop on the user's exact browser.
- `getAsFileSystemHandle()` availability.
- `webkitdirectory` folder picker behavior on all browsers.


## v6.43 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Binary asset preservation through upload/folder/zip.
- Local asset thumbnail/lightbox object URL behavior.
- Full workspace export zip contents.
- Path matching for every possible relative attachment reference.


## v6.44 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Merge conflict modal UX.
- Deep recursive companion asset renumbering in all path shapes.
- Real conflict cases with slugs.
- Save export after sibling import.


## v6.45 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Reason for hotfix:

- v6.44 introduced a late `onAction` wrapper that could capture itself because of function hoisting, causing recursive calls and stack overflow.


## v6.46 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Visual spacing of the empty start screen.
- Header/footer pixel placement after empty-state removal.


## v6.47 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `renderNoWorkspace()` replacement applied.

Not browser-validated in sandbox:

- Header title sharpness across browser scaling modes.
- Exact empty workspace visual spacing.


## v6.48 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Exact visual spacing across viewport widths.


## v6.49 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Pixel-perfect topbar circle overlap/symmetry.
- Brand text vertical alignment under browser scaling.


## v6.50 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Pixel-perfect brand text baseline.
- Exact visual spacing between brand lockup and first action button.


## v6.51 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Direct workspace drop with folders/zips.
- Multi-source duplicate visual path behavior.
- Source badge placement in every responsive layout.
- Export path semantics for multiple sources with duplicate paths.

Known scope boundary:

- This is not the final export/consolidation model.
- Git-vs-git source collisions are preserved as separate source-scoped nodes rather than auto-renumbered.
- Export conflict resolution is intentionally deferred.


## v6.52 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Removed `const bindEventsBeforeV651 = bindEvents`.

Reason for hotfix:

- Function declarations are hoisted, so v6.51 captured the new `bindEvents` function rather than the previous one, causing recursive startup binding and `Maximum call stack size exceeded`.


## v6.53 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.

Not browser-validated in sandbox:

- Pixel-perfect brand symbol/text alignment in Chromium.


## v6.54 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Patched all detected `removeWorkspace(wsId)` definitions.

Not browser-validated in sandbox:

- Native confirm copy/UX in Chromium.
- Removal behavior after cancel/confirm with local assets.


## v6.55 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Patched all detected `removeWorkspace(wsId)` definitions.

Not browser-validated in sandbox:

- Native confirm copy.
- Object URL cleanup after closing a workspace with local assets.
- Pending import cleanup while conflict modal is open.


## v6.56 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Header render text `Tiinex Lineage` removed from app.js.
- Topbar button label changed to `Create`.

Not browser-validated in sandbox:

- Exact topbar hitbox behavior.
- Whether all old broad brand CSS is fully neutralized in Chromium.


## v6.57 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Added `viewer.config.md`.
- Added HTML origin notice in `index.html`.

Not browser-validated in sandbox:

- Fetching viewer config from GitHub Pages.
- Fetching viewer config through `?viewerConfig=...`.
- Custom icon rendering and CORS behavior.
- file:// local sibling config fetch is intentionally skipped for default `viewer.config.md`.


## v6.58 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `viewer.config.md` includes `## Custom CSS` sample section.
- App includes custom CSS injection and footer guard.

Not browser-validated in sandbox:

- Remote external CSS fetch/CORS.
- CSS precedence against every existing theme rule.
- Footer guard behavior under hostile CSS. It is intended as an honest-origin guard, not a security boundary.


## v6.59 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Added final override for `renderSourceModal` and `createWorkspaceFromInputs` after older modal definitions.

Not browser-validated in sandbox:

- Create modal layout.
- Add-source modal toggle sections.
- Folder picker behavior.
- Drag/drop into an empty workspace after create.


## v6.60 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Final override layer added for `openSourceModal`, `renderSourceModal`, `onActionV645`, `createWorkspaceFromInputs`, and `bindEvents`.

Not browser-validated in sandbox:

- Native picker auto-import after file/folder selection.
- Drag/drop mode staging/import.
- Git source step import.
- Mobile hiding of drag/drop option.


## v6.61 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Added final override for compact policy/notice rendering.
- Added final override for `computeWorkspaceIndex` with self-parent guard.

Not browser-validated in sandbox:

- Native title display for long license/notice text.
- Exact workspace header width reduction.
- Single-file manual upload now showing parent unavailable instead of cycle.


## v6.62 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Added robust final override for workspace drag/drop.
- Added modal-scoped drop handling for Add → Drag and drop.
- Added basic remove action for local/uploaded/generated nodes.

Not browser-validated in sandbox:

- Workspace drag/drop no longer throwing `classList.remove` / `remove` error.
- Modal drag/drop area behavior.
- Local node remove behavior with descendant nodes.
- Manual file/folder import after native picker.


## v6.63 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Added `No workspace subtitle` to `viewer.config.md`.
- Added final `renderNoWorkspace` override.
- Hid visible active workspace chip/state via CSS.

Not browser-validated in sandbox:

- Exact empty-stage watermark appearance.
- Whether every earlier active border/glow is fully neutralized.
- Config loading of `No workspace subtitle` on GitHub Pages.


## v6.64 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Added final overrides for `setRouteState`, `updateUrlState`, `copyShareLink`, `bootFromUrl`, and `renderNoWorkspace`.

Not browser-validated in sandbox:

- Address bar clears stale `#state` after closing the last workspace.
- Copy link produces a clean empty viewer URL.
- Empty-stage watermark balance after CSS override.
- Drop on empty stage after removing the `.workspace` class from the empty-state element.


## v6.65 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Added final override for `parseViewerConfigMarkdown`.
- Added `## No workspace subtitles` examples to `viewer.config.md`.

Not browser-validated in sandbox:

- Rotation behavior across repeated empty-stage presentations.
- Remote `viewer.config.md` list parsing on GitHub Pages.
- Stability of subtitle during unrelated render events.


## v6.66 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Added `.topics/.schemas/tiinex.viewer.config.v1.schema.md`.
- Added schema comment to `viewer.config.md`.

Not browser-validated in sandbox:

- No runtime changes expected.


## v6.67 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `viewer.config.md` now follows a lightweight Tiinex-style config document shape.
- `viewer.config.md` includes a checksum footer.
- `tiinex.viewer.config.v1.schema.md` documents the recommended document shape and optional integrity footer.

Not browser-validated in sandbox:

- Remote loading of the reformatted `viewer.config.md`.
- Runtime parsing of fields inside `## Current`, although parser behavior should already tolerate headings and scan key-value lines across the document.


## v6.68 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Final `renderNodePost` override includes `materialSchemaBadges(ws, node)`.
- Expanded card preview calls `renderContinuityPreview(node, ws)`.
- `tiinex.viewer.config.v1.schema.md` says Parent is optional, not forbidden.
- `viewer.config.md` checksum refreshed.

Grounded issue:

- The reported evidence trace uses `## Provenance` with `Origin -> [relative](001-2-cloud-chatgpt-dalle.png)`.
- The previous final card renderer did not surface material badges/sections even though material parsing support existed.

Not browser-validated in sandbox:

- Whether the linked remote PNG exists and loads from GitHub.
- Attachment thumbnail rendering in the browser.
- Exact card layout with material section enabled.


## v6.69 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Root `viewer.config.md` removed from package.
- Added `.topics/.configs/viewer.config.md`.
- Updated default config discovery path in app code.
- Added fallback to root `viewer.config.md` for older deployments.

Not browser-validated in sandbox:

- Runtime fetch of `.topics/.configs/viewer.config.md` on GitHub Pages.
- Fallback to root `viewer.config.md`.
- Relative CSS/Icon URL resolution from `.topics/.configs/`.


## v6.70 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Added `Export` topbar action.
- Added `.config.md` export generation with `## Viewer State` JSON.
- Added drag/drop/source intake handling for `*.config.md`.
- Updated viewer config schema with `Display Name`, `Viewer State`, `Workspaces`, and config-as-lens rules.
- Updated bundled `.topics/.configs/viewer.config.md` with `Display Name` and refreshed checksum.

Not browser-validated in sandbox:

- Actual download click in browser.
- Reopening exported `.config.md` by drag/drop.
- Workspace source dedupe behavior in complex mixed local/remote states.
- Relative CSS/Icon loading from dropped local config files.
- Whether the topbar remains visually balanced with three buttons.


## v6.71 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Added final override for `openViewerConfigMarkdown`.
- Added final override for `renderViewerBrand`.

Grounded issue:

- The uploaded `viewer.config.md` has identity/subtitle configuration but no `## Viewer State`, so applying it should not create/open workspaces.
- Previous toast said `Opened config` without explaining that no workspace snapshot was present.

Not browser-validated in sandbox:

- Exact toast wording in browser.
- Brand icon title tooltip behavior.


## v6.72 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Added named local state registry and restore modal.
- Added text-based local state serialization/restore.
- Added closable source pills with confirm prompt.
- Updated schema with Local Workspace State guidance.

Not browser-validated in sandbox:

- localStorage restore dialog across real browser tabs.
- Autosave after every relevant mutation.
- Source close behavior in mixed GitHub/local/draft source workspaces.
- Binary asset persistence; intentionally deferred to IndexedDB/bundle.


## v6.73 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Added final guardrails for restore candidates and empty snapshots.
- Added first-workspace name requirement in the create action.
- Updated create workspace modal wording.

Grounded user report:

- A restore dialog offered `New workspace` even though opening it produced no visible workspace.
- This indicates a stale/empty local-state registry entry was being treated as restorable.

Not browser-validated in sandbox:

- Pruning existing stale localStorage entries in Chrome.
- First-workspace name validation in the modal.


## v6.74 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Bundled config rewritten to Tiinex envelope shape.
- Bundled config now includes `Viewer State` with a `Tiinex/docs` GitHub tree source.
- Viewer config schema rewritten with `Parent` pointing at `tiinex.root.v1`.
- Export generator now emits a Continuity Context envelope and Continuity Integrity footer.

Grounding checked against Tiinex/docs:

- Root schema says Tiinex artifacts require schema identity, creation time, continuity position, and integrity footer.
- Root schema says parent absence means local lineage root, while parent presence declares a parent edge.
- Existing descendant schema examples use `Envelope Schema`, `Parent`, `Current`, body separator, and `Continuity Integrity`.

Not browser-validated in sandbox:

- Dropping the bundled config and loading the default `Tiinex/docs` workspace through the GitHub tree API.
- Whether the exported config integrity value matches the repo's future canonical validator.
- Runtime discovery from `## Config Discovery`; this remains schema/format-level in this leaf.


## v6.75 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Confirmed rendered search/filter attributes now match event handlers:
  - search: `data-search`
  - filter: `data-discovery-filter-select`

Grounded user report:

- After loading `Tiinex/docs`, selecting a filter did not change the feed.
- Typing a discovery search query did not filter the feed.

Root cause:

- The rendered controls used newer attribute names than the active event bindings watched.

Not browser-validated in sandbox:

- Real browser filter/search behavior after loading `Tiinex/docs`.
- Interactions between direct and delegated handlers under rapid typing.


## v6.76 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Bundled config uses:
  - first body H1 as display name
  - `Empty Stage`
  - `Config Discovery`
  - `Workspace Entrypoints`
  - no raw `Viewer State`
  - no empty optional fields
- Parser includes a markdown-first `Workspace Entrypoints` reader and legacy `Viewer State` fallback.
- Export generator emits markdown-first config shape and omits empty optional fields.
- Schema documents defaults and omissibility.

Not browser-validated in sandbox:

- Opening bundled config from drag/drop through `Workspace Entrypoints`.
- Export/reimport roundtrip from the new markdown-first format.
- Empty-stage continuity line appearance at real viewport sizes.


## v6.77 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Bundled config includes `## Help`.
- Parser stores config help as `viewerIdentity.helpMarkdown`.
- Topbar renders `?` only when help exists.
- Help modal uses existing safe markdown rendering.
- Export preserves `## Help`.

Not browser-validated in sandbox:

- Topbar visual balance with the new right-side help button.
- Help lightbox sizing and scroll behavior.
- Export/reimport roundtrip preserving Help.


## v6.78 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Parser no longer reads nested discovery/workspace labels as viewer identity.
- Brand icon slot has explicit sizing/overflow rules.
- Help modal backdrop is fixed, centered, and high z-index.

Grounded user report:

- Topbar showed `Tiinex docs configs` because nested config discovery label leaked into viewer chrome.
- Help click produced content near the lower-left instead of a centered lightbox.

Not browser-validated in sandbox:

- Actual topbar brand rendering after dropping the bundled config.
- Help lightbox visual layout in Chrome.


## v6.79 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Final `renderViewerBrand` override emits `brand-default-mark` when no config icon exists.
- CSS defines a visible fixed-size Tiinex fallback mark.

Grounded user report:

- Brand link remained clickable, but the logo/mark was visually invisible after v6.78.

Not browser-validated in sandbox:

- Actual topbar visual alignment in Chrome.
- Exact appearance of the fallback `T` mark.


## v6.80 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Bundled workspace exists at `.topics/.workspaces/viewer.workspace.md`.
- Old bundled `.topics/.configs/viewer.config.md` was removed.
- Schema exists as `.topics/.schemas/tiinex.workspace.v1.schema.md`.
- Old `.topics/.schemas/tiinex.viewer.config.v1.schema.md` was removed.
- Export path returns `.workspace.md`.
- Final drop/open logic recognizes `.workspace.md`.

Not browser-validated in sandbox:

- Dropping `viewer.workspace.md` into Chrome.
- Export/reimport of `.workspace.md`.
- Query parameter behavior with `workspace=` / `viewerWorkspace=`.


## v6.81 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Help renderer splits `###` sections into `<details>`.
- Help sections are closed by default.
- Help image markdown is supported.
- Relative help links/images use the workspace artifact URL as base when available.

Grounded user report:

- Help modal was readable but not tasteful enough; it forced reading instead of scanning.
- User requested collapsible subheadings and image support.
- User noted asset paths should resolve from the workspace/config CWD.

Not browser-validated in sandbox:

- Visual styling of collapsed Help sections.
- Relative image behavior for local dropped folders/zips.


## v6.82 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Help modal CSS now uses a more opaque panel.
- Close button is forced to the top-right inside the Help dialog.
- Header/body padding was increased to avoid clipped kicker text.

Grounded user report:

- Help modal was mostly good, but too transparent.
- Close button was not in the desired top-right location.
- `WORKSPACE HELP` appeared clipped at the beginning.

Not browser-validated in sandbox:

- Exact Chrome visual balance after the opacity and padding changes.


## v6.83 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Bundled workspace declares an icon relative to the workspace artifact CWD.
- Workspace parser resolves `Icon` and `CSS` relative to the workspace artifact URL.
- Host default workspace can be provided by `window.TiinexWorkspace`.
- Explicit URL query/hash state wins over host defaults.

Grounded user report:

- Brand logo was not loading after the `.workspace.md` pivot, likely because workspace-relative assets were not resolved from the workspace CWD.
- User asked whether a host can configure the default `.workspace.md` loaded when the URL has no hash/state.

Not browser-validated in sandbox:

- Actual bundled logo render in Chrome.
- Host default global boot behavior in a hosted page.


## v6.84 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Bootstrap/CDN integrity attributes removed from `index.html`.
- Brand image has packaged-asset fallback.
- `fetchText` now rejects local `file://` fetches in file mode with a clear message.

Grounded user report:

- Console showed stale Bootstrap SRI failure.
- Console showed attempted `file://` fetch blocked by CORS.
- Brand logo attempted to load from `C:/Users/micro/assets/...`, proving asset base resolution was wrong for local-file use.

Not browser-validated in sandbox:

- Actual logo render in Chrome after app-relative fallback.
- Exact reduced console noise in local `file://` mode.


## v6.85 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- App contains embedded bundled workspace markdown.
- App contains embedded Tiinex logo data URI fallback.
- `file://` no-query/no-`#state=` path avoids fetching `.workspace.md` from disk.

Grounded user report:

- Browser blocked `file://` fetches and warned about unique security origins.
- Brand logo still failed from disk.
- User wants static disk usage supported without requiring web hosting.

Not browser-validated in sandbox:

- Local `file://` launch with no hash/query.
- Logo render through embedded fallback in Chrome.
- Interaction with existing `#state=` links that contain stale file URLs.


## v6.86 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Embedded default workspace now loads in file mode even when a non-empty hash exists.
- Asset resolution in file mode prefers packaged `assets/...`.
- Route state with `file://` sources is treated as stale/non-portable and cleared.

Grounded user report:

- User correctly questioned why `#state=` should block workspace loading.
- Console still showed repeated logo attempts from `C:/Users/micro/assets/...`.
- User clarified the correct package-relative asset folder should be under the extracted app directory, not the user home directory.

Not browser-validated in sandbox:

- Chrome behavior when opening an old `#state=` URL from disk.
- Whether the logo now resolves to `assets/tiinex-logo-white-transparent.png` without first logging a bad `file://` attempt.


## v6.87 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Brand slot rendering no longer depends on an absolutely positioned `<img>`.
- Topbar explicitly reserves left/right side slots.
- Brand icon URL is passed as a CSS variable to the slot background.

Grounded user report:

- Network showed `tiinex-logo-white-transparent.png` loaded with status 200.
- The logo still did not appear visually in the topbar, suggesting DOM/CSS rendering rather than asset loading.

Not browser-validated in sandbox:

- Actual topbar logo visibility in Chrome.


## v6.88 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `file://` mode now clears route hash on boot and does not restore route sources.
- `file://` mode does not write URL state.
- Brand renders as inline image plus fallback letter rather than CSS background only.

Grounded user report:

- Refresh with `#state=` kept producing unsafe `file://` load warnings and remote policy 404 probes.
- User observed that logo requests were no longer happening after refresh, but the logo still was not visible.
- This suggests static-disk route restoration and brand rendering should be made deterministic rather than trying to preserve stale hash state.

Not browser-validated in sandbox:

- Actual Chrome console after opening `index.html#state=...` from disk.
- Actual logo visibility in topbar after inline rendering.


## v6.89 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Brand slot uses deterministic CSS background variables.
- Workspace-provided icon is normalized before rendering.
- Missing icon falls back to `assets/tiinex-logo-white-transparent.png`, then embedded data URI.
- Embedded default workspace applies entrypoints in file mode again.

Grounded user report:

- Drag/drop of workspace loaded the workspace but did not show the logo.
- User wants workspace `Icon` to override default, and missing `Icon` to default to the packaged Tiinex asset.
- User wants default workspace loading to speed up regression checks.

Not browser-validated in sandbox:

- Actual visual logo appearance in Chrome.
- Whether the embedded default workspace plus `file://` mode still avoids stale hash problems in all cases.


## v6.90 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Brand slot now contains an explicit inline image element.
- Brand image has strict width/height/visibility CSS.
- Workspace icon/default asset/embedded fallback order is preserved.

Grounded user report:

- Workspace loaded and default workspace auto-load worked, but the logo still did not appear.
- Prior CSS-background approach did not visibly render the logo.
- User wants workspace icon override, hardcoded packaged default, and fallback behavior.

Not browser-validated in sandbox:

- Actual topbar logo visibility in Chrome.


## v6.91 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Brand no longer depends on CSS background rendering.
- Topbar no longer uses the brittle 34px/max-content/34px grid override.
- Brand image uses isolated `.v691-brand-img` flow CSS.

Grounded user report:

- Logo asset loads with HTTP 200 but remains visually absent.
- Header symmetry appears malformed.
- This points to layout/rendering rather than path/network.

Not browser-validated in sandbox:

- Actual logo visibility and topbar symmetry in Chrome.


## v6.92 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Old brand selector no longer hides `.v691-brand-slot`.
- Final CSS override forces modern brand slots visible.

Grounded user evidence:

- Browser Elements showed `.brand-inline > span:not(.brand-mark) { display: none !important; }`.
- Disabling that rule made the logo appear.
- Network loading was already correct.


## v6.93 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Search input handler now updates state immediately and schedules debounced render.
- Search focus and caret are restored after render.
- Existing full render path remains intact.

Grounded user report:

- Discovery search blurred after each character, likely because the app replaced the full DOM on each debounced search render.
- The fix preserves UX without a large render-tree rewrite.

Not browser-validated in sandbox:

- Actual typing behavior in Chrome.
- Whether 180ms debounce is the best subjective delay.


## v6.94 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Type badges render as clickable schema navigation controls.
- `*.schema.md` files are indexed as lineage artifacts.
- GitHub discovery path list now includes both `*.trace.md` and `*.schema.md`.
- Schema material references get same-viewer navigation actions.
- Existing route-state path is used after schema navigation where route-state is enabled.

Not browser-validated in sandbox:

- Click a `task`/`topic`/`evidence` badge and verify it opens the matching schema lineage.
- Click a schema attachment and verify same-viewer navigation.
- Browser Back/Forward in hosted/http mode after schema navigation.


## v6.95 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `file://` mode now writes `#view=` hash state.
- `file://` Back/Forward restores selected paths and basic view state without trying to restore file sources.
- Hosted/http route-state behavior is preserved through the existing full route path.

Grounded user report:

- URL hash did not change while browsing/navigating.
- This was caused by the v6.88 static-disk hardening disabling all route state, not just unsafe local source restore.

Not browser-validated in sandbox:

- Actual Back/Forward behavior from Chrome in `file://` mode.
- Schema badge navigation followed by browser Back/Forward.


## v6.96 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Help readability CSS added.
- Purple accent retained.
- Help text no longer uses text-shadow/filter overrides.
- Help card no longer applies backdrop blur to the text surface.

Grounded user report:

- External validator perceived Help text as blurry.
- User requested improvement without changing the purple color.

Not browser-validated in sandbox:

- Subjective readability in Chrome on the validator's display.


## v6.97 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Badge CSS normalization added.
- Help readability and logo behavior from previous versions preserved.

Grounded user/validator feedback:

- Help text is now readable.
- Logo and question mark are acceptable, perhaps a little small.
- Card badges are harder to read.
- Badge text sizes are inconsistent.
- The `feedback` badge was readable to the external validator but slightly too large to the user, so this version moves toward a middle size.

Not browser-validated in sandbox:

- Actual badge readability and visual balance in Chrome.


## v6.98 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Badge colors restored while keeping equalized typography.
- Badge text size reduced from v6.97 toward the earlier visual scale.

Grounded user/validator feedback:

- Removing badge color made the UI worse.
- Previous text size was acceptable if badge text sizes were consistent.
- Browser zoom works well and remains aesthetically pleasing.


## v6.99 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `leaf candidate` is omitted from feed card badges.
- Selected-node signal remains.

Grounded user feedback:

- `leaf candidate` felt boilerplate and used more space than its signal value justified.


## v6.100 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Discovery filter options now derive from loaded node schemas.
- Current filter is normalized to `All` when the chosen type is no longer available.

Grounded user feedback:

- Filter should be dynamic and contain only types that are currently loaded in the workspace.


## v6.101 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Integrity verification now resolves the `Towards` field rather than assuming parent for every non-self value.
- The root schema contract was checked: `Towards` identifies the validated target, and non-self values must be computed from that target.
- Root schema also states hash-based methods hash the target without `# Continuity Integrity` and everything after it.

Grounded diagnosis:

- Web app was wrong for schemas whose `Towards` points to `tiinex.root.v1.schema.md` while their `Parent` points to another schema.
- VS Code validator was likely correct for these cases if it resolved `Towards` directly.

Not browser-validated in sandbox:

- Live badge changes after asynchronous integrity verification.
- Remote fetch behavior for commit-pinned integrity targets under browser CORS/network conditions.


## v6.102 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Integrity verification is now confidence-aware.
- Non-exact loaded candidates cannot produce authoritative mismatch.
- Exact `Towards` target hashes still can produce verified or mismatch.

Grounded purpose:

- Reduce false red integrity alarms when the viewer has a plausible schema with the same filename but not the exact declared commit/path target.
- Preserve strong mismatch only for exact target bytes.


## v6.103 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Integrity mismatch is now reserved for locally anchored exact target bytes.
- Remote exact match can still verify.
- Remote exact non-match is non-red unavailable unless locally anchored.

Grounded user feedback:

- v6.102 still showed red integrity mismatch for maintained schemas where VS Code validator did not.
- The browser viewer should not present red failure unless it has exact authoritative local target bytes.

Not browser-validated in sandbox:

- Whether maintained schema cards now move from red mismatch to unavailable/verified in Chrome.


## v6.104 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `stripIntegritySection` now returns canonical hash input with an empty `# Continuity Integrity` footer stub.
- This specifically addresses false mismatch for `Towards: self`.
- Topbar scale was reduced slightly for visual cohesion.

Grounded user feedback:

- Integrity still showed mismatch/unavailable after prior patches.
- User reminded that some artifacts use `Towards: self`.
- User also noted the top header scale and workspace content scale feel inconsistent.

Not browser-validated in sandbox:

- Whether self-integrity badges now verify in Chrome.
- Whether remote maintained schema targets now move to the expected state.
- Subjective topbar scale balance.


## v6.105 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Integrity verifier tries multiple canonical input variants.
- Non-matching exact targets become `integrity unresolved` rather than red mismatch.
- Verified remains green if any canonical variant matches.

Grounded user feedback:

- v6.104 still showed red mismatch for `Root` with `Towards: self`.
- This indicates the browser canonicalizer still differs from the validator or repo history.
- The viewer should not show hard red failure while canonicalization is unresolved.


## v6.106 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Help renderer now removes trailing markdown dividers.
- Help renderer now supports recursive collapsible heading sections.

Grounded user feedback:

- A trailing `---` appeared inside the last Help section.
- Nested headings inside Help should also be collapsible recursively.

Not browser-validated in sandbox:

- Actual recursive collapse behavior in Chrome.
- Visual spacing for deeply nested Help sections.


## v6.107 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Integrity badge renderer now emits a diagnostic action for nodes with integrity.
- Integrity Diagnostics modal renders method, target, expected hash, computed variants, authority, and confidence.
- Copy diagnostics action is wired.

Grounded user feedback:

- Integrity remains unresolved after v6.105/v6.106.
- Need visibility into exactly what the web viewer tried so it can be compared with the VS Code validator.

Not browser-validated in sandbox:

- Clicking badges in Chrome.
- Clipboard behavior from file://.
- Exact diagnostic values for current repo schemas.


## v6.108 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Tree integrity badge CSS added.
- Maintained schema nodes with unresolved browser verification now show a softer `schema integrity` status.

Grounded user feedback:

- v6.107 made tree integrity badges much too large.
- Schemas are expected to have valid checksums, so loud unresolved/mismatch states are misleading until checksum parity is actually ported.

Not browser-validated in sandbox:

- Actual tree row badge size in Chrome.
- Whether all tree row class names are covered by the compact CSS selectors.


## v6.109 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Browser checksum canonicalizer now mirrors the VS Code implementation found in `Tiinex/ai-provenance/ides/vscode/src/traceableContinuityValidation.js`.

Grounded source:

- VS Code canonicalizer: `canonicalizeTraceableContinuityChecksumSource`
- VS Code checksum: `computeTraceableContinuityChecksumSha256`
- VS Code targeted checksum: `computeTargetedTraceableContinuityChecksumSha256`

Not browser-validated in sandbox:

- Whether schema badges now turn `integrity verified` in Chrome.
- Remote fetch behavior for commit-pinned schema targets.


## v6.110 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Badge labels no longer repeat the `integrity` prefix.
- Integrity diagnostics modal CSS now uses fixed centered dialog layout with mobile fallback.

Grounded user feedback:

- `integrity verified` prefix is redundant in the badge.
- Diagnostics opened like a full-screen surface, not like the existing modal/dialog pattern.
- Keep mobile friendliness in mind.

Not browser-validated in sandbox:

- Actual centered modal behavior in Chrome.
- Mobile viewport scroll behavior.


## v6.111 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Self markdown-link targets are handled as self.
- Tree integrity badge labels are hidden visually while retaining icon and tooltip.

Grounded user feedback:

- Diagnostics showed `[self](self)` as unavailable.
- Tree view should avoid text-heavy badges because it grows horizontally and should stay compact.
- Feed view can carry the full text labels instead.


## v6.112 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `renderTreeFile` now emits `tree-primary` and `tree-badges` wrappers.
- Tree integrity badge text is restored.
- Tree file rows use a two-region grid to keep badges on the same row.

Grounded user feedback:

- Icon-only tree badges were less useful.
- The real issue was a tree layout regression causing badges to sit on a separate row/position.
- Avoid horizontal growth and wrapping in tree view where possible.

Not browser-validated in sandbox:

- Actual tree row wrapping behavior in Chrome.
- Narrow viewport behavior.


## v6.113 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Diagnostics result syncs back to node status and cache.
- Lineage mode schedules a visible-node integrity refresh after render.

Grounded user feedback:

- A lineage badge showed `open`, but clicking diagnostics showed `verified`.
- This indicated stale cached badge state rather than a checksum failure.

Not browser-validated in sandbox:

- Whether the badge updates immediately after opening diagnostics in Chrome.
- Whether lazy lineage refresh timing is optimal.


## v6.115 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Logo CSS increases brand icon dimensions from 24px to 26px.
- Relation chip renderer now omits selected/parent/root/leaf candidate badges.
- Tree file renderer no longer emits a `leaf` badge for leaf nodes.
- Missing integrity uses danger styling.

Grounded user feedback:

- Logo should be 2px larger to better match surrounding buttons.
- `missing continuity` should be red.
- `selected leaf`, `parent context`, `root context`, and generic `leaf` badges are boilerplate.


## v6.116 check

Validated in sandbox:

- Repaired invalid nested-button HTML in tree rows.
- Tree integrity badge now renders as `<span>` inside the tree-row button.
- Schema + integrity badges remain inline in tree view.


## v6.117 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Tree file rows use `minmax(0, 1fr) max-content`.
- Badge group uses `overflow: visible` and `max-width: none`.
- Filename remains ellipsis-trimmable.

Grounded user feedback:

- v6.116 kept badges inline but they appeared clipped/slaughtered in tree view.


## v6.118 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- CSS-only modal scroll containment pass added.
- Broad modal selectors target existing dialog variants without changing JS behavior.

Grounded user feedback:

- Schema Read View content scrolled underneath its header.
- Some dialog content appeared to scroll outside the dialog.
- The issue likely affects more than one lightbox/dialog.


## v6.119 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- CSS-only brand/logo lockup patch applied.
- Patch is based on the manual Chrome CSS adjustments reported by the user.

Grounded user feedback:

- Manual CSS tuning produced the desired logo size and alignment.
- The resulting logo should fit the topbar buttons better without further image changes.

Not browser-validated in sandbox:

- Exact visual match to the user's tuned Chrome result.


## v6.120 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `renderNodeModal` override adds an explicit `modal-read-scroll` wrapper.
- CSS scopes the scroll containment fix to `.read-modal-panel` and `.read-modal-backdrop`.

Grounded user feedback:

- v6.118/v6.119 made Schema Read View content disappear/scroll incorrectly.
- Markdown-style dialog scroll behavior was the desired reference pattern.

Not browser-validated in sandbox:

- Schema Read View scroll behavior in Chrome.
- Raw Markdown modal scroll behavior after the shared wrapper.


## v6.121 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Help typography CSS appended only; no JS/layout behavior changed.

Grounded user feedback:

- Help headings felt too bold/fuzzy and visually merged together.
- Desired result is still Tiinex-styled, but sharper and more readable.


## v6.122 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `index.html` includes a default `window.TIINEX_VIEWER_OPTIONS` block.
- App-level `createWorkspace: false` hides `[data-action="open-create"]` and `[data-action="create-workspace"]`.
- Action handler guards against create actions when disabled.

Grounded user feedback:

- Need to disable Create workspace in the web app, not through workspace config.
- When disabled, the Create button should disappear.


## v6.123 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `renderPolicyBadge` and `noticeBadge` now emit buttons with `open-policy-document`.
- `renderModal` supports `policy-document`.
- `onActionV645` opens policy/notice dialog.
- Dialog includes `Open source` link only when a source URL is available.

Grounded user feedback:

- License and notice badges should behave like Help/Open dialogs.
- Avoid opening new browser tabs unless the user chooses an explicit source action inside the dialog.


## v6.124 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Policy/notice badge buttons are icon-only again through CSS.
- Dialog still has the top-right close button.
- Dialog footer no longer renders a redundant bottom Close button.

Grounded user feedback:

- v6.123 regressed compact legal badges into large text badges.
- Policy/notice dialog behavior was correct.
- Duplicate Close controls should be avoided.


## v6.125 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Added final `renderNodeModal` override before startup.
- Detail mode now calls `renderDetailReadView(ws, node)`.

Grounded user feedback:

- Clicking `Open` on a schema crashed with `Cannot read properties of undefined (reading 'currentSchemaText')`.
- Root cause was an argument mismatch introduced by the read-modal scroll wrapper.


## v6.126 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `renderCreateModal` override only changes workspace-create copy/layout.
- Non-workspace create modes delegate to the previous `renderCreateModal`.

Grounded user feedback:

- Create workspace dialog was too repetitive and could be more focused.


## v6.127 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `shouldIndexAsTrace` includes `.trace.md`, `.schema.md`, and `.workspace.md`.
- `readUploadedFilesIntoWorkspace` imports all file entries, including `.workspace.md`, instead of filtering workspace files out.
- `handleWorkspaceDrop` imports dropped files into a local/current workspace rather than treating `.workspace.md` only as an app-level config.
- `discoverGitHubTracePaths` includes `.workspace.md`.

Grounded user feedback:

- Dropping a schema file with no workspace open created a workspace but did not add the schema to the hierarchy.
- `.schema.md` and `.workspace.md` should not be limited to discovery/config behavior.
- `.workspace.md` files should appear in tree view and preferably feed as lineage/workspace artifacts.


## v6.128 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- CSS-only responsive image preview pass applied.
- Preview image sizing uses max-width/max-height with object-fit contain.

Grounded user feedback:

- Image attachment preview needed to handle images with different aspect ratios.
- Preview should stay usable on both desktop and mobile.


## v6.129 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `candidateLooksTrace` now accepts `.trace.md`, `.schema.md`, and `.workspace.md`.
- `nonLineageParentOrigin` no longer treats schema/workspace parents as non-lineage origins.
- `parentFetchCandidate` uses the GitHub-converted target path for absolute parent URLs.
- Lineage feed rendering can insert scope transition dividers.

Grounded user feedback:

- Parent URL was fetchable through GitHub but the viewer stopped at `Parent unavailable in this workspace`.
- `.schema.md` and `.workspace.md` participate in lineage and should be traversable.
- Cross-workspace/source boundaries should be visually clear in lineage mode.


## v6.130 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Import entries are deduped by source/path.
- `scheduleLineageParentPrefetch` now fetches the first open parent boundary automatically.
- `Audit` action can manually trigger the same one-boundary fetch.

Grounded user feedback:

- Dropping one schema showed `Local 2`.
- Fetchable parent boundaries should not create abrupt stops when the user is trying to traverse lineage.
- An Audit control should exist as a clear manual path.


## v6.131 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `fetchParentTrace(ws, last, candidate)` exists and delegates to `fetchParentCandidate(ws.id, candidate)`.
- `renderWorkspaceSourceStrip` now counts indexed files first, falling back to asset-only count.

Grounded user feedback:

- Audit button crashed with `ReferenceError: fetchParentTrace is not defined`.
- Dropping one schema file showed `Local 2` because the source pill counted the indexed file and preserved asset separately.


## v6.132 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `discoverGitHubTracePaths` skips GitHub API tree calls in `file://` / origin-null mode.
- `fetchJson` also guards accidental GitHub tree API calls in static mode.

Grounded user feedback:

- Browser console showed CORS errors for `https://api.github.com/repos/Tiinex/docs/git/trees/master?recursive=1` from `origin null`.
- Static disk mode must remain supported and should not require hosted/web mode.


## v6.133 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `computeWorkspaceIndex` now performs a second parent-edge resolution pass after the existing index build.
- Loaded parents can be matched by GitHub-converted path/rawUrl/browseUrl.

Grounded user feedback:

- Root schema was visible in discovery/tree after fetch, but did not appear in the workspace schema lineage.
- Root cause: parent URL was absolute while the loaded parent node was indexed by path/source/rawUrl, so the edge did not bind.


## v6.134 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `filteredDiscoveryNodes` applies display options.
- Workspace header renders a Display options button.
- Display options modal toggles leaves-only and artifact type visibility.

Grounded user feedback:

- Non-leaf parent nodes can be loaded but hidden by the leaf-only discovery view.
- `.workspace.md` artifacts should be visible when desired in feed/tree.
- User requested a small display-options dialog with toggles for leaves and artifact suffix types.


## v6.135 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `countWorkspaceSources` exists and falls back to `sourceCount`.
- `filteredDiscoverySources` exists defensively.
- `renderWorkspaceFeed` no longer renders the filter dropdown in the toolbar.
- `renderDisplayOptionsModalV6134` includes the discovery filter.

Grounded user feedback:

- v6.134 rendered a blank page with `countWorkspaceSources is not defined`.
- The filter dropdown belongs in Display options and removing it from the toolbar should improve mobile fit.


## v6.136 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Static Git discovery path uses `https://data.jsdelivr.com/v1/package/gh/<repo>@<ref>/flat`.
- Empty policy dialog renderer is overridden with compact metadata and empty-note layout.

Grounded user feedback:

- `Tiinex/docs` Git source import found no files after the v6.132 CORS guard.
- Policy unknown dialog was visually oversized when no policy document text exists.


## v6.137 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `removeNodeFromWorkspace` removes matching `ws.files` and `ws.assets`.
- Source-strip count is based on remaining files first, then assets.
- Empty sources are hidden from the source strip.
- Parent fetch cache entries matching removed nodes are cleared.

Grounded user feedback:

- Removing uploaded `.trace.md`/`.schema.md` cards removed them from feed/tree but left source count and conflict residue behind.
- Re-uploading the same removed file unexpectedly asked for sibling/replace.


## v6.138 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Tree toolbar renders `toggle-tree-all` only in Tree view.
- Toggle uses the same filtered discovery node set as the current tree.
- Expand/collapse state writes to `ws.treeExpandedFolders`.

Grounded user feedback:

- Need a compact collapse all / expand all control beside search to reset Tree view quickly.


## v6.139 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `workspaceHasPathInSource` ignores orphan lineage markdown assets and checks indexed files for `.trace/.schema/.workspace.md`.
- `detectImportConflicts` prunes orphan lineage assets before conflict checks.
- `sourceDisplayCountV6131` prunes orphan lineage assets before counting.
- `removeNodeFromWorkspace` runs a second cleanup pass after node removal.

Grounded user feedback:

- Removing an uploaded `.workspace.md` removed the visible card but left `Local 1`.
- Re-importing the same removed file still triggered a same-file-path merge conflict.


## v6.141 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Built from v6.139 because v6.140 had a recursive `commitImportEntries` override.
- `commitImportEntries` override uses assignment form, not a hoisted function declaration.
- Auto-parent-fetch cache can be cleared for removed/reimported nodes.

Grounded user feedback:

- v6.140 produced `RangeError: Maximum call stack size exceeded`.
- Likely loop source was the v6.140 import/cache override.


## v6.142 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `parentFetchState` now invalidates stale loaded state when no matching parent node exists.
- `removeNodeFromWorkspace` wraps cleanup for single-use lazy-loaded parent boundaries.

Grounded user feedback:

- First upload auto-loaded parent.
- After remove and manual re-upload, the leaf still showed a lazy-loadable parent URL but did not auto-load the parent.
- Likely stale `parentFetches` loaded state was suppressing retry.


## v6.143 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Edit modal can be opened for local/uploaded nodes.
- Save updates local workspace file text and recomputes index.
- Add modal creates local `.trace.md`, `.schema.md`, or `.workspace.md` files.
- Workspace plus button is redirected to first-pass Add artifact.

Known limitations:

- Raw markdown editor only.
- No schema-aware field forms yet.
- No Git write/commit behavior.
- Workspace plus is temporarily focused on Add artifact rather than source modal.


## v6.144 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Broken v6.143 `const onInputBeforeEditAddV6143 = onInput;` block removed.
- Edit/Add modal fields now use delegated window listeners.

Grounded user feedback:

- v6.143 opened to a blank page with `ReferenceError: onInput is not defined`.


## v6.145 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Removed `const renderNodeActionsBeforeEditAddV6143 = renderNodeActions`.
- Continue action is intercepted before older action chain and opens Add artifact.
- Edit button injection no longer depends on `renderNodeActions`.

Grounded user feedback:

- Clicking Continue caused `RangeError: Maximum call stack size exceeded`.
- Likely root cause was another function-hoisting recursion introduced in first Edit/Add pass.


## v6.146 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `canEditNodeV6143` is overridden to local/generated-only.
- Reference action is intercepted when it has workspace/node context and opens Add artifact with a reference template.

Grounded user feedback:

- Edit was shown for committed/remote nodes, but should normally be for local/uncommitted/new nodes only.
- Continue and Reference are Add flows from the user's point of view.
- Raw markdown editing should be fallback/advanced, not the primary schema-aware edit surface.


## v6.147 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `editButtonForNodeV6145` now returns an icon-only button.
- CSS constrains the edit button to a compact square footprint.

Grounded user feedback:

- Edit should remain available but fit beside the other node actions without creating a new row.


## v6.148 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `normalizeNodeActionButtonsV6148` applies compact icon styling after render.
- Existing visible action text is converted to tooltip/aria-label.
- Constructive Edit gets green treatment; destructive Remove gets red treatment.

Grounded user feedback:

- The node action row contains many buttons and will grow.
- Text beside every action does not scale well on mobile/narrow views.
- Edit and Delete should both fit, with green/red differentiation to reduce accidental clicks.


## v6.149 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `renderAddArtifactModalV6143` now renders mode-specific Continue/Reference/New copy.
- `renderEditNodeModalV6143` uses the markdown studio.
- Markdown toolbar actions insert snippets and update modal state.
- Preview rendering is local and intentionally minimal.

Grounded user feedback:

- Continue and Reference opened dialogs that looked too similar.
- Add/Edit needed a more useful markdown editor surface.
- Dialogs should be more desktop/mobile friendly.
- Raw markdown edit is fallback; schema-aware wizard forms are future work.


## v6.150 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `markdownStudioV6149` supports Markdown and Raw modes.
- `set-editor-mode` action updates modal editor mode.
- CSS reduces studio/modal height and adjusts desktop/mobile behavior.

Grounded user feedback:

- Markdown editor was too tall and caused avoidable modal scroll.
- Need ability to swap between Raw edit mode and Markdown edit mode.
- Prefer keeping UX tight before committing to a third-party markdown editor dependency.


## v6.151 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Editor mode toggle now exposes Rich/Raw.
- Rich mode renders a contenteditable markdown surface.
- Rich input updates modal markdown state via a small HTML-to-markdown converter.
- Toolbar actions target Rich mode through browser editing commands and Raw mode through markdown snippets.

Grounded user feedback:

- The non-raw mode should not be a preview.
- User expects a Rich Text Editor-like experience that saves back into markdown.


## v6.152 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Removed `openContinuationAddModalBeforeModeV6150` / `openReferenceAddModalBeforeModeV6150` wrapper block.
- Added a render-time default that marks Add dialogs as Rich when no editor mode is set.

Grounded user feedback:

- Clicking Continue in v6.151 caused `RangeError: Maximum call stack size exceeded`.
- Root cause was inherited v6.150 hoisted function-wrapper recursion, not the Rich editor surface itself.


## v6.153 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- `applyMarkdownToolV6149` no longer re-renders after Rich toolbar commands.
- Markdown toolbar mouse-down prevents selection loss in contenteditable mode.
- Rich editor and Raw textarea are bounded and scroll internally.

Grounded user feedback:

- Rich mode behaved like an editable preview; adding a heading could feel like raw `#` insertion and required switching Raw/Rich to refresh.
- Editor surface could grow larger than the dialog.


## v6.154 check

Validated in sandbox:

- `node --check app.js` passes.
- Static zip packaging completed.
- Add/Edit modal CSS uses a fixed flex layout.
- Rich editor / Raw textarea are the intended single scroll containers.
- Body-level Add/Edit scrolling is disabled to avoid double scroll.

Grounded user feedback:

- Rich editor now behaves much better, but the Add/Edit dialog still showed both modal-level and editor-level scrollbars.
