import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { parseArtifactMarkdown } from '../../../../artifacts/artifact.parse.js';
import { buildArtifactCreationContract } from '../../../../schemas/creation.contracts.js';
import { renderArtifactCreationDraftMarkdown } from '../../../../schemas/creation.renderer.js';
import { canonicalC14nV2SelfState } from '../../../../integrity/integrity.c14nV2.js';
import { sha256Hex, utf8Bytes } from '../../../../export/package.bytes.js';
import { resolveSchemaModule } from '../../../../schemas/resolver.js';
import { loadNodePortableInput } from '../../input/node.input.js';
import { runPortableOperation } from '../../operation.catalog.js';

const STATE_RELATIVE_PATH = '.tiinex/continuation.json';

export async function runCommonAuthorCli(parsed = {}, runtime = {}) {
  const flags = parsed.flags || {};
  const workspaceRoot = path.resolve(String(flags.workspace || parsed.positionals?.[0] || '.'));
  const state = await readContinuationState(workspaceRoot);
  const schemaId = String(flags.schema || '').trim();
  const artifactRelativePath = normalizeWorkspaceRelativePath(flags.path || parsed.positionals?.[1] || '');
  const bodyPath = String(flags.body || flags.content || '').trim();
  if (!schemaId) throw new Error('portable.cli.author.schema.required');
  if (!artifactRelativePath) throw new Error('portable.cli.author.path.required');
  if (!bodyPath) throw new Error('portable.cli.author.body.required');
  const artifactPath = safeWorkspaceTarget(workspaceRoot, artifactRelativePath);
  const bodyMarkdown = (await readFile(path.resolve(bodyPath), 'utf8')).trim();
  if (!bodyMarkdown) throw new Error('portable.cli.author.body.empty');

  const parentRelativePath = resolveParentRelativePath(flags, state);
  const parentPath = parentRelativePath ? safeWorkspaceTarget(workspaceRoot, parentRelativePath) : '';
  const parentRecord = parentPath ? await parentRecordFromArtifact(parentPath, parentRelativePath, { workspaceRoot, childRelativePath: artifactRelativePath }) : {};
  const transitionType = String(flags.transition || defaultTransition(schemaId, Boolean(parentPath))).trim();
  const contract = buildArtifactCreationContract({ schemaId, transitionType });
  const title = String(flags.title || firstHeading(bodyMarkdown) || state?.roleLabel || schemaId).trim();
  const summary = String(flags.summary || title).trim();
  const authors = String(flags.authors || state?.roleLabel || '').trim();
  const why = Object.prototype.hasOwnProperty.call(flags, 'why') ? String(flags.why || '').trim() : '';
  const status = String(flags.status || 'ready/local').trim();

  const markdown = renderArtifactCreationDraftMarkdown(contract, {
    currentSchemaId: schemaId,
    parentRecord,
    childPath: artifactRelativePath,
    bodyMarkdown,
    title,
    summary,
    authors,
    why,
    status,
    createdAt: flags['created-at'] || new Date()
  });
  const selfIntegrity = canonicalC14nV2SelfState(markdown);
  if (selfIntegrity.state !== 'verified') throw new Error(`portable.cli.author.integrity.${selfIntegrity.reason || selfIntegrity.state}`);

  await mkdir(path.dirname(artifactPath), { recursive: true });
  let wrote = false;
  try {
    await writeFile(artifactPath, markdown, { encoding: 'utf8', flag: flags.overwrite ? 'w' : 'wx' });
    wrote = true;
    const auditMaterial = await loadNodePortableInput(
      [artifactPath, ...(parentPath ? [parentPath] : [])],
      { maxFiles: flags['max-files'], maxTextBytes: flags['max-text-bytes'] }
    );
    const audit = await runPortableOperation('audit', auditMaterial, {});
    const stageMaterial = await loadNodePortableInput(
      normalizeRuntimePaths(runtime.defaultSchemaMaterialPaths),
      { maxFiles: flags['max-files'], maxTextBytes: flags['max-text-bytes'] }
    );
    const stage = await runPortableOperation('stage-draft', {
      ...stageMaterial,
      draft: { path: artifactRelativePath, markdown, schemaId, sourceMode: 'local-common-author', source: null }
    }, {});
    const blocking = Number(audit?.findingSummary?.counts?.error || 0) + Number(stage?.findingSummary?.counts?.error || 0);
    if (blocking) {
      await rm(artifactPath, { force: true });
      wrote = false;
      return Object.freeze({
        schema: 'tiinex.portable.common-author.result.v1',
        operation: 'author',
        status: 'blocked',
        artifact: Object.freeze({ path: artifactRelativePath, schemaId, written: false }),
        audit,
        stage,
        findingSummary: mergeFindingSummaries(audit?.findingSummary, stage?.findingSummary),
        nextAction: 'Resolve the reported schema/continuity finding, then rerun the same author command. No invalid durable artifact was retained.',
        boundary: 'Common-path authoring composes the shared renderer, c14n-v2 sealing, runtime audit, and staging qualification. It may write only the requested local Workspace artifact and runtime-only .tiinex continuation state; it performs no remote mutation.'
      });
    }
    const updatedState = await updateContinuationState(workspaceRoot, state, {
      lastAuthoredPath: artifactRelativePath,
      lastAuthoredSchemaId: schemaId,
      ...(schemaId === 'tiinex.handoff.v1' ? { returnHandoffPath: artifactRelativePath } : {})
    });
    return Object.freeze({
      schema: 'tiinex.portable.common-author.result.v1',
      operation: 'author',
      status: 'qualified',
      artifact: Object.freeze({ path: artifactRelativePath, absolutePath: artifactPath, schemaId, parentPath: parentRelativePath, selfIntegrity: selfIntegrity.state, written: true }),
      qualification: Object.freeze({ audit: audit.status, stage: stage.status, exportReady: Boolean(stage?.stagedArtifact?.qualification?.exportReady) }),
      findingSummary: mergeFindingSummaries(audit?.findingSummary, stage?.findingSummary),
      nextAction: schemaId === 'tiinex.handoff.v1'
        ? `Run handoff ${workspaceRoot} to manufacture the canonical full-source return; the Handoff path and received parent carrier are already carried forward.`
        : `Author the next result artifact with --parent ${artifactRelativePath}; Tooling will preserve and reseal exact local continuity.`,
      continuationState: Object.freeze({ path: path.join(workspaceRoot, STATE_RELATIVE_PATH), returnHandoffPath: updatedState.returnHandoffPath || '' }),
      boundary: 'Common-path authoring composes the shared renderer, c14n-v2 sealing, runtime audit, and staging qualification. It may write only the requested local Workspace artifact and runtime-only .tiinex continuation state; it performs no remote mutation.'
    });
  } catch (error) {
    if (wrote && !flags['keep-invalid']) await rm(artifactPath, { force: true });
    throw error;
  }
}

async function parentRecordFromArtifact(parentPath, parentRelativePath, context = {}) {
  const markdown = await readFile(parentPath, 'utf8');
  const parsed = parseArtifactMarkdown(markdown);
  const current = parsed.envelope?.current || {};
  const schemaId = String(current.schema?.id || '').trim();
  const schemaTarget = String(current.schema?.target || '').trim();
  const self = canonicalC14nV2SelfState(markdown);
  if (!schemaId) throw new Error('portable.cli.author.parent.schema-authority.required');
  if (self.state !== 'verified') throw new Error(`portable.cli.author.parent.integrity.${self.reason || self.state}`);
  const schemaReferenceAuthority = schemaTarget
    ? exactDeclaredSchemaReferenceAuthority(schemaId, schemaTarget)
    : await recoverQualifiedLocalSchemaReferenceAuthority(schemaId, context);
  if (!schemaReferenceAuthority) throw new Error('portable.cli.author.parent.schema-authority.required');
  return Object.freeze({
    id: parentRelativePath,
    path: parentRelativePath,
    schemaId,
    currentSchemaId: schemaId,
    currentCreatedAt: String(current.createdAt || ''),
    createdAt: String(current.createdAt || ''),
    markdown,
    recoveryMode: 'local-relative',
    schemaReferenceAuthority
  });
}

function exactDeclaredSchemaReferenceAuthority(schemaId, schemaTarget) {
  return Object.freeze({
    schemaId,
    exactTargets: Object.freeze([schemaTarget]),
    preferredTarget: schemaTarget,
    resolutionState: 'qualified'
  });
}

async function recoverQualifiedLocalSchemaReferenceAuthority(schemaId, context = {}) {
  const workspaceRoot = path.resolve(String(context.workspaceRoot || '.'));
  const childRelativePath = normalizeWorkspaceRelativePath(context.childRelativePath || '');
  const resolution = resolveSchemaModule({ schemaId });
  const module = resolution?.fallbackUsed ? null : resolution?.module || null;
  const source = module?.schemaSource || null;
  const qualification = typeof source?.qualify === 'function' ? source.qualify() : null;
  const materialIdentity = qualification?.materialIdentity || {};
  const bundledPath = normalizeWorkspaceRelativePath(source?.bundledPath || '');
  const expectedSha256 = String(materialIdentity.sha256 || qualification?.checksum || '').trim().toLowerCase();
  if (!module || String(module.id || '') !== schemaId) return null;
  if (qualification?.state !== 'qualified' || materialIdentity?.state !== 'qualified' || String(materialIdentity.schemaId || '') !== schemaId) return null;
  if (!bundledPath || !childRelativePath || !expectedSha256) return null;

  let localMarkdown;
  try { localMarkdown = await readFile(safeWorkspaceTarget(workspaceRoot, bundledPath), 'utf8'); }
  catch { return null; }
  if (sha256Hex(utf8Bytes(localMarkdown)).toLowerCase() !== expectedSha256) return null;

  let localParsed;
  try { localParsed = parseArtifactMarkdown(localMarkdown); }
  catch { return null; }
  if (String(localParsed.envelope?.current?.schema?.id || '').trim() !== schemaId) return null;

  const childDir = path.posix.dirname(childRelativePath);
  const preferredTarget = path.posix.relative(childDir === '.' ? '' : childDir, bundledPath);
  if (!preferredTarget || path.posix.isAbsolute(preferredTarget)) return null;
  return Object.freeze({
    schemaId,
    exactTargets: Object.freeze([preferredTarget]),
    preferredTarget,
    resolutionState: 'qualified',
    targetAuthority: 'qualified-local-bundled-schema-material',
    resolutionEvidence: Object.freeze({
      state: 'qualified',
      kind: 'workspace-bundled-schema-byte-match',
      workspacePath: bundledPath,
      sha256: expectedSha256
    })
  });
}

function resolveParentRelativePath(flags = {}, state = {}) {
  if (flags['no-parent']) return '';
  if (typeof flags.parent === 'string' && flags.parent.trim()) return normalizeWorkspaceRelativePath(flags.parent);
  return normalizeWorkspaceRelativePath(state?.lastAuthoredPath || state?.selectedHandoffPath || '');
}

function defaultTransition(schemaId, hasParent) {
  if (!hasParent) return 'create-artifact';
  if (schemaId === 'tiinex.evidence.v1') return 'reference-record';
  return 'continue-from-record';
}

function firstHeading(markdown = '') {
  const match = String(markdown || '').match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : '';
}

function normalizeWorkspaceRelativePath(value = '') {
  const raw = String(value || '').trim().replace(/\\/g, '/').replace(/^\.\//, '');
  if (!raw || raw.startsWith('/') || /^[A-Za-z]:\//.test(raw)) return '';
  const parts = raw.split('/');
  if (parts.some((part) => !part || part === '.' || part === '..')) return '';
  return parts.join('/');
}

function safeWorkspaceTarget(root, relative) {
  const target = path.resolve(root, relative);
  const rel = path.relative(root, target);
  if (!relative || rel === '..' || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)) throw new Error(`portable.cli.author.path.unsafe:${relative}`);
  return target;
}

async function readContinuationState(workspaceRoot) {
  try { return JSON.parse(await readFile(path.join(workspaceRoot, STATE_RELATIVE_PATH), 'utf8')); }
  catch { return {}; }
}

async function updateContinuationState(workspaceRoot, previous = {}, patch = {}) {
  const statePath = path.join(workspaceRoot, STATE_RELATIVE_PATH);
  const next = Object.freeze({ ...previous, ...patch, schema: 'tiinex.portable.ground-continuation-state.v1', version: 1 });
  await mkdir(path.dirname(statePath), { recursive: true });
  await writeFile(statePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return next;
}

function normalizeRuntimePaths(value) {
  const values = Array.isArray(value) ? value : value ? [value] : [];
  return values.map((item) => String(item || '').trim()).filter(Boolean);
}

function mergeFindingSummaries(...summaries) {
  const counts = summaries.reduce((out, summary) => {
    const value = summary?.counts || {};
    out.error += Number(value.error || 0);
    out.warning += Number(value.warning || 0);
    out.info += Number(value.info || 0);
    return out;
  }, { error: 0, warning: 0, info: 0 });
  counts.total = counts.error + counts.warning + counts.info;
  return Object.freeze({ status: counts.error ? 'invalid' : counts.warning ? 'degraded' : 'clean', counts: Object.freeze(counts) });
}
