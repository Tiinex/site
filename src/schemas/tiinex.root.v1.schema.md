# Continuity Context

- Envelope Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
- Current
  - Current Schema: [tiinex.root.v1](tiinex.root.v1.schema.md)
  - Created At: 2026-06-14 00:00:00
  - Summary: Root schema for Tiinex lineage artifacts with repair-note support.
- Repairs
  - Parent recovery locality correction
    - Target: Schema Validation Contract / Parent Origin and Schema Reference Fields
    - Note: Parent recovery no longer requires fabricated relative locality. Local recovery uses truthful relative paths; external or historical recovery uses a qualified version-stable locator when local relative recovery is unavailable. Published schema references use immutable canonical locators when available. Transport closure may augment recovery for an already-truthful Parent edge but does not create missing source Origin authority; bounded export must preserve a usable recovery route or fail closed.
    - Reason: Cross-repository lineage exposed that a universal relative requirement forced duplicate Parent material and weakened bounded transport and exact source recovery.
  - Human-first shared semantic surface clarification
    - Target: Root Semantics
    - Note: Human-readable declared artifact meaning is the primary shared semantic surface; LLM recovery and machine validation/generation must preserve that same non-contradictory declared meaning within their explicit authority surfaces.
    - Reason: Anchor accepted the bounded Axiom finding that this cross-schema invariant was strongly distributed in current authority but not stated once canonically at Root.

---

# Root

## Summary

Defines the minimum shared contract for Tiinex lineage artifacts.

A Tiinex artifact must be identifiable, traversable, and verifiable before any descendant schema adds body-specific meaning.

## Root Semantics

Root requires:

- schema identity
- creation time
- continuity position
- integrity footer

If `Parent` exists, the artifact continues a declared parent artifact.

If `Parent` is absent, the artifact is the root of its local lineage.

Parent absence does not erase origin or provenance. It only means no parent edge is declared.

If `Repairs` exists, the artifact declares known repair, correction, or trust-impacting context that should remain visible to later readers and tools.

Human-readable declared artifact meaning is the primary shared semantic surface. LLMs may recover or explain that same declared meaning without inventing missing authority. Machines may validate or generate only the explicit machine contract surfaces. Machine validation may be stricter about acceptance shape, but it must not create a contradictory semantic meaning. LLM or runtime-private state must not silently override or invent artifact semantic authority.

## Contract Reading Model

The `Schema Validation Contract` section is the machine-readable validation surface for this schema.

Validators should not infer additional required fields, sections, or rules from prose outside the `Schema Validation Contract`.

Descendant schema contracts are additive unless they explicitly define an override.

## Inheritance

Descendant schemas may add:

- sections
- fields
- semantics
- validation requirements
- derived concepts
- envelope fields

Descendant schemas should not restate inherited requirements unless local readability requires it.

## Extension

Any descendant-defined extension should declare:

- Name
- Base Concept
- Interpretation

Envelope extensions should also declare the envelope block they extend.

---

## Schema Validation Contract

### Machine Authority Surfaces

Validation Authority

- Schema Validation Contract

Generation Authority

- Artifact Creation Contract

Integrity Authority

- Continuity Integrity

Non-Authoritative For Validation

- Summary
- Root Semantics
- Contract Reading Model
- Inheritance
- Extension
- Artifact Creation Contract

Rules

- Validators must read `Schema Validation Contract` as the validation surface.
- Validators must not infer extra required fields from non-authoritative prose sections.
- `Artifact Creation Contract` defines generation when present.
- `Artifact Creation Contract` must not override `Schema Validation Contract`.
- `Continuity Integrity` defines the integrity footer.
- Descendant schema contracts are additive unless they explicitly define an override.

### Contract Syntax

Group Shape

- Third-Level Heading

Category Shape

- Category Label
- Hyphen List Items

List Marker

- hyphen

Known Category Labels

- Allowed Labels
- Allowed Shapes
- Allowed Target Blocks
- Applies To
- Category Shape
- Declaration Fields
- Entry Shape
- Field Value Constraints
- Fields
- Footer Sections
- Generation Authority
- Group Shape
- Header Sections
- Integrity Authority
- Inheritance Overrides
- Instance Target
- Known Category Labels
- List Marker
- Machine Shape Definitions
- Non-Authoritative For Validation
- Optional Fields
- Optional Sections
- Ordering
- Required Entries
- Required Fields
- Required Heading
- Required Shape
- Required When
- Rules
- Severity Levels
- Towards Allowed Shapes
- Validation Authority

Rules

- A contract group begins at a third-level heading.
- A category label is a plain text line from the known category label set.
- A category label applies to the first hyphen list after the label.
- Blank lines between a category label and its list are allowed.
- Machine contract list items use hyphen bullets.
- Envelope list items use hyphen bullets.
- Footer method entries use hyphen bullets.
- Star bullets are not part of the root machine contract shape.
- List item order is not significant unless the category label is `Ordering`.
- `Rules` list items are normative.
- Only third-level headings, category labels, and hyphen list items are part of the machine contract.
- Other prose inside `Schema Validation Contract` is not part of the machine contract.
- Descendant schemas may introduce new category labels only through `Contract Category Extension`.
- `Artifact Creation Contract`, when present, uses the same contract syntax.

### Validator Response Policy

Severity Levels

- error
- warning
- info
- preserve

Rules

- `error` means the artifact does not satisfy the active contract.
- `warning` means the artifact remains readable but is degraded, ambiguous, or not fully portable.
- `info` means the validator may surface non-blocking state without changing validity.
- `preserve` means the validator must retain the signal without claiming to understand or normalize it.
- Validators must not silently downgrade `error` conditions.
- Validators must not silently upgrade `preserve` conditions into `warning` or `error` without contract authority.

### Unknown Handling

Applies To

- contract category labels
- envelope fields
- extension declarations

Rules

- Declared but unsupported contract category labels are `preserve` and may also be `warning`.
- Undeclared contract category labels are `error` when full schema lineage is available.
- Undeclared contract category labels are `warning` when full schema lineage is unavailable.
- Unknown envelope fields are `preserve` by default.
- Unknown envelope fields may become `warning` or `error` only when full schema lineage proves they are undeclared.
- Unknown extension declarations must be preserved unless the active schema contract explicitly forbids them.

### Matching And Normalization

Applies To

- heading text
- category labels
- field names
- line endings
- blank lines between category labels and lists
- bullet markers in machine-authoritative surfaces

Rules

- Heading text is exact after trimming leading and trailing whitespace.
- Category labels are exact after trimming leading and trailing whitespace.
- Field names are exact after trimming leading and trailing whitespace.
- Matching is case-sensitive unless a descendant schema explicitly defines a local exception.
- Blank lines between a category label and its list are ignored.
- Line endings may be normalized before parsing.
- Bullet marker normalization is not allowed in machine-authoritative surfaces.

### Inheritance And Override

Rules

- Descendant schema contracts are additive by default.
- Descendant schemas may add groups, categories, declarations, fields, and stricter local rules.
- Descendant schemas must not weaken root identity, continuity, or integrity requirements.
- Descendant schemas must not remove inherited requirements unless they explicitly define override semantics.
- Override semantics must identify which inherited requirement is being replaced and how the replacement is interpreted.
- Validators must not guess override behavior when a descendant schema does not define it.
- A descendant extension must not silently redeclare an inherited contract category label as if it were new.

### Inheritance Overrides

Entry Shape

- Named Declaration

Required Fields

- Merge Operation
- Parent Schema
- Parent Node
- Child Node

Optional Fields

- Reason
- Effective Result

Field Value Constraints

- Merge Operation
  - Allowed Value: override
  - Domain Policy: closed

Rules

- `Inheritance Overrides` is the canonical schema-local machine category for explicit inherited contract replacement.
- The declaration name identifies one override declaration within the declaring child schema.
- `Merge Operation` must be exactly `override`; unsupported operations are unresolved and must not be guessed.
- `Parent Schema` must resolve to an actual ancestor of the declaring child schema in the active lineage.
- `Parent Node` and `Child Node` each use the exact path shape `Schema Validation Contract / <third-level group> / <category label>` and must resolve exactly once.
- The declaring child schema is the child schema identity; no duplicate `Child Schema` field is part of the inline declaration.
- A qualified override deactivates only the exact addressed parent contribution and activates the exact addressed child replacement contribution while retaining declaration and contributor provenance.
- Competing declarations for the same exact parent contribution, malformed declarations, unresolved lineage, missing or ambiguous nodes, or non-ancestor parents are unresolved/error.
- Source order, filename order, directory adjacency, prose wording, and schema identity must not choose a winner.
- When both addressed nodes are `Required Shape`, parent ordinary instance-field groups whose Root-authorized exact second-level target heading is required by the parent shape but absent from the child replacement shape become inactive; groups targeting surviving headings remain additive.
- If Required Shape heading identity or ordinary target ownership cannot be resolved exactly, the override is unresolved rather than guessed.
- Standalone `tiinex.schema.inheritance.v1` artifacts may document, propose, test, audit, or migrate an inheritance relationship, but they do not silently add or change schema-local compilation authority.

### Contract Cardinality

Applies To

- contract groups
- category labels within a contract group
- named declarations within a contract group
- required groups
- optional groups

Rules

- Contract groups are identified by third-level heading text.
- Contract group names should be unique within the same machine-readable contract section.
- Category labels may appear at most once within the same contract group unless a descendant schema explicitly declares repeat semantics.
- Named declarations must be unique within the same contract group.
- Duplicate named declarations are invalid unless a descendant schema explicitly defines override semantics.
- Missing required groups are `error`.
- Missing optional groups are valid.
- Duplicate handling must not be silently guessed.

### Ordinary Instance Field Targeting

Applies To

- descendant `Schema Validation Contract` groups that declare `Required Fields` and/or `Optional Fields`

Rules

- An ordinary instance-field group declares `Required Fields` and/or `Optional Fields`, does not declare `Entry Shape`, and uses ordinary unqualified field labels.
- Root-owned envelope/footer groups, qualified envelope/path fields such as `Current -> Why`, named-declaration groups, and `Artifact Creation Contract` groups are outside this default.
- Unless an ordinary instance-field group declares `Instance Target`, its Artifact instance target is the exact second-level heading whose text equals the contract group name.
- The same-name correspondence is machine authority defined by Root; validators must not treat it as a heuristic or fall back to document-wide field matching.
- Heading text follows Root exact, case-sensitive matching rules and heading depth is part of target identity.
- `Instance Target` overrides only the default instance target for the declaring group.
- An authorized target must resolve to at most one Artifact heading block. Multiple exact target matches are structural ambiguity and `error`; validators must not choose the first or last match.
- If the authorized target block is absent, fields elsewhere in the document do not satisfy the group.
- Target/block requiredness, field requiredness, and field ownership are separate truths.
- When the authorized target is an optional section and that section is absent, `Required Fields` inside that group do not independently make the optional section required.
- When an optional authorized target is present, its `Required Fields` are required inside that target.
- Ordinary field occurrences are owned only by their authorized target block. Fields inside a nested heading or named-declaration-owned region are not claimed by an ancestor ordinary group merely because the label matches.
- `Required Fields` and `Optional Fields` declare singular ordinary scalar occurrences by default within one instantiated target block.
- Duplicate ordinary scalar occurrences must remain observable and are `error` unless another explicit contract owns repeated structured entries or explicitly defines repeat semantics.
- Validators must retain field occurrence multiplicity long enough to validate it; collapsing ordinary occurrences into a Set before validation is not allowed.
- Inherited and descendant contributions are additive by default, preserve contributing schema/contract provenance, and may share one physical authorized target without requiring duplicate headings.
- A descendant contribution must not silently retarget or replace an inherited requirement without declared override semantics.

### Instance Target

Applies To

- ordinary instance-field contract groups that intentionally target a heading other than Root's same-name default

Required Shape

- one literal Markdown heading token

Rules

- `Instance Target` contains exactly one literal Markdown heading token including heading depth, for example `## Deferral` or `### Nested Block`.
- `Instance Target` is singular; it must not be used as a list of multiple Artifact targets.
- Heading text is interpreted using Root exact, case-sensitive heading matching.
- `Instance Target` changes field-ownership location only; it does not make an otherwise optional target section required.
- Multi-block semantics should be expressed as locally owned contract groups rather than by pointing one ordinary group at multiple blocks.
- Validators must not invent selector syntax, positional identity, AST paths, XPath, JSON pointers, or application-internal IDs when the declared heading authority is sufficient.

### Field Value Constraints

Entry Shape

- Named Declaration

Declaration Fields

- Allowed Value
- Allowed Shape
- Domain Policy

Rules

- A `Field Value Constraints` declaration binds value-domain authority to one exact contract field.
- The declaration name is the exact case-sensitive field label being constrained.
- When the declaring contract group declares that field under `Required Fields` or `Optional Fields`, the constraint targets that local field only, even when that group has an `Applies To` category for another semantic purpose.
- When the declaring contract group does not declare that field, the group may share the constraint through `Applies To` only when every `Applies To` entry resolves unambiguously to a contract group that declares the exact field under `Required Fields` or `Optional Fields`; otherwise target authority is unresolved/error and validators must not choose a partial subset or guess a target.
- This field-domain targeting rule does not reinterpret or broaden Root's generic `Fields` category.
- `Allowed Value` and `Allowed Shape` may repeat inside one declaration; their order is not semantic.
- Exactly one `Domain Policy` is required per declaration.
- `Domain Policy` must be `closed` or `extension-authorized`.
- Every declaration must contain at least one `Allowed Value` or `Allowed Shape`.
- `Allowed Value` compares the extracted scalar value exactly and case-sensitively to the declared literal; validators must not normalize aliases, spelling, punctuation, case, separators, or typos.
- `Allowed Shape` must name a machine-defined shape available under the active contract. This category does not create a new shape registry. An unknown, unavailable, or unresolved shape authority must remain unresolved and validators must not infer a matcher from the shape's English name.
- A value satisfies one constraint contribution when it matches an `Allowed Value` exactly or satisfies one declared `Allowed Shape`.
- Shape qualification and reference-target resolution are separate truths. Satisfying a reference shape does not by itself prove that the reference target resolves or is semantically suitable.
- Under `closed`, a value that satisfies no declared value or shape is invalid for that contribution.
- Under `extension-authorized`, a value that satisfies no declared value or shape is an unresolved extension candidate, not an accepted core value; separate authority must qualify the extension before a validator or runtime may treat it as an accepted extension.
- The literal `unknown` is a Tiinex uncertainty sentinel, not an extension-name escape hatch. If `unknown` is not explicitly declared as an `Allowed Value`, it is invalid for that contribution and must not be reclassified as an extension candidate merely because `Domain Policy` is `extension-authorized`.
- `unknown` has no global validity. It is permitted only when explicitly declared as an `Allowed Value` by every applicable constraint contribution.
- Absence of `Field Value Constraints` for a field is valid and means no closed value domain or shape is inferred for that field from `Allowed Labels`, prose, field name, list position, neighboring fields, or UI/runtime behavior.
- Multiple applicable field-value constraint contributions are additive obligations. A concrete value must satisfy every applicable contribution unless separately defined explicit override authority validly replaces an inherited obligation.
- A descendant may narrow an inherited field domain by adding a stricter compatible contribution.
- A wider descendant contribution does not widen inherited acceptance. This contract introduces no generic field-value-constraint override selector or widening operator; validators must not guess one. Any future replacement/widening authority must separately identify the inherited obligation being replaced.
- Contradictory applicable constraints must be reported as a contract conflict and must not be silently unioned, source-ordered, or resolved by child-wins precedence.
- Compiled field-value authority must retain source schema, contract group, exact target field, whether targeting is local or shared through `Applies To`, declared values and shapes, policy, and inherited contribution provenance.
- Existing `Allowed Labels` semantics remain unchanged. `Allowed Labels` is group-level vocabulary/readability authority and is not field-domain closure.

### Machine Shape Authority

Entry Shape

- Named Declaration

Declaration Fields

- Grammar Profile
- Start Rule
- Grammar Rule
- Human Meaning

Machine Shape Definitions

- Markdown Link
  - Grammar Profile: tiinex.lexical.shape.v1
  - Start Rule: markdown-link
  - Grammar Rule: markdown-link = "[" label "](" target ")"
  - Grammar Rule: label = ANY-EXCEPT("]", TAB, CR, LF)+
  - Grammar Rule: target = ANY-EXCEPT(")", SPACE, TAB, CR, LF)+
  - Human Meaning: Exactly one complete inline Tiinex Markdown link with a non-empty single-line label and non-empty target. ASCII space is allowed in the label; ASCII space, tab, CR, and LF are forbidden in the target.

Rules

- `Machine Shape Definitions` declares exact machine-readable lexical shape authorities available to `Allowed Shape` and to any future contract surface that explicitly delegates to this authority.
- Each first-level entry under `Machine Shape Definitions` is one named machine-shape declaration. The declaration name is the exact case-sensitive shape label.
- Every machine-shape declaration must contain exactly one `Grammar Profile`, exactly one `Start Rule`, one or more `Grammar Rule` fields, and exactly one `Human Meaning`.
- `Grammar Rule` may repeat and its ordering is not semantic. Other single-cardinality declaration fields must not repeat.
- Machine-shape definitions are resolved by lineage prefix at the source point of the shape use: ancestor schema definitions and definitions from the same source schema are visible; definitions introduced only by later descendants are not visible to an ancestor contribution.
- Source order inside one schema is not semantic. A same-schema definition may qualify a same-schema shape use regardless of whether the declaration text appears before or after the use.
- A descendant may add a new distinct shape label. That definition is visible to uses in the descendant source and its later descendants, but not to ancestor or sibling-branch uses that do not inherit it.
- For one exact shape label within the active lineage prefix, zero active definitions means shape authority is unresolved; exactly one valid definition is usable when its grammar profile is supported; more than one active definition is a contract/authority conflict and consumers of that label are unresolved.
- Duplicate exact-label definitions are not deduplicated even when their text is identical. No source-order, descendant-wins, first-definition, or hidden-registry precedence exists.
- This contract introduces no generic inherited machine-shape replacement operator. A future replacement authority may be defined only when it can explicitly identify the inherited definition being replaced.
- Compiled machine-shape authority must preserve the exact shape label, source schema, source contract group, declaration source, lineage/source-point visibility, grammar profile, start rule, grammar rules, human meaning, and qualification-support state.
- A consumer of machine-shape authority must retain the source schema, contract group, exact field/use, requested shape label, resolved definition provenance, and qualification result `match`, `no-match`, or `unresolved`.
- `Human Meaning` is explanatory readability authority only. Machine lexical acceptance is owned by `Grammar Profile`, `Start Rule`, and `Grammar Rule`; validators must not infer a matcher from `Human Meaning`.
- `tiinex.lexical.shape.v1` is the Root-owned generic lexical grammar profile defined by this group. It is interpreter semantics and is not itself resolved through another Machine Shape Definition.
- Under `tiinex.lexical.shape.v1`, grammar-source meta-whitespace is exactly ASCII SPACE U+0020 and TAB U+0009. It may appear before the first grammar token, between grammar tokens where token boundaries permit, and after the last grammar token, and is ignored as grammar-source separation. It must not split an identifier or alter a quoted literal. CR, LF, and every non-ASCII whitespace character are not grammar-source meta-whitespace. Implementations must not derive grammar-source whitespace from a host-language class such as `\s`.
- After ignoring permitted grammar-source meta-whitespace, each `Grammar Rule` has the form `identifier = expression`. Rule identifiers are case-sensitive, begin with an ASCII letter, and continue with ASCII letters, ASCII digits, or hyphen. Rule identifiers must be unique inside one shape declaration. `Start Rule` must name exactly one declared `Grammar Rule` identifier.
- Reserved identifier tokens are exactly `SPACE`, `TAB`, `CR`, `LF`, `DIGIT`, `ASCII-LETTER`, `ANY`, and `ANY-EXCEPT`. Reserved punctuation/operator tokens are exactly `?`, `*`, `+`, `|`, `(`, `)`, `,`, and `=`. A declared Grammar Rule identifier must not use a reserved identifier token.
- The normative expression productions are `grammar-rule = identifier "=" expression`, `expression = concatenation ("|" concatenation)*`, `concatenation = postfix-expression+`, `postfix-expression = atom ("?" | "*" | "+")?`, and `atom = quoted-literal | builtin | rule-reference | any-except | "(" expression ")"`. These productions, rather than host-language parser precedence, define `tiinex.lexical.shape.v1`.
- The productions make postfix `?`, `*`, or `+` highest precedence and permit at most one postfix quantifier per postfix-expression; concatenation/adjacency binds next; alternation `|` binds lowest; parentheses explicitly group an expression. Concatenation is evaluated left-to-right. Alternation is a left-to-right list of alternatives whose acceptance is their union, so alternative ordering does not create precedence.
- Under `tiinex.lexical.shape.v1`, postfix operators define accepted lexical languages rather than regex-engine execution strategy. For an atom or grouped expression `x`, `x?` accepts zero or one consecutive occurrence of a scalar sequence accepted by `x`; `x*` accepts the union of all finite concatenations of zero or more consecutive occurrences accepted by `x`; and `x+` accepts the union of all finite concatenations of one or more consecutive occurrences accepted by `x`.
- Postfix repetition has no greedy, lazy, capture, or backtracking semantics. An implementation may use any evaluation strategy that preserves the same accepted language.
- Repetition remains well-defined when `x` can accept the empty scalar. Such repetition is not a grammar error: its meaning remains the finite-concatenation language above, and implementations must avoid nontermination without inventing a different acceptance rule or enumerating infinitely many equivalent empty derivations.
- Whole-value shape qualification succeeds when at least one finite derivation of the `Start Rule` consumes the complete extracted scalar. No particular derivation is preferred merely because another implementation would call it greedy, lazy, earlier, or later.
- An expression, each side of `|`, and a parenthesized expression must be non-empty. Therefore an empty expression, an empty left or right alternative, empty parentheses, `"x"??`, `"x"*+`, and every other repeated postfix sequence are grammar errors. Parentheses may be used to group an expression before applying one postfix quantifier to that grouped atom.
- A non-reserved identifier used as an expression atom is a same-definition `Grammar Rule` reference. It must resolve to exactly one declared rule identifier in the same machine-shape declaration. Undefined rule references are grammar errors under the known profile. Cross-shape rule references do not exist in `tiinex.lexical.shape.v1`.
- A quoted literal denotes the exact Unicode scalar sequence between double quotes. The only quoted-literal escapes are `\"`, `\\`, `\t`, `\r`, and `\n`; any other escape is grammar error. Grammar-source meta-whitespace inside a quoted literal is literal content, not token separation.
- Builtins are exact and case-sensitive: `SPACE` is U+0020, `TAB` is U+0009, `CR` is U+000D, `LF` is U+000A, `DIGIT` is ASCII `0` through `9`, `ASCII-LETTER` is ASCII `A` through `Z` or `a` through `z`, and `ANY` matches exactly one Unicode scalar value.
- `ANY-EXCEPT(...)` matches exactly one Unicode scalar value not matched by its exclusions. It requires one or more exclusion terms separated by the reserved comma token. Permitted ASCII grammar-source meta-whitespace may appear around commas and exclusion terms. Each exclusion term must be a quoted literal containing exactly one Unicode scalar value or one of `SPACE`, `TAB`, `CR`, or `LF`.
- Supported expression forms are quoted literal, same-definition rule reference, builtin, `ANY-EXCEPT(...)`, parenthesized expression, alternation `|`, adjacency/concatenation, and one optional postfix `?`, `*`, or `+` per postfix-expression. No other operator, builtin, import, capture, backreference, lookaround, implementation-language regex feature, or cross-shape rule reference exists in `tiinex.lexical.shape.v1`.
- Matching consumes the complete extracted scalar. There is no implicit trimming, substring matching, case folding, Unicode normalization, URL decoding, Markdown escape processing, or target/reference resolution.
- For a definition using the known `tiinex.lexical.shape.v1` profile, missing required declaration fields, duplicate single-cardinality declaration fields, zero `Grammar Rule` fields, duplicate grammar-rule identifiers, a missing `Start Rule` target, cyclic rule references, an unknown builtin or operator, malformed expression, invalid quoted escape, invalid `ANY-EXCEPT` exclusions, or another grammar violation is a schema contract `error`; a consumer depending on that invalid definition has unresolved machine-shape authority and must fail closed.
- A structurally valid declaration naming an unknown or unsupported `Grammar Profile` is preserved as declared authority, but qualification support is unavailable and consumers of that definition remain unresolved. Validators must not reinterpret its grammar or infer a matcher from the profile name or `Human Meaning`.
- Shape syntax qualification is distinct from existence, reference resolution, reachability, schema suitability, semantic suitability, truth, or authorization of any referenced target.
- When a consuming contract explicitly offers multiple machine-shape alternatives, any resolved matching alternative is a shape match; if no resolved alternative matches and at least one requested shape authority is unresolved, the shape result is `unresolved`; only when every requested shape authority is resolved/evaluable and none matches is the shape result `no-match`.
- Existing `Allowed Shapes`, `Required Shape`, `Entry Shape`, and `Towards Allowed Shapes` semantics remain unchanged; this category does not reinterpret those historical surfaces as a global registry.
- The `Markdown Link` definition intentionally defines a bounded Tiinex lexical profile, not all CommonMark links. It accepts exactly one complete `[label](target)` scalar with non-empty label and target, permits ASCII space inside the label, forbids raw `]`, TAB, CR, and LF in the label, and forbids raw `)`, SPACE, TAB, CR, and LF in the target.

### Named Declaration

Entry Shape

- First-Level Hyphen List Item

Declaration Fields

- Base Concept
- Interpretation

Rules

- Each named declaration is represented as one first-level hyphen list item.
- The first-level list item text is the declaration name.
- Declaration fields are represented as nested hyphen list items under the declaration entry.
- Declaration names must be unique within the same contract group.
- Duplicate declaration names are invalid unless a descendant schema explicitly defines override semantics.

### Contract Category Extension

Required When

- A descendant schema introduces a contract category label.

Entry Shape

- Named Declaration

Declaration Fields

- Base Concept
- Interpretation

Rules

- Each contract category extension uses the `Named Declaration` shape.
- The declaration name is the new contract category label.
- A descendant schema must not redeclare an already inherited category label here unless it explicitly defines override semantics.
- A descendant schema must declare a new category label in `Contract Category Extension` before using it in its own contract.
- Declared category labels extend the known category label set for that schema and its descendants.
- Validators that do not understand a declared category label should preserve it and may warn.
- Strict validators may fail on undeclared category labels when the full schema lineage is available.

### Contract Category Override

Required When

- A descendant schema replaces the interpretation of an inherited contract category label.

Entry Shape

- Named Declaration

Declaration Fields

- Replacement Interpretation

Rules

- Each contract category override uses the `Named Declaration` shape.
- The declaration name identifies the inherited contract category label being replaced.
- `Replacement Interpretation` describes how the descendant schema now interprets that inherited label.
- A descendant schema must not rely on an override unless it declares it here.
- Validators must not guess contract category overrides that are not declared here.

### Document Layout

Header Sections

- Continuity Context

Footer Sections

- Continuity Integrity

Rules

- `Continuity Context` must appear before the artifact body.
- `Continuity Integrity` must appear after the artifact body and machine-readable contract sections.
- `Continuity Integrity` is a footer section even though it is represented by a markdown heading.
- `Continuity Integrity` should be the final top-level section of the artifact.

### Continuity Context

Required Fields

- Envelope Schema
- Current

Optional Fields

- Parent
- Repairs

Rules

- `Envelope Schema` identifies the envelope-reading schema.
- `Current` identifies the current artifact.
- `Parent` identifies the direct continuity parent when one is declared.
- Parent present means the artifact continues a declared parent.
- Parent absent means the artifact is the root of its local lineage.
- Parent absence does not erase origin or provenance.

### Repairs

Required When

- Repairs exists

Entry Shape

- First-Level Hyphen List Item

Optional Fields

- Target
- Note
- Reason

Rules

- `Repairs` records known repairs, corrections, or trust-impacting changes to the artifact.
- A repair entry should state what was repaired and why.
- A repair entry may refer to lineage, parent, origin, current metadata, body claims, schema references, integrity, or another readable target.
- Structured repair entries should expose `Target`, `Note`, and `Reason` as nested fields.
- Free-text repair entries are allowed and must be preserved, but structured entries are preferred for tooling.
- `Repairs` must not silently replace `Parent`, `Trace`, `Origin`, `Current`, or `Continuity Integrity` semantics.
- `Repairs` does not automatically invalidate the artifact or lineage.
- Validators may warn when a repair entry is too vague to support audit or update tooling.
- Tools that update descendants because of a repair should preserve the repair note or point to the artifact that contains it.

### Parent

Required When

- Parent exists

Required Fields

- Parent Schema
- Trace
- Origin

Optional Fields

- Created At

Rules

- `Trace` defines the direct continuity relation.
- `Parent` describes ancestry only.
- `Parent` must not point to child artifacts.
- `Parent` must not point to planned descendants.

### Parent Origin

Required When

- Parent exists

Allowed Labels

- relative
- absolute
- browse + git

Entry Shape

- Markdown Link

Ordering

- relative
- absolute
- browse + git

Rules

- `Origin` supports recovery and must remain truthful to the Parent representation actually available or qualified for recovery.
- `Origin` must not replace `Trace`.
- Every Parent must expose at least one truthful recovery locator.
- When the Parent representation is directly recoverable in the same qualified materialization and source scope as the child, `relative` must identify that directly recoverable representation.
- A local copy or recovery representation must not be manufactured solely to satisfy a `relative` requirement when the Parent is not naturally present in that materialization and source scope.
- When no truthful directly recoverable `relative` Parent representation is available, `Origin` must include a qualified version-stable recovery locator through a supported adapter.
- `browse + git` is one version-stable recovery form only when it identifies the exact published Parent representation through an immutable Git revision; a mutable branch or latest-style URL is not equivalent to version-stable recovery.
- A directly recoverable local or unpublished Parent does not require a `browse + git` entry merely to satisfy continuity.
- When both a truthful local recovery route and a qualified immutable published route exist, both may be declared; Root does not require publication saturation for ordinary artifacts.
- `browse + git` must not be invented, guessed, or synthesized when no qualified published Git representation is available.
- Package or transport closure may provide additional recovery for material omitted by transport scope, but it must not rewrite semantic Parent identity or forge source publication provenance.
- Package or transport closure is separate from the Parent artifact's own `Origin` contract. It may preserve or augment recovery for an already-truthful Parent edge, but it does not make a Parent valid when the artifact envelope itself exposes no truthful recovery locator for the source or qualified representation it declares.
- If bounded transport would leave every declared or otherwise qualified Parent recovery route unusable to the recipient, transport tooling must preserve an exact recovery mapping or representation, rely on an already-qualified version-stable route, expand transport scope, or fail closed; it must not silently ship an unrecoverable Parent edge.
- Every origin candidate should identify the same parent artifact.
- Origin candidates must not mix alternate parents.
- `absolute` paths are supplemental local recovery hints. They are not portable authority and do not replace a required truthful `relative` route or a required version-stable external recovery route.
- Additional origin labels may be introduced by descendant schemas as envelope extensions, including other adapters that can prove version-stable recovery.

### Current

Required Fields

- Current Schema
- Created At

Optional Fields

- Summary
- Status
- Why

Rules

- `Current Schema` identifies the schema governing the current artifact.
- `Created At` records artifact creation time.
- `Summary` is a compact fallback description.
- `Status` records the artifact's current declared state under its active schema semantics.
- `Status` is optional and root does not define a universal closed status vocabulary.
- Descendant schemas may constrain `Status` when their domain requires it.
- `Status` does not by itself prove validity, completeness, publication state, truth, execution success, approval, or readiness.
- `Why` explains why the artifact exists.
- `Why` is optional and does not by itself declare governing authority, evidence, validation, transition history, or revision rationale.

### Schema Reference Fields

Fields

- Envelope Schema
- Parent Schema
- Current Schema

Allowed Shapes

- Markdown Link
- Plain Schema Id

Rules

- Schema semantic identity and schema representation location are separate truths.
- In Markdown Link form, the link label is the semantic schema identifier/key and the link target is a representation locator or traversal route.
- Tools must preserve the declared schema identifier separately from locator-resolution state and must not derive schema identity from a path, filename, host, repository, branch name, or other locator shape.
- A locator that resolves successfully does not by itself prove that the resolved bytes are the exact intended schema representation; exact-representation qualification depends on the locator's own stability/identity semantics and any applicable integrity or source authority.
- Markdown Link is preferred when a truthful useful schema representation locator is available.
- For a published artifact that references a different already-published canonical schema representation, an immutable canonical locator must be used when one is available.
- `commit-pinned browse + git` is one current example of an immutable canonical locator; GitHub and commit hashes are not the semantic definition of immutable schema location.
- A mutable branch/latest locator may be useful for discovery or current-material traversal, but it must not be treated as equivalent to an immutable exact-representation locator.
- A relative self-link is valid for a schema's self-reference when it continues to resolve to that same representation as the file moves together with itself.
- Relative or local locators are valid for local/unpublished schema material when they are the truthful available route; authors and tools must not fabricate a published immutable locator that does not yet exist.
- A relative locator to another schema may remain useful inside one copied workspace or package, but publication tooling must use a stronger immutable canonical locator for a different already-published schema when that stronger route is available.
- Plain Schema Id is allowed when no useful locator is available or when local context already resolves the schema id.
- Plain Schema Id preserves schema-identifier truth only; consumers must not infer one exact schema representation from the identifier alone when exact representation material matters.
- When a Markdown Link target is resolved, a mismatch between the declared link-label schema identifier and the resolved schema representation's declared semantic identity must remain a contradiction/unresolved reference rather than being repaired from filename, path, or locator text.

### Trace Field

Allowed Shapes

- Markdown Link
- Relative Path

Rules

- Markdown Link is preferred when a target is available.
- Relative Path is allowed when the parent trace is local and directly recoverable.

### Created At

Required Shape

- YYYY-MM-DD hh:mm:ss

Rules

- UTC is implied.
- Time precision is seconds.
- Timezone suffixes are not part of the root timestamp shape.
- Local zone names are not part of the root timestamp shape.
- Numeric offsets are not part of the root timestamp shape.
- Milliseconds are not part of the root timestamp shape.

### Envelope Extension

Required When

- A descendant schema adds envelope fields.

Entry Shape

- Named Declaration

Declaration Fields

- Target Block
- Base Concept
- Interpretation

Allowed Target Blocks

- Continuity Context
- Parent
- Parent Origin
- Current
- Continuity Integrity
- Repairs

Rules

- Each envelope extension uses the `Named Declaration` shape.
- The declaration name is the added envelope field name.
- Declaration fields are represented as nested hyphen list items under the declaration entry.
- Descendant schemas may add machine-readable envelope fields.
- Added envelope fields must declare which envelope block they extend.
- Root validators should preserve unknown envelope fields even when they cannot validate them.
- Strict validators may warn or fail on undeclared envelope fields when the full schema lineage is available.

### Continuity Integrity Footer

Required Heading

- Continuity Integrity

Required Entries

- Method Entry

Rules

- `Continuity Integrity` is a footer surface.
- `Continuity Integrity` verifies relation or artifact integrity according to the named method.
- The footer should be the final top-level section of the artifact.

### Method Entry

Entry Shape

- First-Level Hyphen List Item

Allowed Shapes

- Plain Method Identifier
- Markdown Link Method Label

Required Fields

- Towards
- Value

Towards Allowed Shapes

- Markdown Link
- self

Rules

- `Method Entry` is represented by a first-level hyphen list item under `Continuity Integrity`.
- The `Method Entry` label names the integrity method.
- The `Method Entry` label may be a plain canonical method identifier or a markdown link to a validation method artifact.
- A markdown-link method label must use the canonical method identifier as link text.
- When a maintained validation method artifact has an available commit-pinned `browse + git` permalink, the markdown-link method label must use that permalink as its link target.
- `Towards` identifies the validated target.
- `Value` carries the method output.
- An integrity value identifies or verifies the representation or declared continuity target covered by the named method.
- For content-derived self methods, changing covered content normally changes the integrity value.
- An integrity value does not by itself prove immutable logical artifact identity across revisions or materializations.
- Equal or different integrity values must not by themselves be treated as proof of equal or different logical artifact subjects unless another declared identity contract provides that authority.
- For hash-based continuity methods, the validated target is hashed without the `# Continuity Integrity` section and everything after it.
- When `Towards` is not `self`, `Value` must be computed from the validated target identified by `Towards`, not from the current artifact body.
- `self` is allowed only when the method validates the current artifact itself.
- When a maintained schema artifact has an available commit-pinned `browse + git` permalink for its validated target, `Towards` should use that permalink instead of a relative local path.

### Extension

Required When

- A descendant schema introduces an extension.

Entry Shape

- Named Declaration

Declaration Fields

- Base Concept
- Interpretation

Rules

- Each extension uses the `Named Declaration` shape.
- The declaration name is the extension name.
- Declaration fields are represented as nested hyphen list items under the declaration entry.
- Root defines how extensions are introduced.
- Root does not define all future extensions.

### Optional Machine Sections

Optional Sections

- Artifact Creation Contract

Rules

- `Artifact Creation Contract` is present only when the schema supports direct artifact generation.
- `Artifact Creation Contract` uses the same contract syntax as `Schema Validation Contract`.
- Absence of `Artifact Creation Contract` means artifact generation is not declared by this schema.

---

# Continuity Integrity

- sha256-base64url-c14n-v2
  - Towards: self
  - Value: i4ajpsCBpiv6VAseG7dNjrSxIXGegW0QwA2vabx0E28
