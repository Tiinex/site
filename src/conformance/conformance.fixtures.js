export const CONFORMANCE_FIXTURE_SCHEMA_ID = 'tiinex.conformance.fixtureSet.v1';

export const conformanceFixtures = Object.freeze({
  schema: CONFORMANCE_FIXTURE_SCHEMA_ID,
  id: 'core-loaded-workspace-v1',
  description: 'Small normative fixture set for loaded-only Tiinex artifact/source/lineage/audit/transition conformance.',
  records: Object.freeze([
    fixtureRecord({
      id: 'topic-parent',
      path: 'topics/parent.md',
      title: 'Parent Topic',
      markdown: artifactMarkdown({
        title: 'Parent Topic',
        currentSchema: 'tiinex.topic.v1',
        createdAt: '2026-07-21T00:00:00.000Z',
        summary: 'Loaded parent topic used by conformance fixtures.',
        body: '## Notes\n\nThe loaded parent is intentionally a local/session artifact.'
      })
    }),
    fixtureRecord({
      id: 'topic-child-trace',
      path: 'topics/child-trace.md',
      title: 'Child Topic via Trace',
      markdown: artifactMarkdown({
        title: 'Child Topic via Trace',
        currentSchema: 'tiinex.topic.v1',
        createdAt: '2026-07-21T00:10:00.000Z',
        summary: 'Child topic with an explicit Parent Trace and Origin.',
        parentSchema: 'tiinex.topic.v1',
        parentCreatedAt: '2026-07-21T00:00:00.000Z',
        trace: 'record:topic-parent',
        origin: 'topics/parent.md',
        boundary: 'browser-local session material; no GitHub provenance inferred',
        body: '## Continuation\n\nThis fixture must resolve its parent through Trace.'
      })
    }),
    fixtureRecord({
      id: 'evidence-origin-only',
      path: 'evidence/origin-only.md',
      title: 'Evidence via Origin',
      markdown: artifactMarkdown({
        title: 'Evidence via Origin',
        currentSchema: 'tiinex.evidence.v1',
        createdAt: '2026-07-21T00:20:00.000Z',
        summary: 'Evidence fixture with Origin but no Trace.',
        parentSchema: 'tiinex.topic.v1',
        parentCreatedAt: '2026-07-21T00:00:00.000Z',
        origin: 'https://github.com/Tiinex/docs/blob/abc123/topics/parent.md',
        boundary: 'browser-local session material; no GitHub provenance inferred',
        body: '## Evidence\n\nOrigin may provide recovery context, but does not replace Trace authority.'
      })
    }),
    fixtureRecord({
      id: 'missing-parent',
      path: 'topics/missing-parent.md',
      title: 'Missing Parent Topic',
      markdown: artifactMarkdown({
        title: 'Missing Parent Topic',
        currentSchema: 'tiinex.topic.v1',
        createdAt: '2026-07-21T00:30:00.000Z',
        summary: 'Child fixture whose declared parent is not loaded.',
        parentSchema: 'tiinex.topic.v1',
        parentCreatedAt: '2026-07-20T00:00:00.000Z',
        trace: 'record:not-loaded',
        origin: 'topics/not-loaded.md',
        boundary: 'browser-local session material; no GitHub provenance inferred',
        body: '## Gap\n\nThis fixture must report a missing parent instead of guessing.'
      })
    }),
    fixtureRecord({
      id: 'unknown-schema',
      path: 'unknown/custom.md',
      title: 'Unknown Schema Artifact',
      markdown: artifactMarkdown({
        title: 'Unknown Schema Artifact',
        currentSchema: 'tiinex.experimental.custom.v1',
        envelopeSchemaTarget: 'https://github.com/Tiinex/docs/blob/053d46ce082d4ec261b82abc44ecca403d61e240/.topics/.schemas/tiinex.root.v1.schema.md',
        createdAt: '2026-07-21T00:40:00.000Z',
        summary: 'Unknown child schema that must remain Root-readable.',
        body: '## Custom payload\n\nUnknown schema-specific fields are preserved, not interpreted.'
      })
    }),
    fixtureRecord({
      id: 'invalid-markdown',
      path: 'invalid/no-envelope.md',
      title: 'Invalid Missing Envelope',
      markdown: '# Continuity Context\n\n---\n\n# Invalid Missing Envelope\n\nThis record intentionally lacks required Root envelope fields and Integrity.'
    })
  ]),
  assets: Object.freeze([
    Object.freeze({
      id: 'asset:core-loaded-workspace-v1:evidence/image.png',
      path: 'evidence/image.png',
      name: 'image.png',
      type: 'image/png',
      size: 128,
      previewState: 'metadata-only',
      sourceMode: 'local-asset',
      source: Object.freeze({ adapterId: 'local', kind: 'local-session', boundary: 'Browser-local asset; no GitHub provenance inferred.' })
    })
  ]),
  workspaceCandidates: Object.freeze([
    Object.freeze({
      id: 'workspace-candidate:fixtures/core.workspace.md',
      path: 'fixtures/core.workspace.md',
      title: 'Conformance Fixture Workspace',
      markdown: '# Conformance Fixture Workspace\n',
      sourceMode: 'local-workspace-candidate',
      source: Object.freeze({ adapterId: 'local', kind: 'local-session', boundary: 'Browser-local workspace candidate; no GitHub provenance inferred.' })
    })
  ])
});

function fixtureRecord(input) {
  return Object.freeze(Object.assign({ sourceMode: 'local-fixture' }, input));
}

function artifactMarkdown(input = {}) {
  const parentLines = input.parentSchema || input.trace || input.origin ? [
    '- Parent',
    input.parentSchema ? `  - Parent Schema: [${input.parentSchema}](${input.parentSchema}.schema.md)` : '',
    input.parentCreatedAt ? `  - Created At: ${input.parentCreatedAt}` : '',
    input.trace ? `  - Trace: ${input.trace}` : '',
    input.origin ? `  - Origin: ${input.origin}` : '',
    input.boundary ? `  - Boundary: ${input.boundary}` : ''
  ].filter(Boolean) : [];
  return [
    '# Continuity Context',
    '',
    `- Envelope Schema: [tiinex.root.v1](${input.envelopeSchemaTarget || 'tiinex.root.v1.schema.md'})`,
    ...parentLines,
    '- Current',
    `  - Current Schema: [${input.currentSchema || 'tiinex.topic.v1'}](${input.currentSchema || 'tiinex.topic.v1'}.schema.md)`,
    `  - Created At: ${input.createdAt || '2026-07-21T00:00:00.000Z'}`,
    `  - Summary: ${input.summary || ''}`,
    '  - Status: fixture/local',
    '  - Why: Conformance fixture for loaded-only Tiinex runtime behavior.',
    '',
    '---',
    '',
    `# ${input.title || 'Fixture Artifact'}`,
    '',
    input.body || '## Body\n\nFixture body.',
    '',
    '# Continuity Integrity',
    '',
    '- Fixture Integrity',
    '  - Method: fixture-static',
    '  - Value: fixture'
  ].join('\n');
}
