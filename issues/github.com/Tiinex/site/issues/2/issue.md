# News

> Tiinex start continuation trace md · Tiinex
> [Open in Tiinex](https://tiinex.dev/#github.issue%7Chttps%3A%2F%2Fgithub.com%2FTiinex%2Fsite%2Fissues%2F1)

## Content

Monolith PoC is live and is currently being refactored into a more scaleable React webapp

## Design Direction

News regarding progress on refactor work
News regarding progress on LLM tooling and handover
News regarding vision and roadmap
News regarding financing of project

## Next Artifacts

- Topic
- Evidence
- Feedback
## Transition Boundary

- Transition Schema: [tiinex.artifact.transition.v1](https://github.com/Tiinex/docs/blob/master/.topics/.schemas/transition/artifact/tiinex.artifact.transition.v1.schema.md)
- Transition Kind: continue
- Transition Label: Continue
- Transition Role: lineage / creation transition
- Source Artifact: [Start](https://github.com/Tiinex/site/issues/1)
- Result Schema: tiinex.topic.v1
- Mutation Policy: source artifact unchanged
- Durable Identity: assigned by Continuity Integrity fingerprint after checksum/finalization, not by a sequential transition id
- Provisional Handle: continue-start
- Interpretation Limit: does not prove the parent is true, approved, replaced, or semantically complete

---

<details>
<summary>Tiinex source payload</summary>

<!-- tiinex-artifact-start: presentation above is for GitHub readers; Tiinex importers recover the artifact from the Source Markdown below. -->

## Tiinex Boundary

- Transition: continue → GitHub issue comment continuation
- Publication Intent: create-continuation-comment
- Publication Target Kind: github.issue.comment
- Publication Operation: create
- Publication Container Kind: github.issue.thread
- Source: News
- Tiinex Parent Artifact Path: issue-root-recovered-start.workspace.md
- Parent Binding Meaning: use the Tiinex parent artifact above as continuation parent; the GitHub issue is only the publication container.
- Target: https://github.com/Tiinex/site/issues/1
- Adapter: github-outbound-web-routine
- Status: draft only until published on GitHub; loaded workspace and source artifact remain unchanged.

## Source Markdown

```md
# Continuity Context

- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/master/.topics/.schemas/tiinex.root.v1.schema.md)
- Parent
  - Parent Schema: [tiinex.workspace.v1](https://github.com/Tiinex/docs/blob/master/.topics/.schemas/tiinex.workspace.v1.schema.md)
  - Created At: 2026-07-18 00:50:48
  - Trace: [issue-root-recovered-start.workspace.md](issue-root-recovered-start.workspace.md)
  - Origin:
    - relative: issue-root-recovered-start.workspace.md
    - [github issue](https://github.com/Tiinex/site/issues/1)
- Current
  - Current Schema: [tiinex.topic.v1](https://github.com/Tiinex/docs/blob/master/.topics/.schemas/core/topic/tiinex.topic.v1.schema.md)
  - Created At: 2026-07-20 23:44:56
  - Summary: Contains the recent news regarding Tiinex

---

# News

Monolith PoC is live and is currently being refactored into a more scaleable React webapp

## Design Direction

News regarding progress on refactor work
News regarding progress on LLM tooling and handover
News regarding vision and roadmap
News regarding financing of project

## Next Artifacts

- Topic
- Evidence
- Feedback
## Transition Boundary

- Transition Schema: [tiinex.artifact.transition.v1](https://github.com/Tiinex/docs/blob/master/.topics/.schemas/transition/artifact/tiinex.artifact.transition.v1.schema.md)
- Transition Kind: continue
- Transition Label: Continue
- Transition Role: lineage / creation transition
- Source Artifact: [Start](https://github.com/Tiinex/site/issues/1)
- Result Schema: tiinex.topic.v1
- Mutation Policy: source artifact unchanged
- Durable Identity: assigned by Continuity Integrity fingerprint after checksum/finalization, not by a sequential transition id
- Provisional Handle: continue-start
- Interpretation Limit: does not prove the parent is true, approved, replaced, or semantically complete


---

# Continuity Integrity

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3466e50d739a9ba65319297cef79c6b09844b1d7/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: [issue-root-recovered-start.workspace.md](issue-root-recovered-start.workspace.md)
  - Value: RteXROLN7xoQX5JWxEwCRZe-akXJCi_cKG9IHzn2uuQ

- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3466e50d739a9ba65319297cef79c6b09844b1d7/.topics/.validators/sha256-base64url-c14n-v2.validator.md)
  - Towards: self
  - Value: 1VzYUZqBrkCrdwW-89g76BEwwgzrY9b-BJRvVTQDTUk

```

## Publication Notes

- Review this draft before publishing on GitHub.
- Publishing on GitHub creates or mutates GitHub material, not the original Tiinex artifact.
- The link above opens the public Tiinex viewer through a readable hash target when a public source or known GitHub target exists.
- Paste the resulting GitHub URL back into Tiinex and verify before continuing to the next artifact.
- Target: https://github.com/Tiinex/site/issues/1

</details>
