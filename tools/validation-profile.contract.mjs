import { createHash } from 'node:crypto';
import { splitValidationChain } from './run-validation-chain.mjs';

export const VALIDATION_PROFILE_CONTRACT_SCHEMA = 'tiinex.site.validation-profile-contract.v1';
export const VALIDATION_PROFILE_SCHEMA = 'tiinex.site.validation-profile.v1';

export const FOCUSED_TOOLING_STEPS = Object.freeze([
  step('architecture-shape', 'node', ['tools/check-architecture-shape.mjs'], 'focused/tooling'),
  step('portable-cli', 'node', ['src/tooling/portable/adapters/cli/cli.run.test.mjs'], 'focused/tooling'),
  step('portable-bootstrap', 'node', ['src/tooling/portable/bootstrap/bootstrap.test.mjs'], 'focused/tooling'),
  step('portable-grounding', 'node', ['src/tooling/portable/adapters/cli/cli.legacyTopicsGrounding.test.mjs'], 'focused/tooling'),
  step('portable-summary', 'node', ['src/tooling/portable/adapters/cli/cli.summaryProjection.test.mjs'], 'focused/tooling'),
  step('portable-lineage-summary', 'node', ['src/tooling/portable/adapters/cli/cli.lineageSummaryProjection.test.mjs'], 'focused/tooling'),
  step('portable-cold-start-summary', 'node', ['src/tooling/portable/adapters/cli/cli.coldStartSummaryProjection.test.mjs'], 'focused/tooling'),
  step('legacy-artifact-fixtures', 'node', ['src/tooling/portable/fixtures/legacyArtifactFixtures.test.mjs'], 'focused/tooling'),
  step('portable-input', 'node', ['src/tooling/portable/input/node.input.test.mjs'], 'focused/tooling'),
  step('repository-workset', 'node', ['tools/measure-tooling-workset.test.mjs'], 'focused/tooling'),
  step('tooling-context-search', 'node', ['tools/search-tooling-context.test.mjs'], 'focused/tooling'),
  step('portable-input-workset', 'node', ['tools/measure-portable-input-workset.test.mjs'], 'focused/tooling'),
  step('checkpointed-command', 'node', ['tools/run-checkpointed-command.test.mjs'], 'focused/tooling'),
  step('checkpointed-plan', 'node', ['tools/run-checkpointed-plan.test.mjs'], 'focused/tooling'),
  step('validation-profile-contract', 'node', ['tools/validation-profile.contract.test.mjs'], 'focused/tooling'),
  step('validation-profile-profiler', 'node', ['tools/profile-validation-chain.test.mjs'], 'focused/tooling')
]);

export const CLOSURE_ADDITIONAL_PACKAGE_SCRIPTS = Object.freeze([
  'portable:smoke',
  'ui:shape',
  'typecheck',
  'runtime:smoke',
  'usecase:uc001',
  'storage:scan',
  'build:public',
  'public:check'
]);

export function buildValidationProfileContract({ packageScripts = {} } = {}) {
  const focused = profile({
    name: 'focused/tooling',
    purpose: 'Fast deterministic Tooling development gate. Passing this profile is not release qualification.',
    layers: ['focused/tooling'],
    steps: FOCUSED_TOOLING_STEPS
  });

  const integrationOwn = expandPackageScript('validate', packageScripts);
  const integrationSteps = dedupeSteps([...focused.steps, ...integrationOwn]);
  const integration = profile({
    name: 'integration',
    purpose: 'Repository integration qualification. Reuses the exact focused/tooling definition, then runs the existing validate contract as individually checkpointable commands.',
    layers: ['focused/tooling', 'integration'],
    steps: integrationSteps
  });

  const closureOwn = CLOSURE_ADDITIONAL_PACKAGE_SCRIPTS.flatMap((name) => expandPackageScript(name, packageScripts));
  const closureSteps = dedupeSteps([...integration.steps, ...closureOwn]);
  const closure = profile({
    name: 'closure',
    purpose: 'Final closure qualification. Reuses focused/tooling and integration, then adds portable smoke, UI, type/runtime, use-case, storage, build, and public-build checks.',
    layers: ['focused/tooling', 'integration', 'closure'],
    steps: closureSteps
  });

  return Object.freeze({
    schema: VALIDATION_PROFILE_CONTRACT_SCHEMA,
    version: 1,
    profiles: Object.freeze({
      'focused/tooling': focused,
      integration,
      closure
    }),
    closureAdditionalPackageScripts: CLOSURE_ADDITIONAL_PACKAGE_SCRIPTS,
    boundary: 'Profiles compose existing validation checks without deleting checks or upgrading a focused pass into release qualification. Exact step reuse is checkpoint reuse only; it is not semantic authority.'
  });
}

export function validationProfile(contract, name) {
  const key = String(name || '').trim();
  const found = contract?.profiles?.[key];
  if (!found) throw new Error(`validation-profile.unknown:${key || '(empty)'}`);
  return found;
}

export function validationProfileId(value = {}) {
  const canonical = JSON.stringify({
    schema: VALIDATION_PROFILE_SCHEMA,
    name: String(value.name || ''),
    layers: [...(value.layers || [])],
    steps: (value.steps || []).map((item) => ({ id: item.id, command: item.command, args: [...(item.args || [])] }))
  });
  return createHash('sha256').update(canonical).digest('hex');
}

export function expandPackageScript(scriptName, packageScripts = {}, stack = []) {
  const name = String(scriptName || '').trim();
  if (!name) throw new Error('validation-profile.package-script.name.required');
  if (stack.includes(name)) throw new Error(`validation-profile.package-script.recursive:${[...stack, name].join('>')}`);
  const scriptText = String(packageScripts?.[name] || '').trim();
  if (!scriptText) throw new Error(`validation-profile.package-script.missing:${name}`);
  const commands = splitValidationChain(scriptText);
  const out = [];
  for (let index = 0; index < commands.length; index += 1) {
    const raw = commands[index];
    const parts = tokenizeSimpleCommand(raw);
    if (parts[0] === 'npm' && parts[1] === 'run' && parts.length === 3) {
      out.push(...expandPackageScript(parts[2], packageScripts, [...stack, name]));
      continue;
    }
    const command = parts[0];
    const args = parts.slice(1);
    const detail = safeId(args[0] || command || `step-${index + 1}`);
    out.push(step(`${safeId(name)}-${String(index + 1).padStart(3, '0')}-${detail}`, command, args, `package:${name}`, raw));
  }
  return Object.freeze(out);
}

function tokenizeSimpleCommand(raw = '') {
  const text = String(raw || '').trim();
  if (!text) throw new Error('validation-profile.command.empty');
  if (/[|><;`"']/.test(text) || /\$\(/.test(text)) throw new Error(`validation-profile.command.unsupported-shell-syntax:${text}`);
  const parts = text.split(/\s+/).filter(Boolean);
  if (!parts.length) throw new Error('validation-profile.command.empty');
  return parts;
}

function dedupeSteps(values = []) {
  const seenCommands = new Set();
  const seenIds = new Set();
  const out = [];
  for (const value of values) {
    const commandKey = JSON.stringify([value.command, ...(value.args || [])]);
    if (seenCommands.has(commandKey)) continue;
    let id = value.id;
    let suffix = 2;
    while (seenIds.has(id)) id = `${value.id}-${suffix++}`;
    seenCommands.add(commandKey);
    seenIds.add(id);
    out.push(Object.freeze({ ...value, id }));
  }
  return Object.freeze(out);
}

function profile({ name, purpose, layers, steps }) {
  const value = {
    schema: VALIDATION_PROFILE_SCHEMA,
    name,
    purpose,
    layers: Object.freeze([...layers]),
    steps: Object.freeze([...(steps || [])])
  };
  return Object.freeze({ ...value, profileId: validationProfileId(value) });
}

function step(id, command, args = [], origin = '', raw = '') {
  return Object.freeze({
    id: String(id),
    command: String(command),
    args: Object.freeze(args.map(String)),
    origin: String(origin),
    raw: String(raw || [command, ...args].join(' '))
  });
}

function safeId(value) {
  return String(value || 'step').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'step';
}
