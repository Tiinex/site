import { inferRecordMaterialRole, isDiscoveryWorkLeafEligible, MaterialRole } from '../../../workspaces/workspace.materialRole.js';
import { normalizePortableInput } from '../input/portable.input.js';
import { projectReductionComposition } from './reduction.composition.js';
import { projectReductionDestructiveEligibility } from './reduction.eligibility.js';
import { PORTABLE_REDUCTION_PREFLIGHT_SCHEMA_ID } from './reduction.shared.js';

const FIXTURE_RE = /(^|\/)(?:fixtures?|test-fixtures?|__fixtures__)(\/|$)|\.fixture\./i;

export { PORTABLE_REDUCTION_PREFLIGHT_SCHEMA_ID } from './reduction.shared.js';

export function preflightPortableReduction(input = {}, options = {}) {
  const material = normalizePortableInput(input.materials || input);
  const composition = projectReductionComposition(input, material, options);
  const eligibility = projectReductionDestructiveEligibility(input, material, composition, options);
  const inventory = buildInventory(material.records || []);
  const findings = Object.freeze([...(material.findings || []), ...(composition.findings || []), ...(eligibility.findings || [])]);
  const requested = eligibility.state !== 'not-requested';
  const status = eligibility.state === 'eligible' ? 'preflight-qualified'
    : requested ? 'blocked'
      : ['qualified', 'qualified-with-known-loss'].includes(composition.state) ? 'projection-qualified' : 'unresolved';
  const summary = Object.freeze({
    records: material.records?.length || 0,
    semanticRecords: inventory.counts.semantic,
    explicitCandidates: eligibility.candidateSet.length,
    disappearingSemantic: eligibility.disappearingSemanticSet.length,
    leafEntrypoints: eligibility.leafEntrypoints.length,
    compositionNodes: composition.nodes.length,
    compositionHops: composition.hops.length,
    eligibilityState: eligibility.state
  });
  return Object.freeze({
    schema: PORTABLE_REDUCTION_PREFLIGHT_SCHEMA_ID,
    status,
    destructiveEligible: eligibility.destructiveEligible,
    composition,
    eligibility,
    inventory,
    reduction: Object.freeze({ ...eligibility.reduction, entries: Object.freeze(eligibility.leafEntrypoints.map((item) => Object.freeze({ leafPath: item.leaf.path, collapseToPath: item.historicalClosureEndpoint, disposition: item.disposition, reason: item.reason }))) }),
    candidates: eligibility.candidateSet,
    summary,
    findings,
    boundary: Object.freeze({
      adapterNeutral: true,
      sharedConsumers: Object.freeze(['Viewer', 'CLI', 'LLM', 'VS Code']),
      planningOnly: true,
      sourceMutation: false,
      remoteWrite: false,
      destructiveApplyImplemented: false,
      destructiveApplyAuthorized: false,
      ordinaryReductionAuthoritySeparate: true,
      lifecycleLexicalStatusIsDestructivePolicy: false,
      placementParentEqualsHistoricalClosureEndpoint: false,
      canonicalReductionSchemaAuthorityChanged: false,
      destructiveEligibilityMeaning: 'eligible is exact fail-closed qualification evidence only; a separate future apply capability must enforce current state, authorization, approvals, and mutation gates'
    })
  });
}

function buildInventory(records = []) {
  const items = records.map((record) => {
    const role = inferRecordMaterialRole(record);
    const fixture = record.fixture === true || record.requiredFixture === true || FIXTURE_RE.test(String(record.path || '').replace(/\\/g, '/'));
    const semantic = isDiscoveryWorkLeafEligible(record);
    return Object.freeze({
      id: String(record.id || ''), path: String(record.path || ''), schemaId: String(record.schemaId || ''),
      materialRole: role, semantic, fixture,
      observedLifecycleStatus: String(record.lifecycleStatus || record.currentStatus || record.status || ''),
      destructiveCurrentnessAuthority: 'none-without-qualified-normalized-currentness-input'
    });
  });
  return Object.freeze({
    items: Object.freeze(items),
    counts: Object.freeze({
      total: items.length,
      semantic: items.filter((item) => item.semantic).length,
      fixture: items.filter((item) => item.fixture).length,
      leafRole: items.filter((item) => item.materialRole === MaterialRole.leaf).length,
      schemaDefinition: items.filter((item) => item.materialRole === MaterialRole.schemaDefinition).length,
      supporting: items.filter((item) => item.materialRole === MaterialRole.supporting).length,
      workspaceArtifact: items.filter((item) => item.materialRole === MaterialRole.workspaceArtifact).length,
      unknown: items.filter((item) => item.materialRole === MaterialRole.unknown).length
    }),
    boundary: 'Inventory is classification evidence only. Lexical lifecycle/status observations are not destructive currentness authority.'
  });
}
