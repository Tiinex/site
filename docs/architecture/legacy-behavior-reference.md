# Legacy Behavior Reference

The archived `.old/` tree is not runtime code, but it remains active evidence for the refactor.

## Refactor Rule

Before rebuilding a feature slice, inspect the matching behavior in `.old/` and preserve the reasoning behind flows that worked. Do not copy the monolith into the new runtime, but do not discard the product knowledge embedded in it.

## What To Learn From `.old/`

- visible source boundaries and no local-to-GitHub guessing
- dense artifact badges for schema, source, status, integrity, and findings
- feed/tree/lineage as different arrangements of the same material
- audit as an explicit operation, not passive display
- mismatch/open/pending/ok counts as visible review signals
- load-more-lineage behavior that treats missing parents as open boundaries, not absence
- cache and source controls that stay reachable even when there is only one source

## What Not To Preserve Blindly

- monolithic ownership
- hidden cascade behavior
- UI labels that only Q can understand
- source resolution that is not explicit to the reader
- old workarounds once a cleaner owner exists

## v88 Audit Lesson

The old lineage audit did three useful things that should survive the rewrite:

1. It made audit user-invoked.
2. It loaded open parent boundaries before claiming completeness.
3. It counted OK, mismatch, open, and pending states visibly.

The v88 implementation keeps that shape at scaffold depth: it scans loaded workspace records, re-runs available validation, marks missing parent lineage as open, and avoids network traversal until source-backed read paths exist.

## v89 Ergonomics Lesson

The old workspace was compact because most repeated actions were carried by position, chips, icon buttons, and consistent visual rhythm rather than explanatory paragraphs. v89 carries that lesson by moving source/search/discovery controls into compact affordances and keeping long explanations in details/docs.
