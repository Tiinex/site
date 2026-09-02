import { createHash } from 'node:crypto';
import { splitValidationChain } from './run-validation-chain.mjs';

export const VALIDATION_PROFILE_CONTRACT_SCHEMA = 'tiinex.site.validation-profile-contract.v1';
export const VALIDATION_PROFILE_SCHEMA = 'tiinex.site.validation-profile.v1';
export const RETURN_FIRST_CHECKPOINT_BOUNDARY = Object.freeze({
  requiredAfterSubstantiveFocusedQualification: true,
  beforeBroadClosure: true,
  carrierRequirement: 'canonical full-source Business+Docs+Site role return',
  purpose: 'Preserve a recoverable transport checkpoint before broad/long closure. This boundary does not claim host-safeguard control and does not replace final closure qualification.',
  boundary: 'A return checkpoint may truthfully carry unresolved blockers. Final closure remains independently required and may still fail.'
});

export const SMOKE_STEPS = Object.freeze([
  step('architecture-shape', 'node', ['tools/check-architecture-shape.mjs'], 'smoke'),
  step('foundation-smoke-suite', 'node', ['tools/run-foundation-suite.mjs', '--suite', 'smoke'], 'smoke')
]);

export const FOCUSED_TOOLING_ADDITIONAL_STEPS = Object.freeze([
  step('foundation-focused-tooling-suite', 'node', ['tools/run-foundation-suite.mjs', '--suite', 'focused/tooling'], 'focused/tooling'),
  step('static-regression-diagnostic', 'node', ['tools/validate-static-regression-aware.mjs', '--mode', 'diagnostic'], 'focused/tooling')
]);

export const FOCUSED_TOOLING_STEPS = Object.freeze([
  ...SMOKE_STEPS,
  ...FOCUSED_TOOLING_ADDITIONAL_STEPS
]);

export const INTEGRATION_TOOLING_STEPS = Object.freeze([
  step('checkpoint-identity', 'node', ['tools/check-checkpoint-identity.mjs'], 'integration'),
  step('icon-imports', 'node', ['tools/check-icon-imports.mjs'], 'integration'),
  step('browser-import-boundary', 'node', ['tools/check-browser-import-boundary.mjs'], 'integration'),
  step('package-lock-platforms', 'node', ['tools/check-package-lock-platforms.mjs'], 'integration'),
  step('schema-bindings', 'node', ['tools/validate-schema-bindings.mjs'], 'integration'),
  step('schema-runtime-projections', 'node', ['tools/check-schema-runtime-projections.mjs'], 'integration'),
  step('workspace-schema', 'node', ['tools/validate-workspace-schema.mjs'], 'integration'),
  step('foundation-integration-suite', 'node', ['tools/run-foundation-suite.mjs', '--suite', 'integration'], 'integration')
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
  const smoke = profile({
    name: 'smoke',
    purpose: 'Small representative Foundation acceptance gate spanning architecture shape and the durable end-to-end smoke use cases. Passing smoke is not focused, integration, or release qualification.',
    layers: ['smoke'],
    steps: SMOKE_STEPS
  });

  const focused = profile({
    name: 'focused/tooling',
    purpose: 'Fast deterministic Tooling development gate. Reuses smoke, adds the focused Tooling component suite, then executes the real regression-aware static diagnostic. Passing focused is not release qualification.',
    layers: ['smoke', 'focused/tooling'],
    steps: FOCUSED_TOOLING_STEPS
  });

  const integrationSteps = dedupeSteps([...focused.steps, ...INTEGRATION_TOOLING_STEPS]);
  const integration = profile({
    name: 'integration',
    purpose: 'Repository integration diagnostic qualification. Reuses smoke/focused, runs distinct repository validators once, then executes the remaining component/use-case acceptance suites without historical test-file enumeration.',
    layers: ['smoke', 'focused/tooling', 'integration'],
    steps: integrationSteps
  });

  const closureOwn = CLOSURE_ADDITIONAL_PACKAGE_SCRIPTS.flatMap((name) => expandPackageScript(name, packageScripts));
  const closureSteps = dedupeSteps([
    ...integration.steps,
    step('strict-static-closure', 'node', ['tools/validate-static.mjs'], 'closure'),
    ...closureOwn
  ]);
  const closure = profile({
    name: 'closure',
    purpose: 'Final closure qualification. Reuses the small permanent acceptance spine and integration validators, restores the strict static gate, then adds portable smoke, UI, type/runtime, use-case, storage, build, and public-build checks.',
    layers: ['smoke', 'focused/tooling', 'integration', 'closure'],
    steps: closureSteps
  });

  return Object.freeze({
    schema: VALIDATION_PROFILE_CONTRACT_SCHEMA,
    version: 2,
    profiles: Object.freeze({
      smoke,
      'focused/tooling': focused,
      integration,
      closure
    }),
    returnFirstCheckpoint: RETURN_FIRST_CHECKPOINT_BOUNDARY,
    closureAdditionalPackageScripts: CLOSURE_ADDITIONAL_PACKAGE_SCRIPTS,
    boundary: 'Profiles compose one explicit smoke→focused→integration→closure spine over permanent component/use-case suites. Historical standalone test enumeration is not profile authority. Integration may continue across only exact inherited static debt; closure retains the original strict static boundary.'
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

function safeId(value = '') {
  return String(value || '').replace(/[^a-zA-Z0-9._-]+/g, '-').replace(/^-+|-+$/g, '') || 'step';
}
