# Foundation Test Strategy

Foundation uses a small permanent component/use-case acceptance spine during pre-production.

## Permanent contract

- `tools/foundation-acceptance.test.mjs` is the single standalone `*.test.mjs` entrypoint.
- Durable current checks live as `*.case.mjs` members of named suites in `tools/foundation-test-suite.contract.mjs`.
- `smoke`, `focused/tooling`, `integration`, and `closure` compose those suites plus distinct validators. They do not enumerate the historical test corpus file by file.
- New pre-production behavior normally updates the relevant existing component/use-case case. A new permanent case requires a distinct current invariant and explicit suite ownership.
- The suite runner keeps case processes isolated because some retained current-contract cases own process-level setup/teardown.

## Routine command discipline

Cold recipients and ordinary developers start with the narrowest command that matches the work; escalation is explicit and purpose-driven.

- `npm test` runs the permanent Foundation component/use-case acceptance entrypoint. It does not invoke integration or closure.
- `npm run validate:smoke` is the smallest representative repository gate.
- `npm run validate:tooling-iteration` adds the focused Tooling suite and regression-aware static diagnostic for Tooling iteration.
- `npm run validate:integration` is an explicit repository-integration escalation after targeted work is ready for cross-component qualification.
- `npm run validate:closure` is an explicit closure boundary. Use it only when closure is actually in scope; inherited strict-static debt remains visible there.

A cold recipient should not escalate merely because a broader command exists. Use the component/use-case suite that owns the changed invariant first, then move outward only when the task or return boundary requires it.

## Regression lifecycle

A standalone regression is temporary bug-reproduction evidence for a production defect, not the default response to pre-production implementation change.

After the production fix:
1. move the durable behavior into the relevant component/use-case suite;
2. remove the standalone regression unless it protects a genuinely separate current invariant that cannot be represented truthfully there;
3. keep strict validators truthful rather than deleting or relabeling unresolved failures.

The corpus is intentionally non-monotonic: historical implementation-shape tests may be deleted when their current behavior is already represented by the permanent suites.

## Validation layers

- `smoke`: architecture shape plus representative end-to-end Foundation use cases.
- `focused/tooling`: smoke plus focused Tooling cases and the real regression-aware static diagnostic.
- `integration`: focused plus remaining component/use-case suites and distinct repository integration validators.
- `closure`: integration plus strict static validation and the explicit release-adjacent validators.

Passing a lower layer does not imply a higher layer passed.
