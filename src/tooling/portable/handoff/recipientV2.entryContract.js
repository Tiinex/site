export const RECIPIENT_V2_ROUTE_SELECTION_AUTHORITY = 'outer-invocation-exact-package-local-handoff-route-pointer';
export const RECIPIENT_V2_SIBLING_ROUTE_INFERENCE = false;

export function recipientV2EntryCurrentRead() {
  return Object.freeze([
    Object.freeze({ label: 'Bootstrap Exception', value: 'before Tiinex Tooling is available, use host capabilities only to read this entry/bootstrap node and extract the declared bootstrap ZIP into a writable runtime location; do not unpack Workspace/cache payloads or perform package archaeology' }),
    Object.freeze({ label: 'Tooling Takeover', value: 'after bootstrap extraction, invoke the supplied Tiinex Tooling against the untouched original Handoff-package carrier; `orient-handoff-package` is the first semantic operation' }),
    Object.freeze({ label: 'Route Selection', value: 'the host invocation must name exactly one package-local Handoff Route Pointer from this package; never infer among sibling Handoff routes' }),
    Object.freeze({ label: 'Recovery', value: "follow the selected route's declared Parent/payload lineage, resolve its exact Handoff and endpoint/context dependencies, and ground the recipient before substantive work" }),
    Object.freeze({ label: 'Fallback', value: 'fail closed when Tooling cannot qualify the selected route or its declared dependency/integrity evidence; native package archaeology is not a preferred-path substitute' })
  ]);
}
