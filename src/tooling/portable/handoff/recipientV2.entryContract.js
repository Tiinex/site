export const RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY = 'outer-invocation-exact-package-local-handoff-route-pointer';
export const RECIPIENT_V2_SIBLING_ROUTE_INFERENCE = false;

export function recipientV2EntryCurrentRead() {
  return Object.freeze([
    Object.freeze({ label: 'Bootstrap Exception', value: 'before Tiinex Tooling is available, use host capabilities only to read this entry/bootstrap node and extract the declared bootstrap ZIP into a writable runtime location; do not unpack Workspace/cache payloads or perform package archaeology' }),
    Object.freeze({ label: 'Tooling Entrypoint', value: '`runtime/tools/tiinex-portable.mjs` relative to the chosen bootstrap extraction root; use this exact path and do not search/list the extracted runtime to discover it' }),
    Object.freeze({ label: 'First Tooling Invocation', value: '`node <bootstrap-root>/runtime/tools/tiinex-portable.mjs orient-handoff-package <untouched-handoff-package.zip>`' }),
    Object.freeze({ label: 'Continue From', value: 'do not read the outer Continue-from Pointer natively; keep that exact package-local path opaque until Tooling takeover' }),
    Object.freeze({ label: 'Qualification', value: 'after orientation, run `node <bootstrap-root>/runtime/tools/tiinex-portable.mjs qualify-cold-start <untouched-handoff-package.zip> --route <Continue-from> --pre-takeover minimal-bootstrap-only`; this one-shot operation performs recipient grounding and cold-start qualification without external schema/source discovery' }),
    Object.freeze({ label: 'Route Selection', value: 'the outer invocation must name exactly one package-local Handoff Route Pointer from this package; never infer among sibling Handoff routes' }),
    Object.freeze({ label: 'Fallback', value: 'fail closed when Tooling cannot qualify the selected route or its declared dependency/integrity evidence; native package archaeology is not a preferred-path substitute' })
  ]);
}
