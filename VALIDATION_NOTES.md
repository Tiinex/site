# Tiinex Site v171 Validation Notes

v171 covers closure repair after external review of v158/v160 and continues from v161 delivery truth.

## Key checks

- `npm run validate` passes without requiring `.old/` as a build input.
- Creation contracts run target schema validators.
- Continue exposes only schema-honest Topic creation.
- Reference generates Evidence-conform sections.
- Metadata-only source-backed records audit as `pending-unavailable`, not invalid.
- GitHub transport policy can block repo discovery and raw reads before fetch.
- GitHub adapter diagnostics are inserted into workspace import/recoverability state.
- Same path across multiple sources creates `lineage.target.ambiguous` and no guessed edge.

## Validation run in sandbox

```text
npm run validate
npm run ui:shape
npm run usecase:uc001
```

Full `npm run test` should be run in a dependency-installed environment because build/runtime smoke require Vite/React dependencies.
