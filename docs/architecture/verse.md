# Verse

A Verse is a bounded way to express, arrange, or experience one or more Tiinex artifacts without changing their source truth.

This is a provisional Tiinex Site architecture concept, not yet a maintained Tiinex/docs schema. It exists so the fresh app can grow around a human-first word before the implementation accidentally turns the idea into a developer-only projection primitive.

## Human-first definition

A Verse helps a reader experience the same material through a specific arrangement.

Examples:

- Feed Verse: artifacts arranged for fast scanning.
- Tree Verse: artifacts arranged by declared parent/child continuity.
- Node Graph Verse: artifacts arranged as nodes and edges.
- Timeline Verse: artifacts arranged over time.
- Gantt Verse: artifacts arranged by duration, dependency, or work span when such semantics exist.
- Handover Verse: artifacts arranged for a person or LLM that needs to continue the work.

## What a Verse may do

A Verse may:

- arrange artifacts
- group artifacts
- select or filter artifacts
- compress or expand disclosure
- choose an order
- choose a projection such as card, tree, graph, timeline, or print
- point to an expansion path such as detail, lineage, source, or audit

## What a Verse must not do

A Verse must not silently claim:

- source truth
- validation success
- evidence status
- preservation
- completeness
- parent absence
- authorship
- consent
- authority

A Verse may reveal or summarize these signals when they are already owned by another artifact, source boundary, validator, audit report, or schema module. It does not create those claims by displaying them.

## Verse versus surface

Surface and Verse are related but different.

- A surface is a bounded place or interaction surface where meaning may be shown, asked, selected, edited, or audited.
- A Verse is the meaningful reading or arrangement form that organizes material for a reader.

For example, an Artifact Card Surface can appear inside a Feed Verse, Tree Verse, Search Verse, or Handover Verse. The surface is the reusable display boundary. The Verse is the reader-facing arrangement.

## Minimal contract

A Verse should be explainable with these fields:

- Name
- Purpose
- Material included
- Arrangement rule
- Reader benefit
- What is hidden or deferred
- What it must not be used to claim
- Expansion path

## Current implementation boundary

In v86, Feed and Tree are the first active Verses.

They use the same workspace artifact records and parsed view models. Switching between Feed and Tree changes the arrangement only. It must not alter parsed artifact truth, validation state, source boundary, or root fallback disclosure.
