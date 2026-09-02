import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';
import { planPortableHostAction, acceptPortableHostActionReceipt, PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID } from '../../host/tool.bindings.js';
import { runPortableOperation } from '../../operation.catalog.js';

export async function continueGroundWithHostResult(result = {}, input = {}, options = {}, flags = {}) {
  const resultTarget = flags['host-result'];
  if (!resultTarget) return { result, output: result };
  const recovery = result?.continuity?.recovery;
  if (recovery?.state !== 'host-action-available' || !recovery.hostAction) throw new Error('portable.cli.ground.host-result-without-host-action');
  const { acceptance } = await acceptGroundHostResult(result, input, flags);
  await persistRecoveryState(flags.state || flags['recovery-state'], acceptance);
  const resumed = await runPortableOperation('project-grounding-readiness', { ...input, recoveryAcceptance: acceptance }, options);
  const continuation = Object.freeze({
    schema: 'tiinex.portable.ground-host-recovery-continuation.v1',
    state: resumed.status === 'blocked' ? 'recovery-continues' : 'grounding-resumed',
    hostResultAccepted: true,
    cumulativeRepositoryFiles: Number(acceptance.cumulativeRecovery?.repositoryFiles || 0),
    statePath: String(flags.state || flags['recovery-state'] || ''),
    stateOwnedByTooling: Boolean(flags.state || flags['recovery-state']),
    nextHostAction: resumed?.continuity?.recovery?.state === 'host-action-available' ? resumed.continuity.recovery.hostAction : null,
    boundary: 'The caller returns only exact host-result content. Tooling owns plan identity, receipt normalization, cumulative prior acceptance, and resume composition; accepted material remains subject to grounding lineage qualification.'
  });
  return { result: resumed, output: Object.freeze({ ...resumed, hostRecoveryContinuation: continuation }) };
}


export async function acceptGroundHostResult(result = {}, input = {}, flags = {}) {
  const resultTarget = flags['host-result'];
  const recovery = result?.continuity?.recovery;
  if (!resultTarget) throw new Error('portable.cli.ground.host-result.required');
  if (recovery?.state !== 'host-action-available' || !recovery.hostAction) throw new Error('portable.cli.ground.host-result-without-host-action');
  const content = await readHostResultContent(resultTarget);
  const action = recovery.hostAction;
  const plan = planPortableHostAction({ ...input.host, host: input.host, action: action.action, request: action.request });
  if (plan.status !== 'ready') throw new Error('portable.cli.ground.host-action-plan-blocked');
  const step = plan.steps.find((entry) => entry.capability === 'repositoryRead');
  if (!step) throw new Error('portable.cli.ground.repository-read-step.required');
  const request = action.request || {};
  const receipt = Object.freeze({
    schema: PORTABLE_HOST_ACTION_RECEIPT_SCHEMA_ID,
    actionId: plan.actionId,
    action: plan.action,
    steps: Object.freeze([Object.freeze({
      stepId: step.stepId,
      toolId: step.tool?.id || action.selectedTool?.id || '',
      status: 'completed',
      normalized: Object.freeze({ files: Object.freeze([Object.freeze({
        path: String(request.path || ''),
        content,
        source: Object.freeze({
          repository: String(request.repository || ''),
          ref: String(request.ref || ''),
          commit: String(request.ref || ''),
          path: String(request.path || ''),
          authority: 'remote-repository-unverified'
        })
      })]) })
    })])
  });
  const acceptance = acceptPortableHostActionReceipt({ plan, receipt, priorAcceptance: input.recoveryAcceptance || {} });
  if (acceptance.status !== 'accepted') throw new Error('portable.cli.ground.host-result-rejected');
  return Object.freeze({ plan, acceptance });
}


async function readGroundRecoveryState(file = '') {
  if (!file) return {};
  try { return JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { if (error?.code === 'ENOENT') return {}; throw error; }
}

export function hostToolProfile(host = {}, hostTool = '') {
  const name = String(hostTool || '').trim();
  if (!name) return host;
  const tools = Array.isArray(host?.tools) ? host.tools : [];
  if (tools.some((tool) => String(tool?.id || tool?.name || tool) === name)) return host;
  return Object.freeze({ ...host, tools: Object.freeze([...tools, Object.freeze({ id: name, name })]) });
}


export async function groundInput(flags = {}, baseHost = {}) {
  const host = hostToolProfile(baseHost, flags['host-tool']);
  const state = flags.recovery ? JSON.parse(await readFile(flags.recovery, 'utf8')) : await readGroundRecoveryState(flags.state || flags['recovery-state']);
  return Object.freeze({ host, recoveryAcceptance: state.result || state });
}

async function readHostResultContent(target) {
  if (target === true || target === '-') return readFile(0, 'utf8');
  return readFile(String(target), 'utf8');
}

async function persistRecoveryState(target, acceptance) {
  if (!target || target === true || target === '-') return;
  const outputPath = path.resolve(String(target));
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(acceptance, null, 2)}\n`, 'utf8');
}
