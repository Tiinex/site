import { readFile } from 'node:fs/promises';
import { loadNodePortableInput } from '../../input/node.input.js';
import { listPortableOperations, runPortableOperation } from '../../operation.catalog.js';
import { writePortableRuntimePackageZip } from '../../output/node.zip.js';

export async function runPortableCli(argv = process.argv.slice(2), io = console) {
  const parsed = parseArgs(argv);
  if (!parsed.command || parsed.command === 'help' || parsed.flags.help) {
    io.log(helpText());
    return 0;
  }
  if (parsed.command === 'operations') {
    writeJson(io, listPortableOperations(), parsed.flags.compact !== true);
    return 0;
  }
  try {
    const { input, options } = await commandInput(parsed);
    const result = await runPortableOperation(parsed.command, input, options);
    if (parsed.command === 'build-runtime-package' && parsed.flags.output) {
      const receipt = await writePortableRuntimePackageZip(result.bundle, parsed.flags.output);
      writeJson(io, Object.freeze({ ...result, bundle: undefined, writeReceipt: receipt }), parsed.flags.compact !== true);
    } else {
      writeJson(io, result, parsed.flags.compact !== true);
    }
    return result?.findingSummary?.counts?.error ? 2 : 0;
  } catch (error) {
    io.error(JSON.stringify({
      schema: 'tiinex.portable.cli.error.v1',
      error: String(error?.message || error),
      command: parsed.command
    }, null, 2));
    return 1;
  }
}

async function commandInput(parsed) {
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

  const targets = parsed.positionals.length ? parsed.positionals : flags.input ? [flags.input] : [];
  const operationsWithoutMaterial = new Set(['prepare-task', 'describe-schema-chain', 'schema-guide', 'plan-artifact', 'list-material-providers', 'resolve-schema-material', 'resolve-schema-chain-material', 'materialize-durable-findings', 'build-runtime-package', 'roundtrip-runtime-package']);
  if (!targets.length && !operationsWithoutMaterial.has(parsed.command)) throw new Error('portable.cli.input.required');
  const material = targets.length ? await loadNodePortableInput(targets, {
    maxFiles: flags['max-files'],
    maxTextBytes: flags['max-text-bytes']
  }) : { files: [], findings: [], sourceMode: 'portable-node-local' };
  const options = {
    startId: flags.start || '',
    direction: flags.direction || 'ancestors',
    maxDepth: flags.depth || 3,
    includeMarkdown: Boolean(flags['include-markdown']),
    includeSchemaMarkdown: flags['no-schema-markdown'] ? false : true
  };
  const host = await readOptionalJson(flags.host);
  const schemaCache = await readOptionalJson(flags.cache);
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
    input: { ...material, host, schemaCache, schemaId: flags.schema || parsed.positionals[0] || '', repository: flags.repository || 'Tiinex/docs', ref: flags.ref || 'master' },
    options
  };
  if (parsed.command === 'resolve-schema-chain-material') return {
    input: { ...material, host, schemaCache, schemaId: flags.schema || parsed.positionals[0] || '', repository: flags.repository || 'Tiinex/docs', ref: flags.ref || 'master', maxDepth: flags.depth || 16 },
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
  if (parsed.command === 'create-local-draft') return {
    input: {
      ...material,
      schemaId: flags.schema || '',
      path: flags.path || '',
      title: flags.title || '',
      summary: flags.summary || '',
      why: flags.why || '',
      values: await readOptionalJson(flags.values),
      sections: await readOptionalJson(flags.sections),
      parent: await readOptionalJson(flags.parent),
      allowIncomplete: Boolean(flags['allow-incomplete'])
    },
    options
  };
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

function splitFlag(value) {
  if (!value || value === true) return [];
  return String(value).split(',').map((item) => item.trim()).filter(Boolean);
}

function parseArgs(argv = []) {
  const args = [...argv];
  const first = args.shift() || '';
  if (first === '--help' || first === '-h') return { command: 'help', flags: { help: true }, positionals: [] };
  const command = first;
  const flags = {};
  const positionals = [];
  while (args.length) {
    const token = args.shift();
    if (!token.startsWith('--')) {
      positionals.push(token);
      continue;
    }
    const key = token.slice(2);
    if (!args.length || args[0].startsWith('--')) flags[key] = true;
    else flags[key] = args.shift();
  }
  return { command, flags, positionals };
}

function writeJson(io, value, pretty = true) {
  io.log(JSON.stringify(value, null, pretty ? 2 : 0));
}

function helpText() {
  return [
    'Tiinex portable tooling',
    '',
    'node tools/tiinex-portable.mjs operations',
    'node tools/tiinex-portable.mjs prepare-task [file|dir|zip] --task <read-schema|create-artifact|validate-draft|search-lineage|analyze-asset> [--schema <id>] [--host host-profile.json]',
    'node tools/tiinex-portable.mjs discover-tooling [--host host-profile.json]',
    'node tools/tiinex-portable.mjs list-material-providers [file|dir|zip] [--host host-profile.json]',
    'node tools/tiinex-portable.mjs resolve-schema-material [file|dir|zip] --schema <schema-id> [--host host-profile.json]',
    'node tools/tiinex-portable.mjs resolve-schema-chain-material [file|dir|zip] --schema <schema-id> [--depth 16]',
    'node tools/tiinex-portable.mjs inspect <file|dir|zip> [--include-markdown]',
    'node tools/tiinex-portable.mjs audit <file|dir|zip>',
    'node tools/tiinex-portable.mjs resolve-lineage <file|dir|zip> [--start <id>] [--depth 3] [--direction ancestors|descendants|both]',
    'node tools/tiinex-portable.mjs resolve-capabilities <schema-id> [capability]',
    'node tools/tiinex-portable.mjs describe-schema-chain <file|dir|zip> --schema <schema-id>',
    'node tools/tiinex-portable.mjs inspect-creation-contract <schema-id> [--transition <type>]',
    'node tools/tiinex-portable.mjs make-writer-brief <file|dir|zip> --schema <schema-id>',
    'node tools/tiinex-portable.mjs schema-guide <file|dir|zip> --schema <schema-id> [--task create] [--detail compact]',
    'node tools/tiinex-portable.mjs read-schema-section <file|dir|zip> --schema <schema-id> --section "Artifact Creation Contract,Minimal Example"',
    'node tools/tiinex-portable.mjs plan-artifact <file|dir|zip> --schema <schema-id> [--values inputs.json]',
    'node tools/tiinex-portable.mjs create-local-draft <schema-dir|zip> --schema <schema-id> --values inputs.json [--sections sections.json]',
    'node tools/tiinex-portable.mjs validate-draft <draft.md> <schema-dir|zip> --schema <schema-id>',
    'node tools/tiinex-portable.mjs stage-draft <draft.md> <schema-dir|zip> --schema <schema-id>',
    'node tools/tiinex-portable.mjs search-lineage <file|dir|zip> --query <text> [--schema <ids>] [--relation root|leaf] [--scope ancestors --start <id>]',
    'node tools/tiinex-portable.mjs inspect-assets <file|dir|zip>',
    'node tools/tiinex-portable.mjs prepare-asset-analysis <file|dir|zip> --asset <path> --host host-profile.json',
    'node tools/tiinex-portable.mjs plan-durable-materialization --session session.json --specs materializations.json',
    'node tools/tiinex-portable.mjs materialize-durable-findings <schema-dir|zip> --session session.json --specs materializations.json',
    'node tools/tiinex-portable.mjs create-checkpoint session.json [--created-at <iso>]',
    'node tools/tiinex-portable.mjs restore-checkpoint checkpoint.json',
    'node tools/tiinex-portable.mjs build-runtime-package [file|dir|zip] [--session session.json] [--staged staged.json] [--output package.zip]',
    'node tools/tiinex-portable.mjs inspect-runtime-package bundle.json',
    'node tools/tiinex-portable.mjs rehydrate-runtime-package package.zip',
    'node tools/tiinex-portable.mjs roundtrip-runtime-package [file|dir|zip] [--session session.json] [--bundle bundle.json]',
    'node tools/tiinex-portable.mjs explain-findings <validation-result.json>',
    'node tools/tiinex-portable.mjs repair-plan <validation-result.json>',
    'node tools/tiinex-portable.mjs serialize-session <file|dir|zip>',
    'node tools/tiinex-portable.mjs restore-session <snapshot.json>',
    '',
    'All results are JSON. Remote schema reads are host-mediated and explicit. Operations do not mutate sources, authorize remote writes, or execute received package code.'
  ].join('\n');
}
