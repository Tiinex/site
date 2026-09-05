import { markPortableBootstrapCanonicalSource } from '../../providers/schema.bootstrap.provenance.js';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { loadNodePortableInput } from '../../input/node.input.js';
import { prepareHandoffManufactureCliCommand } from './cli.handoff-manufacture.js';
import { groundInput } from './cli.ground-recovery.js';
import { prepareQualifyColdStartCommandInput } from './cli.cold-start-input.js';

export async function commandInput(parsed, runtime = {}) {
  const flags = parsed.flags;
  if (parsed.command === 'resolve-capabilities') return {
    input: {
      schemaId: flags.schema || parsed.positionals[0] || '',
      capability: flags.capability || parsed.positionals[1] || '',
      checksum: flags.checksum || ''
    },
    options: {}
  };
  if (parsed.command === 'inspect-creation-contract') return {
    input: { schemaId: flags.schema || parsed.positionals[0] || '', transitionType: flags.transition || 'create-artifact' },
    options: {}
  };
  if (parsed.command === 'restore-session') {
    const file = parsed.positionals[0] || flags.input;
    if (!file) throw new Error('portable.cli.session-file.required');
    return { input: JSON.parse(await readFile(file, 'utf8')), options: {} };
  }
  if (parsed.command === 'create-checkpoint') {
    const file = flags.session || parsed.positionals[0] || flags.input;
    if (!file) throw new Error('portable.cli.session-file.required');
    return {
      input: { session: JSON.parse(await readFile(file, 'utf8')), createdAt: flags['created-at'] || '' },
      options: {}
    };
  }
  if (parsed.command === 'restore-checkpoint') {
    const file = parsed.positionals[0] || flags.input;
    if (!file) throw new Error('portable.cli.checkpoint-file.required');
    return { input: JSON.parse(await readFile(file, 'utf8')), options: {} };
  }
  if (parsed.command === 'inspect-runtime-package') {
    const file = flags.bundle || parsed.positionals[0] || flags.input;
    if (!file) throw new Error('portable.cli.package-bundle.required');
    const value = JSON.parse(await readFile(file, 'utf8'));
    return { input: value.bundle || value, options: {} };
  }
  if (parsed.command === 'roundtrip-runtime-package' && (flags.bundle || (parsed.positionals[0] || '').toLowerCase().endsWith('.json'))) {
    const file = flags.bundle || parsed.positionals[0];
    const value = JSON.parse(await readFile(file, 'utf8'));
    return { input: { bundle: value.bundle || value }, options: {} };
  }
  if (parsed.command === 'process-live-turn' || parsed.command === 'read-live-lineage' || parsed.command === 'export-live-lineage') {
    const stateValue = await readOptionalJson(flags.state || parsed.positionals[0]);
    const updateValue = parsed.command === 'process-live-turn' ? await readOptionalJson(flags.turn || flags.update || parsed.positionals[1]) : {};
    const materialTargets = splitFlag(flags.material || flags.workspace);
    const material = await loadCliMaterial(materialTargets, runtime, flags);
    return {
      input: {
        ...material,
        ...updateValue,
        state: stateValue.state || stateValue.liveLineage || stateValue,
        artifactIds: splitFlag(flags.artifacts),
        ...(flags.assets ? { assets: await readOptionalJson(flags.assets) } : {}),
        requireInterleaved: Boolean(flags['require-interleaved'])
      },
      options: {}
    };
  }
  if (parsed.command === 'plan-durable-materialization') {
    const session = await readOptionalJson(flags.session || parsed.positionals[0]);
    const specsValue = await readOptionalJson(flags.specs || parsed.positionals[1]);
    return {
      input: {
        session: session.session || session,
        materializations: specsValue.materializations || specsValue.specs || (Array.isArray(specsValue) ? specsValue : [])
      },
      options: {}
    };
  }
  if (parsed.command === 'explain-findings' || parsed.command === 'repair-plan') {
    const file = parsed.positionals[0] || flags.input;
    if (!file) throw new Error('portable.cli.findings-file.required');
    return { input: JSON.parse(await readFile(file, 'utf8')), options: {} };
  }

  if (parsed.command === 'discover-tooling') {
    const host = await readOptionalJson(flags.host || flags.tools);
    return { input: host, options: {} };
  }

  if (parsed.command === 'describe-cold-start-ingress') return { input: { ingressKind: flags.ingress || flags.kind || parsed.positionals[0] || 'routed-handoff-package' }, options: {} };

  if (parsed.command === 'project-cold-start-host') {
    const host = await readOptionalJson(flags.host || flags.tools);
    return { input: { ...host, host, ingressKind: flags.ingress || flags.kind || parsed.positionals[0] || 'routed-handoff-package', toolingInvocationAvailable: Boolean(flags['tooling-invocation']) }, options: {} };
  }

  if (parsed.command === 'qualify-cold-start') return prepareQualifyColdStartCommandInput(parsed, flags);

  if (parsed.command === 'project-grounding-readiness') {
    const packagePath = String(flags.package || parsed.positionals[0] || flags.input || '').trim();
    if (!packagePath) throw new Error('portable.cli.ground.input.required');
    const material = await loadCliExplicitMaterial([packagePath], parsed.command, flags, { maxFiles: flags['max-files'], maxTextBytes: flags['max-text-bytes'] });
    const { host, recoveryAcceptance } = await groundInput(flags, await readOptionalJson(flags.host || flags.tools));
    return {
      input: {
        ...material,
        bundle: material,
        route: flags.route || '',
        packageSourcePath: packagePath,
        includeLegacyTopics: Boolean(flags['include-legacy-topics']),
        includeRequiredContext: flags['include-required-context'] || '',
        holderBinding: { roleLabel: flags['holder-role'] || '', holderId: flags['holder-id'] || '' },
        host,
        recoveryAcceptance
      },
      options: {}
    };
  }

  if (parsed.command === 'plan-host-action') {
    const host = await readOptionalJson(flags.host || flags.tools);
    const request = await readOptionalJson(flags.request);
    return {
      input: { ...host, host, action: flags.action || flags.capability || parsed.positionals[0] || '', request },
      options: { allowRemoteWrite: Boolean(flags['allow-remote-write']) }
    };
  }
  if (parsed.command === 'accept-host-receipt') {
    const plan = await readOptionalJson(flags.plan || parsed.positionals[0]);
    const receipt = await readOptionalJson(flags.receipt || parsed.positionals[1]);
    const prior = await readOptionalJson(flags.prior || flags.previous);
    return { input: { plan: plan.result || plan, receipt: receipt.result || receipt, priorAcceptance: prior.result || prior }, options: {} };
  }

  if (parsed.command === 'manufacture-handoff-package') {
    return prepareHandoffManufactureCliCommand(parsed, runtime);
  }
  if (parsed.command === 'describe-checkpoint-gate') return { input: { profile: flags.profile || parsed.positionals[0] || 'source-clean' }, options: {} };
  if (parsed.command === 'qualify-checkpoint') {
    const file = flags.receipt || flags.report || parsed.positionals[0] || flags.input;
    if (!file) throw new Error('portable.cli.checkpoint-qualification-file.required');
    const value = JSON.parse(await readFile(file, 'utf8'));
    return { input: value.qualificationInput || value.input || value, options: {} };
  }

  const explicitTargets = parsed.positionals.length ? parsed.positionals : flags.input ? [flags.input] : [];
  const schemaAwareOperations = new Set(['resolve-schema-material', 'resolve-schema-chain-material', 'describe-schema-chain', 'make-writer-brief', 'schema-guide', 'read-schema-section', 'plan-artifact', 'prepare-materialization', 'create-local-artifact-set', 'create-local-draft', 'update-local-draft', 'validate-draft', 'stage-draft', 'materialize-durable-findings', 'process-live-turn', 'export-live-lineage']);
  const defaultSchemaTargets = schemaAwareOperations.has(parsed.command) ? normalizeRuntimePaths(runtime.defaultSchemaMaterialPaths) : [];
  const schemaTargets = defaultSchemaTargets.filter((target) => !explicitTargets.includes(target));
  const operationsWithoutMaterial = new Set(['prepare-task', 'prepare-materialization', 'create-local-artifact-set', 'create-local-draft', 'plan-host-action', 'accept-host-receipt', 'describe-checkpoint-gate', 'qualify-checkpoint', 'describe-schema-chain', 'schema-guide', 'plan-artifact', 'list-material-providers', 'resolve-schema-material', 'resolve-schema-chain-material', 'materialize-durable-findings', 'build-runtime-package', 'roundtrip-runtime-package', 'describe-cold-start-ingress', 'project-cold-start-host', 'qualify-cold-start', 'ground-cold-consumer']);
  if (!explicitTargets.length && !schemaTargets.length && !operationsWithoutMaterial.has(parsed.command)) throw new Error('portable.cli.input.required');
  const loadOptions = { maxFiles: flags['max-files'], maxTextBytes: flags['max-text-bytes'] };
  const explicitMaterial = explicitTargets.length ? await loadCliExplicitMaterial(explicitTargets, parsed.command, flags, loadOptions) : emptyMaterial();
  const defaultSchemaMaterial = schemaTargets.length ? decorateDefaultSchemaMaterial(await loadNodePortableInput(schemaTargets, loadOptions), runtime.defaultSchemaSource) : emptyMaterial();
  const material = mergeLoadedMaterial(explicitMaterial, defaultSchemaMaterial);
  if (parsed.command === 'project-handoff-carrier-output') return {
    input: { ...material, route: flags.route || '', collisionInstance: flags['collision-instance'] || 1 },
    options: {}
  };
  const options = {
    startId: flags.start || '',
    direction: flags.direction || 'ancestors',
    maxDepth: flags.depth || 3,
    includeMarkdown: Boolean(flags['include-markdown']),
    includeSchemaMarkdown: flags['no-schema-markdown'] ? false : true
  };
  const host = await readOptionalJson(flags.host);
  const schemaCache = await readOptionalJson(flags.cache);
  if (parsed.command === 'ground-cold-consumer') {
    const interaction = await readOptionalJson(flags.interaction);
    const participantsValue = await readOptionalJson(flags.participants);
    const contributionsValue = await readOptionalJson(flags.contributions);
    const roleMaterialPath = String(flags['role-material'] || '').trim();
    const roleMaterials = roleMaterialPath ? [{ path: roleMaterialPath, markdown: await readFile(roleMaterialPath, 'utf8') }] : [];
    return {
      input: {
        ...material,
        bundle: material,
        host,
        ingressKind: flags.ingress || flags.kind || 'routed-handoff-package',
        route: flags.route || '',
        interaction: interaction.interaction || interaction,
        participants: participantsValue.participants || (Array.isArray(participantsValue) ? participantsValue : []),
        contributions: contributionsValue.contributions || (Array.isArray(contributionsValue) ? contributionsValue : []),
        currentContributionId: flags['current-contribution'] || '',
        roleMaterials,
        toolingAvailable: flags['tooling-unavailable'] ? false : true
      },
      options
    };
  }
  if (parsed.command === 'prepare-task') return {
    input: {
      ...material,
      host,
      schemaCache,
      task: flags.task || flags.intent || 'inspect',
      schemaId: flags.schema || '',
      query: flags.query || '',
      assetPath: flags.asset || '',
      path: flags.path || '',
      markdown: flags.draft ? (draftFromMaterial(material, flags.draft).markdown) : '',
      values: await readOptionalJson(flags.values),
      inputs: await readOptionalJson(flags.values)
    },
    options
  };
  if (parsed.command === 'materialize-durable-findings') {
    const session = await readOptionalJson(flags.session);
    const specsValue = await readOptionalJson(flags.specs);
    return {
      input: {
        ...material,
        session: session.session || session,
        materializations: specsValue.materializations || specsValue.specs || (Array.isArray(specsValue) ? specsValue : [])
      },
      options
    };
  }
  if (parsed.command === 'build-runtime-package' || parsed.command === 'roundtrip-runtime-package') {
    const session = await readOptionalJson(flags.session);
    const stagedValue = await readOptionalJson(flags.staged);
    return {
      input: {
        ...material,
        session: session.session || session,
        stagedArtifacts: stagedValue.stagedArtifacts || (Array.isArray(stagedValue) ? stagedValue : []),
        title: flags.title || '',
        workspaceId: flags['workspace-id'] || '',
        allowBlocked: Boolean(flags['allow-blocked']),
        includeDegraded: flags['exclude-degraded'] ? false : true
      },
      options
    };
  }
  if (parsed.command === 'list-material-providers') return {
    input: { ...material, host, schemaCache },
    options
  };
  if (parsed.command === 'resolve-schema-material') return {
    input: { ...material, host, schemaCache, schemaId: flags.schema || parsed.positionals[0] || '', repository: flags.repository || runtime.defaultSchemaProviderSource?.repository || '', ref: flags.ref || runtime.defaultSchemaProviderSource?.ref || '', sourceProfile: runtime.defaultSchemaProviderSource || null },
    options
  };
  if (parsed.command === 'resolve-schema-chain-material') return {
    input: { ...material, host, schemaCache, schemaId: flags.schema || parsed.positionals[0] || '', repository: flags.repository || runtime.defaultSchemaProviderSource?.repository || '', ref: flags.ref || runtime.defaultSchemaProviderSource?.ref || '', sourceProfile: runtime.defaultSchemaProviderSource || null, maxDepth: flags.depth || 16 },
    options
  };
  if (parsed.command === 'make-writer-brief') return {
    input: { ...material, schemaId: flags.schema || '', transitionType: flags.transition || 'create-artifact' },
    options
  };
  if (parsed.command === 'describe-schema-chain') return {
    input: { ...material, schemaId: flags.schema || parsed.positionals[0] || '' },
    options
  };
  if (parsed.command === 'schema-guide') return {
    input: { ...material, schemaId: flags.schema || '', task: flags.task || 'read', detail: flags.detail || 'compact' },
    options
  };
  if (parsed.command === 'read-schema-section') return {
    input: { ...material, schemaId: flags.schema || '', sections: splitFlag(flags.section || flags.sections) },
    options: { ...options, maxChars: flags['max-chars'] || 12000 }
  };
  if (parsed.command === 'plan-artifact') return {
    input: { ...material, schemaId: flags.schema || '', task: flags.task || 'create', detail: flags.detail || 'compact', inputs: await readOptionalJson(flags.values) },
    options
  };
  if (parsed.command === 'prepare-materialization' || parsed.command === 'create-local-artifact-set') {
    const proposalDocument = await readOptionalJson(flags.proposals || flags.plan);
    const proposals = proposalDocument.proposals || proposalDocument.proposal || (Array.isArray(proposalDocument) ? proposalDocument : []);
    return { input: { ...material, proposals }, options };
  }
  if (parsed.command === 'create-local-draft') return {
    input: {
      ...material,
      schemaId: flags.schema || '',
      transitionType: flags.transition || 'create-artifact',
      path: flags.path || '',
      ...(Object.prototype.hasOwnProperty.call(flags, 'title') ? { title: flags.title } : {}),
      ...(Object.prototype.hasOwnProperty.call(flags, 'summary') ? { summary: flags.summary } : {}),
      ...(Object.prototype.hasOwnProperty.call(flags, 'why') ? { why: flags.why } : {}),
      ...(Object.prototype.hasOwnProperty.call(flags, 'authors') ? { authors: flags.authors } : {}),
      ...(Object.prototype.hasOwnProperty.call(flags, 'created-at') ? { createdAt: flags['created-at'] } : {}),
      schemaReferences: await readOptionalJson(flags.references || flags['schema-references']),
      values: await readOptionalJson(flags.values),
      sections: await readOptionalJson(flags.sections),
      parent: await readOptionalJson(flags.parent),
      allowIncomplete: Boolean(flags['allow-incomplete'])
    },
    options
  };
  if (parsed.command === 'update-local-draft') {
    const draft = draftFromMaterial(material, flags.draft || '');
    const replacementPath = String(flags.replacement || '').trim();
    if (!replacementPath) throw new Error('portable.cli.replacement-file.required');
    return {
      input: {
        ...material,
        draft: { ...draft, schemaId: flags.schema || draft.schemaId || '', sourceMode: 'local-portable-draft', source: null },
        replacementMarkdown: await readFile(replacementPath, 'utf8'),
        allowInvalid: Boolean(flags['allow-invalid']),
        allowSchemaChange: Boolean(flags['allow-schema-change']),
        allowContinuityChange: Boolean(flags['allow-continuity-change'])
      },
      options
    };
  }
  if (parsed.command === 'delete-local-draft') {
    const draft = draftFromMaterial(material, flags.draft || '');
    return {
      input: {
        draft: { ...draft, schemaId: flags.schema || draft.schemaId || '', sourceMode: 'local-portable-draft', source: null },
        confirmId: flags.confirm || '',
        reason: flags.reason || ''
      },
      options
    };
  }
  if (parsed.command === 'stage-draft') {
    const draft = draftFromMaterial(material, flags.draft || '');
    return { input: { ...material, draft: { ...draft, schemaId: flags.schema || draft.schemaId || '', sourceMode: 'local-portable-draft', source: null }, allowInvalid: Boolean(flags['allow-invalid']) }, options };
  }
  if (parsed.command === 'inspect-assets') return { input: material, options };
  if (parsed.command === 'prepare-asset-analysis') return {
    input: { ...material, assetPath: flags.asset || flags.path || '', host },
    options
  };
  if (parsed.command === 'validate-draft') {
    const draft = draftFromMaterial(material, flags.draft || '');
    return { input: { ...material, ...draft, schemaId: flags.schema || draft.schemaId || '' }, options };
  }
  if (parsed.command === 'reduction-preflight') return {
    input: {
      ...material,
      candidates: splitFlag(flags.candidate || flags.candidates),
      reductionArtifactPath: flags.reduction || flags['reduction-artifact'] || '',
      immutableSources: await readOptionalJson(flags['immutable-sources'])
    },
    options
  };
  if (parsed.command === 'search-lineage') return {
    input: {
      ...material,
      query: flags.query || '',
      scope: flags.scope || '',
      startId: flags.start || '',
      maxDepth: flags.depth || 16,
      filters: {
        schemaIds: splitFlag(flags.schema),
        parentSchemaIds: splitFlag(flags['parent-schema']),
        sourceModes: splitFlag(flags.source),
        paths: splitFlag(flags.path),
        relation: flags.relation || '',
        hasIntegrity: flags.integrity,
        hasContinuityContext: flags.continuity,
        findingSeverities: splitFlag(flags.finding),
        qualification: splitFlag(flags.qualification),
        searchFields: splitFlag(flags.fields),
        limit: flags.limit,
        offset: flags.offset,
        snippetChars: flags['snippet-chars']
      }
    },
    options
  };
  return { input: material, options };
}


const LEGACY_TOPICS_GROUNDING_COMMANDS = new Set(['inspect', 'audit', 'project-operating-overview', 'project-grounding-readiness', 'resolve-lineage', 'search-lineage', 'prepare-task']);

async function loadCliExplicitMaterial(targets = [], command = '', flags = {}, loadOptions = {}) {
  const loaded = [];
  for (const target of targets) {
    loaded.push(await loadNodePortableInput([target], cliGroundingLoadOptions(target, command, flags, loadOptions)));
  }
  return loaded.reduce((material, next) => mergeLoadedMaterial(material, next), emptyMaterial());
}

function cliGroundingLoadOptions(target = '', command = '', flags = {}, loadOptions = {}) {
  if (!LEGACY_TOPICS_GROUNDING_COMMANDS.has(String(command || ''))) return loadOptions;
  if (Boolean(flags['include-legacy-topics'])) return loadOptions;
  const normalized = path.resolve(String(target || '')).replace(/\\/g, '/');
  if (/\.zip$/i.test(normalized)) return loadOptions;
  if (/(?:^|\/)\.topics\/development(?:\/|$)/.test(normalized)) return loadOptions;
  const prefix = normalized.endsWith('/.topics') ? 'development' : '.topics/development';
  return { ...loadOptions, excludePathPrefixes: [prefix] };
}

async function loadCliMaterial(targets = [], runtime = {}, flags = {}) {
  const explicitTargets = normalizeRuntimePaths(targets);
  const schemaTargets = normalizeRuntimePaths(runtime.defaultSchemaMaterialPaths).filter((target) => !explicitTargets.includes(target));
  const loadOptions = { maxFiles: flags['max-files'], maxTextBytes: flags['max-text-bytes'] };
  const explicitMaterial = explicitTargets.length ? await loadNodePortableInput(explicitTargets, loadOptions) : emptyMaterial();
  const defaultSchemaMaterial = schemaTargets.length ? decorateDefaultSchemaMaterial(await loadNodePortableInput(schemaTargets, loadOptions), runtime.defaultSchemaSource) : emptyMaterial();
  return mergeLoadedMaterial(explicitMaterial, defaultSchemaMaterial);
}

async function readOptionalJson(file = '') {
  if (!file) return {};
  return JSON.parse(await readFile(file, 'utf8'));
}


function draftFromMaterial(material = {}, preferredPath = '') {
  const files = Array.isArray(material.files) ? material.files : [];
  const preferred = preferredPath ? files.find((file) => file.path === preferredPath || file.path.endsWith(preferredPath)) : null;
  const candidate = preferred || files.find((file) => !String(file.path || '').toLowerCase().endsWith('.schema.md') && typeof file.content === 'string') || files.find((file) => typeof file.content === 'string');
  if (!candidate) throw new Error('portable.cli.draft.required');
  return { path: candidate.path || 'draft.md', markdown: candidate.content || candidate.markdown || '', schemaId: '' };
}

function emptyMaterial() {
  return { files: [], findings: [], sourceMode: 'portable-node-local' };
}

function decorateDefaultSchemaMaterial(material = {}, source = {}) {
  const repository = String(source.repository || '');
  const commit = String(source.commit || source.ref || '');
  const sourcePathPrefix = String(source.sourcePathPrefix || '.topics/.schemas').replace(/\/$/, '');
  return {
    ...material,
    files: (material.files || []).map((file) => ({
      ...file,
      sourceMode: 'portable-bootstrap-canonical-schema',
      source: markPortableBootstrapCanonicalSource({
        providerId: 'bootstrap-canonical-schema-pack',
        repository,
        ref: commit,
        commit,
        path: `${sourcePathPrefix}/${file.path}`,
        authority: 'canonical-core',
        qualification: 'bundled-byte-bound-canonical-snapshot',
        remoteFetch: false,
        cached: false
      })
    }))
  };
}

function mergeLoadedMaterial(primary = {}, secondary = {}) {
  return {
    files: [...(primary.files || []), ...(secondary.files || [])],
    findings: [...(primary.findings || []), ...(secondary.findings || [])],
    sourceMode: primary.files?.length ? primary.sourceMode : secondary.sourceMode || 'portable-node-local'
  };
}

function normalizeRuntimePaths(value) { const paths = Array.isArray(value) ? value : value ? [value] : []; return paths.map((entry) => String(entry || '').trim()).filter(Boolean); }
function splitFlag(value) { return !value || value === true ? [] : String(value).split(',').map((item) => item.trim()).filter(Boolean); }
