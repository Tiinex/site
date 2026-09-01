import { TIINEX_SITE_CHECKPOINT } from '../build.identity.js';

export const KNOWN_SCENARIO_MATRIX_SCHEMA = 'tiinex.acceptance.known-scenarios.v1';

export const KnownScenarioStatus = Object.freeze({
  automated: 'automated',
  manualRequired: 'manual-required',
  blockedInSandbox: 'blocked-in-sandbox'
});

export const knownScenarioMatrix = Object.freeze({
  schema: KNOWN_SCENARIO_MATRIX_SCHEMA,
  checkpoint: TIINEX_SITE_CHECKPOINT,
  purpose: 'Acceptance hardening matrix for the PoC-critical refactor recovery loops before Q spends manual browser passes.',
  scenarios: Object.freeze([
    scenario({
      id: 'local-tree-import-open-merge-export-reimport',
      status: KnownScenarioStatus.automated,
      priority: 'critical',
      contract: 'Local tree imports must retain local/session boundaries, workspace Open/Merge candidates, ordinary tree export entries, and reimport parity without guessed GitHub provenance.',
      automatedChecks: ['node tools/run-foundation-suite.mjs --suite smoke'],
      manualChecks: ['drag/drop real gaming tree zip', 'Open candidate', 'Merge candidate', 'export tree and reimport'],
      failureMode: 'Imported material is not dropped or source-guessed; any hidden/grouped material must be visible in ledger counts.'
    }),
    scenario({
      id: 'github-source-over-import-continuity',
      status: KnownScenarioStatus.automated,
      priority: 'critical',
      contract: 'Loading GitHub issue/source material over imported local material must make source paths canonical while retaining local continuity for source close/refresh recovery.',
      automatedChecks: ['node tools/run-foundation-suite.mjs --suite smoke'],
      manualChecks: ['import tree first', 'add Tiinusen/socials issue source', 'close source and confirm local continuity returns'],
      failureMode: 'No silent 5/6 -> 3 collapse; ledger must explain raw/source/visible/hidden/candidate counts.'
    }),
    scenario({
      id: 'source-boundary-lineage-recovery',
      status: KnownScenarioStatus.automated,
      priority: 'critical',
      contract: 'Loaded local/imported artifacts may recover missing parents from explicit Parent/Origin boundaries without converting the declaring artifact to source-backed material.',
      automatedChecks: ['node tools/run-foundation-suite.mjs --suite smoke'],
      manualChecks: ['Load full lineage on imported continuation with explicit Origin'],
      failureMode: 'Missing parents become explicit findings or recovery-only source material; no GitHub guessing from local paths.'
    }),

    scenario({
      id: 'schema-reading-contract-navigation',
      status: KnownScenarioStatus.automated,
      priority: 'supporting',
      contract: 'Clicking a schema/type badge opens or loads the reading-contract schema lineage without applying a hidden display filter or converting local/imported material to source-backed material.',
      automatedChecks: ['node tools/run-foundation-suite.mjs --suite integration'],
      manualChecks: ['click topic/schema badge on imported/source artifact and confirm lineage focuses the schema record'],
      failureMode: 'Schema badge must not behave as a plain schemaFilter toggle; it must explain unavailable schemas explicitly.'
    }),
    scenario({
      id: 'browser-public-release-gate',
      status: KnownScenarioStatus.blockedInSandbox,
      priority: 'release',
      contract: 'Public bundle and browser UX remain final release gates; sandbox without Vite/node_modules cannot claim this pass.',
      automatedChecks: ['npm run build:public', 'npm run public:check', 'node --check .site-publish/tiinex.bundle.js'],
      manualChecks: ['run public build locally', 'browser scenario pass over the known matrix'],
      failureMode: 'Do not claim public/browser PASS from unit contracts alone.'
    })
  ])
});

export function summarizeKnownScenarioMatrix(matrix = knownScenarioMatrix) {
  const counts = {};
  for (const item of Array.isArray(matrix.scenarios) ? matrix.scenarios : []) {
    counts[item.status] = Number(counts[item.status] || 0) + 1;
  }
  return Object.freeze({
    schema: `${KNOWN_SCENARIO_MATRIX_SCHEMA}.summary`,
    checkpoint: matrix.checkpoint || '',
    total: Array.isArray(matrix.scenarios) ? matrix.scenarios.length : 0,
    counts: Object.freeze(counts),
    manualRequired: (matrix.scenarios || []).filter((item) => item.status !== KnownScenarioStatus.automated).map((item) => item.id)
  });
}

function scenario(input = {}) {
  return Object.freeze({
    id: String(input.id || ''),
    status: input.status || KnownScenarioStatus.manualRequired,
    priority: input.priority || 'normal',
    contract: String(input.contract || ''),
    automatedChecks: Object.freeze(Array.isArray(input.automatedChecks) ? input.automatedChecks.slice() : []),
    manualChecks: Object.freeze(Array.isArray(input.manualChecks) ? input.manualChecks.slice() : []),
    failureMode: String(input.failureMode || '')
  });
}
