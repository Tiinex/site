# Audit Ownership

Audit is a domain operation, not a per-schema presenter.

Audit means: plan/load missing lineage, resolve schema modules, run or rerun validation when more authority is available, compare integrity/source boundaries, count findings, and produce a report. `src/audit/` owns that process. `src/surfaces/audit/` displays the report. `src/schemas/**.validate.*` and `src/schemas/**.findings.*` contribute schema-specific findings.
