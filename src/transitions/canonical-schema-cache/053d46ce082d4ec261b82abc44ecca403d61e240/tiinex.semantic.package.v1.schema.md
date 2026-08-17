# Continuity Context

- Envelope Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.root.v1](../../tiinex.root.v1.schema.md)
  - Created At: 2026-08-17 00:00:00
  - Trace: [tiinex.root.v1.schema.md](../../tiinex.root.v1.schema.md)
  - Origin:
    - [browse + git](https://github.com/Tiinex/docs/blob/d69b8ff55a56b8cb9282b8684db6a938a4435b94/.topics/.schemas/tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.semantic.package.v1](tiinex.semantic.package.v1.schema.md)
  - Created At: 2026-08-17 00:00:00
  - Status: Draft schema proposal
  - Why: Defines a portable semantic package boundary so schemas, schema-local companions, nearby Transition Definitions, nested packages, and external dependencies can be discovered without repository-global assumptions or application-code-only truth.
  - Summary: Portable transport and discovery manifest for bounded Tiinex semantic packages.

---

# Semantic Package Manifest

## Summary

Defines a portable boundary for moving and compiling a semantic neighborhood of Tiinex artifacts.

A Semantic Package Manifest says where package-scoped discovery begins and ends, which nested packages are intentionally included, which external packages are dependencies, and how schema identifiers resolve to exact schema artifacts when explicit resolution is required.

The package boundary is packaging and discovery truth only. It does not own the schemas or Transition Definitions it contains, does not change their semantics, and does not make filesystem location semantic identity.

## Core Semantics

- Semantic package = declared transport and discovery boundary.
- The manifest directory is the package root only because the manifest explicitly declares that boundary rule.
- Package containment is not semantic ownership.
- Relative references are portable only while they remain inside the declared package boundary.
- Cross-package dependencies require explicit package/reference authority.
- Nested packages remain separate package authorities and are included in an aggregate only when explicitly referenced.
- A package may contain zero, one, or many schemas and zero, one, or many Transition Definitions.
- A package may exist solely as an integration package that binds other packages and hosts cross-package Transition Definitions.
- Paths, filenames, package names, and package handles are not global artifact identity.
- Transition Definition artifacts remain the sole canonical source for Transition roles, effects, lifecycle, relations, conditions, generation, and placement semantics.

## Schema Validation Contract

### Semantic Package Scope

Applies To

- artifacts whose `Current -> Current Schema` is `tiinex.semantic.package.v1`

Rules

- `tiinex.semantic.package.v1` identifies artifacts whose main job is to declare one portable semantic package boundary and its package/schema dependency-resolution surface.
- A semantic package manifest must remain readable without JavaScript, one repository layout, one runtime, or one application-local registry.
- Package membership and inclusion are transport/discovery facts only and must not be interpreted as semantic ownership of contained artifacts.
- Prose outside `Schema Validation Contract` may explain the package, but it does not add machine requirements.

### Semantic Package Body

Required Shape

- first body heading after the continuity envelope
- `## Package Identity` section
- `## Package Boundary` section
- `## Included Packages` section
- `## External Package Dependencies` section
- `## Schema Resolution Bindings` section
- `## Interpretation Limits` section

Rules

- Required package sections must remain human-readable and machine-extractable.
- `Included Packages`, `External Package Dependencies`, and `Schema Resolution Bindings` use repeated declaration shapes defined below.
- A declaration set that intentionally contains zero declarations must use one literal first-level entry named `none` and no other entries.

### Package Identity

Required Fields

- Package Name
- Purpose

Optional Fields

- Package Handle
- Package Version
- Notes

Rules

- `Package Name` is human-readable package labeling and must not be treated as a universal package identifier.
- `Package Handle` is optional local/package-graph shorthand only and must not silently become global identity.
- `Package Version` describes the manifest/package declaration and must not be used to deduplicate schemas or Transition Definitions.
- Exact external package references resolve the referenced manifest artifact rather than guessing by Package Name or Package Handle.

### Package Boundary

Required Fields

- Boundary Root
- Discovery Policy
- Nested Package Policy

Field Value Constraints

- Boundary Root
  - Allowed Value: manifest-directory
  - Domain Policy: closed

- Discovery Policy
  - Allowed Value: recursive-within-boundary
  - Domain Policy: closed

- Nested Package Policy
  - Allowed Value: explicit-only
  - Domain Policy: closed

Rules

- `Boundary Root: manifest-directory` means the physical directory containing this manifest is the root of this package's automatic discovery boundary.
- The directory location is package placement, not semantic identity.
- `Discovery Policy: recursive-within-boundary` allows package compilation to inspect descendants of the package root for schemas, schema-local companions, and distributed `.transitions/` directories.
- Automatic package traversal must stop before entering any descendant directory that contains another `tiinex.semantic.package.v1` manifest.
- A nested package boundary is not aggregated into the current package merely because it is physically below the package root.
- `Nested Package Policy: explicit-only` means a nested package is aggregated only when referenced under `Included Packages`.
- Files outside the declared package boundary are not package-internal merely because a relative filesystem path can reach them.
- A directory must not expose more than one Semantic Package Manifest as competing automatic boundary authority; competing manifests at one boundary are ambiguity and fail closed.

### Included Package Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Package Reference

Optional Fields

- Note

Field Value Constraints

- Package Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## Included Packages` are repeated named declarations using this shape.
- The declaration name is a package-local readability handle only and is not package identity.
- `Package Reference` must resolve to exactly one `tiinex.semantic.package.v1` artifact physically inside a nested package boundary below the current package root.
- Package-internal nested references should use relative Markdown links.
- A relative reference that escapes the current package boundary is not a valid included-package reference even when the target file exists.
- The literal entry `none` is allowed only as the sole `## Included Packages` entry and is exempt from declaration fields.

### External Package Dependency Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Package Reference

Optional Fields

- Note

Field Value Constraints

- Package Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## External Package Dependencies` are repeated named declarations using this shape.
- The declaration name is a local readability handle and is not package identity.
- `Package Reference` must identify exactly one external Semantic Package Manifest.
- Cross-package dependency references must not rely on a relative path that escapes the current package boundary.
- A non-resolving external package reference remains an explicit unresolved dependency; compilers must not search the source repository or repository siblings as an undeclared fallback.
- An ambiguous package reference must fail closed.
- The literal entry `none` is allowed only as the sole `## External Package Dependencies` entry and is exempt from declaration fields.

### Schema Resolution Binding Declaration

Entry Shape

- First-Level Hyphen List Item

Required Fields

- Schema Reference

Optional Fields

- Package Reference
- Note

Field Value Constraints

- Schema Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

- Package Reference
  - Allowed Shape: Markdown Link
  - Domain Policy: closed

Rules

- Entries under `## Schema Resolution Bindings` are repeated named declarations using this shape.
- The declaration name is the exact case-sensitive Schema Identifier being bound.
- `Schema Reference` must resolve to exactly one schema artifact whose `Current -> Current Schema` equals the declaration name.
- A package-internal Schema Reference may be relative only when the target stays inside the current package boundary.
- When the bound schema is outside the current package boundary, `Package Reference` is required and must resolve to exactly one package declared under `External Package Dependencies` or `Included Packages`.
- An external Schema Reference must resolve inside the boundary of that referenced package.
- Existence of a relative filesystem target is not by itself schema-resolution authority.
- Duplicate declarations of the same Schema Identifier are invalid.
- When compilation discovers multiple competing candidate artifacts for one Schema Identifier and this manifest does not provide one exact binding, schema resolution is ambiguous and must fail closed.
- An explicit binding in the selected manifest is the package-scoped selection authority for that Schema Identifier only; it does not create global schema identity or assignability.
- Zero resolvable candidates means unresolved.
- One exact resolvable candidate means resolved.
- More than one competing candidate without one exact manifest binding means ambiguous/unresolved.
- The literal entry `none` is allowed only as the sole `## Schema Resolution Bindings` entry and is exempt from declaration fields.

### Distributed Transition Discovery

Rules

- Package compilation may discover Transition Definition artifacts in any `.transitions/` directory reachable inside the selected package boundary.
- Recursive discovery must stop at nested Semantic Package Manifest boundaries unless those packages are explicitly included.
- External dependency packages are compiled through their explicit Package References, not by repository-global scanning.
- A Transition Definition discovered outside its preferred locality remains semantically valid when reached through an allowed package/reference route.
- A Transition Definition that is merely present elsewhere in the repository is not automatically part of the selected package registry.
- Logical registries are compiled aggregates and must preserve the provenance of every discovered representation.
- Package compilation must terminate on repeated/cyclic package references by tracking exact resolved package-manifest representations; a dependency cycle must not cause infinite traversal.

### Preferred Transition Locality

Rules

- `.transitions/` is a physical locality and discovery convention only; it does not own Transition semantics and is not Transition identity.
- When a Transition Definition has one exact output schema, its preferred physical location is a `.transitions/` directory beside that output schema artifact.
- When all outputs use the same exact schema, the same output-schema-local `.transitions/` directory remains preferred.
- When a Transition Definition has multiple distinct exact output schemas inside one declared semantic package, its preferred location is the `.transitions/` directory at the lowest declared package boundary that contains all of those output schemas.
- `lowest declared package` means an explicit Semantic Package Manifest boundary, never nearest common filesystem ancestry guessed from path shape.
- When outputs span multiple packages, the preferred location is a `.transitions/` directory in an explicitly declared integration/common package.
- A zero-output Transition Definition belongs physically in an explicitly chosen host/integration package `.transitions/` directory.
- A Transition Definition whose output schema is generic, unresolved, or not exact enough for schema-local anchoring belongs physically at the relevant package-level `.transitions/` directory.
- Moving a Transition Definition to a different preferred locality must not silently change its canonical Transition semantics or identity.
- Transition Definition filenames should retain the established `<transition-slug>-transition-definition.trace.md` convention.

### Package Transfer Semantics

Rules

- The declared package root is the intended transport unit for package-internal artifacts, excluding nested package content from semantic aggregation unless it is explicitly included.
- Copying a package root to another repository must not require scanning the source repository to rediscover local schemas, local companions, or local Transition Definitions.
- Package-internal relative references remain portable when their relative topology remains intact inside the copied package root.
- Missing external dependencies remain explicit unresolved dependencies after transfer.
- Package movement or repository relocation must not by itself create a new schema or Transition semantic identity.
- Rewritten or otherwise changed representations must not be assumed globally identical merely because names or meaning appear equivalent.

### Registry Identity And Dedupe

Rules

- Physical path, filename, Package Name, Package Handle, Transition `Canonical Identifier`, and Transition `Version` are not universal cross-origin representation identity.
- A compiler may collapse repeated discovery only when exact concrete representation sameness is provable, such as resolving to the same exact artifact representation or another verified representation-identity authority.
- Collapsing repeated discovery must preserve all discovery, source, and package provenance.
- Two different Transition representations that share `Canonical Identifier` and `Version` must remain distinct unless a separate authority proves they are the same representation.
- Package inclusion or movement must not silently invent global logical identity semantics.

### Interpretation Limits

Required Fields

- Does Not Mean
- Must Not Be Used To Claim

Rules

- A package manifest does not own or rewrite contained schema validation semantics.
- A package manifest does not own or rewrite Transition Definition semantics.
- Package inclusion does not prove Transition participation, applicability, executability, authorization, runtime support, or product visibility.
- Package discovery does not prove that external dependencies resolve.
- The package filesystem boundary is a transport/discovery boundary only.

## Artifact Creation Contract

### Creation Scope

Required Fields

- Create When
- Do Not Create When

Rules

- Create a Semantic Package Manifest when a portable schema/Transition neighborhood needs an explicit transport and discovery boundary.
- Create an integration package when cross-package Transition Definitions need one explicit package-scoped locality and dependency surface.
- Do not create a Semantic Package Manifest merely to mirror an arbitrary software folder, Node package, React module, or repository root.
- Do not use a semantic package to duplicate schema or Transition semantic truth.

### Required Inputs

Required Fields

- Package Name
- Purpose
- Package Boundary
- Included Packages
- External Package Dependencies
- Schema Resolution Bindings
- Interpretation Limits

Rules

- Unknown dependencies should remain explicit rather than being replaced by repository-global guesses.
- Package authors should prefer the smallest package boundary that remains understandable and transferable.

### Generation Rules

Rules

- Place the manifest at the directory that is intended to become the package root.
- Prefer relative references only for artifacts that remain inside the same declared package boundary.
- Use explicit external Package References for cross-package dependencies.
- Add exact Schema Resolution Bindings when schema identifiers would otherwise be unresolved or ambiguous.
- Keep Transition semantic definitions in their canonical Transition Definition artifacts.

## Minimal Example

```text
# Task Semantic Package

## Package Identity

Package Name: Task semantic package
Package Handle: task
Purpose: Carry the Task schema, its explicit Transition attachments, and nearby canonical Transition Definitions as one portable semantic neighborhood.

## Package Boundary

Boundary Root: manifest-directory
Discovery Policy: recursive-within-boundary
Nested Package Policy: explicit-only

## Included Packages

- none

## External Package Dependencies

- topic-package
  - Package Reference: [Topic semantic package](https://packages.example.test/topic/topic-semantic-package.trace.md)
  - Note: Supplies tiinex.topic.v1.

- finding-package
  - Package Reference: [Finding semantic package](https://packages.example.test/finding/finding-semantic-package.trace.md)

- issue-package
  - Package Reference: [Issue semantic package](https://packages.example.test/issue/issue-semantic-package.trace.md)

## Schema Resolution Bindings

- tiinex.task.v1
  - Schema Reference: [tiinex.task.v1](tiinex.task.v1.schema.md)

- tiinex.topic.v1
  - Schema Reference: [tiinex.topic.v1](https://packages.example.test/topic/tiinex.topic.v1.schema.md)
  - Package Reference: [Topic semantic package](https://packages.example.test/topic/topic-semantic-package.trace.md)

- tiinex.finding.v1
  - Schema Reference: [tiinex.finding.v1](https://packages.example.test/finding/tiinex.finding.v1.schema.md)
  - Package Reference: [Finding semantic package](https://packages.example.test/finding/finding-semantic-package.trace.md)

- tiinex.issue.v1
  - Schema Reference: [tiinex.issue.v1](https://packages.example.test/issue/tiinex.issue.v1.schema.md)
  - Package Reference: [Issue semantic package](https://packages.example.test/issue/issue-semantic-package.trace.md)

## Interpretation Limits

Does Not Mean: this package owns Task, Topic, Finding, Issue, or any Transition Definition semantics
Must Not Be Used To Claim: that a discovered or attached Transition is currently applicable, executable, authorized, or visible in a product UI
```

## File Naming

- Semantic Package Manifest artifacts should use `<package-slug>-semantic-package.trace.md`.
- The filename is a placement/navigation convention and is not package identity.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: FjS8D5liWk-L3-2bh8okdYtZjkRRuRQaC4MTTMw1Ipg