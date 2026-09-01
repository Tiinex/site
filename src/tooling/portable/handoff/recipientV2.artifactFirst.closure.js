import { packageFileBytes, sha256Hex } from '../../../export/package.bytes.js';
import { validatedC14nV2PrimarySelfDigest } from '../../../integrity/integrity.c14nV2.js';
import { projectHandoffMaterialRequirements } from './materialClosure.requirements.js';
import { deepFreeze, finding, normalizeRoutePath, sectionText, fieldValue, decodeUtf8 } from './recipientV2.artifactFirst.shared.js';

export function qualifyRecipientV2ArtifactFirstPhase1RequiredContextClosure(input = {}) {
  return qualifyPhase1RequiredContextClosure(input);
}

export function qualifyPhase1RequiredContextClosure({ markdown = '', routePath = '', workspaceId = '', archivePath = '', entries = [], caches = [] } = {}) {
  const projected = projectHandoffMaterialRequirements({ path: routePath, markdown });
  const findings = [];
  const requirements = (projected.required || []).map((requirement) => {
    const target = String(requirement.reference?.target || '').trim();
    const reasons = [];
    let resolution = null;
    if (!target || target.startsWith('#') || !requirement.reference?.exactTargetDeclared) reasons.push('exact-required-material-reference-unresolved');
    else if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('//')) {
      const matches = caches.flatMap((cache) => (cache?.state === 'qualified' ? (cache.materials || []).filter((material) => String(material.referenceTarget || '') === target && (!requirement.id || String(material.requirementId || '') === String(requirement.id || ''))).map((material) => ({ cache, material })) : []));
      if (matches.length > 1) reasons.push('required-cache-material-ambiguous');
      else if (matches.length < 1) reasons.push('required-cache-material-missing');
      else {
        const { cache, material } = matches[0];
        if (!material.sha256 || !material.bytes) reasons.push('required-cache-material-byte-identity-unresolved');
        else resolution = deepFreeze({ state: 'qualified', kind: 'workspace-cache-entry', workspaceId: String(cache.workspaceId || workspaceId || ''), workspaceRelativePath: '', providerMode: 'cache', packagePath: String(cache.payloadPath || ''), archivePackagePath: String(cache.payloadPath || ''), innerPath: String(material.archiveEntry || ''), archiveEntry: String(material.archiveEntry || ''), bytes: Number(material.bytes || 0), sha256: String(material.sha256 || '') });
      }
    }
    else {
      const resolvedPath = resolveRelativeWorkspacePath(routePath, target);
      if (!resolvedPath) reasons.push('workspace-reference-outside-or-invalid');
      else {
        const matches = entries.filter((entry) => String(entry.path || '') === resolvedPath);
        if (matches.length > 1) reasons.push('required-workspace-entry-ambiguous');
        else if (matches.length < 1) reasons.push('required-workspace-entry-missing');
        else {
          const entry = matches[0];
          const data = packageFileBytes({ data: entry.data });
          const digest = sha256Hex(data);
          if (Number(entry.bytes || 0) !== data.byteLength || String(entry.sha256 || '') !== digest) reasons.push('required-workspace-package-byte-mismatch');
          else resolution = deepFreeze({ state: 'qualified', kind: 'workspace-archive-entry', workspaceId: String(workspaceId || ''), workspaceRelativePath: resolvedPath, providerMode: 'archive', packagePath: String(archivePath || ''), archivePackagePath: String(archivePath || ''), innerPath: resolvedPath, bytes: data.byteLength, sha256: digest });
        }
      }
    }
    const state = reasons.length || !resolution ? 'blocked' : 'qualified';
    if (state !== 'qualified') findings.push(finding('error', `portable.handoff-v2-phase1.required-context.${reasons[0] || 'unresolved'}`, 'Required Context must resolve to one exact inner artifact carried by the selected Workspace payload or qualified selected-route cache; compatibility JSON cannot supply missing receiver truth.', { requirementId: String(requirement.id || ''), name: String(requirement.name || ''), referenceTarget: target, reasons: Object.freeze([...new Set(reasons)]) }));
    return deepFreeze({ requirementId: String(requirement.id || ''), name: String(requirement.name || ''), referenceTarget: target, state, resolution: state === 'qualified' ? resolution : null, reasons: Object.freeze([...new Set(reasons)]) });
  });
  const qualifiedCount = requirements.filter((entry) => entry.state === 'qualified').length;
  return deepFreeze({ state: qualifiedCount === requirements.length ? 'qualified' : 'blocked', requiredCount: requirements.length, qualifiedCount, requirements: Object.freeze(requirements), findings: Object.freeze(findings), boundary: 'Artifact-first Phase 1 Required Context closure. Every Required Context item must resolve to exact inner bytes of the selected qualified Workspace payload or qualified selected-route cache; Reference Context and compatibility JSON are intentionally excluded from blocking receiver truth.' });
}

export function resolveArchiveParent(routePath = '', entries = [], parent = {}, targetEntry = {}, parentCandidates = []) {
  const refs = [String(parent.trace || ''), ...(parent.originEntries || []).map((item) => String(item.target || '')), String(targetEntry.towards || '')].filter(Boolean);
  for (const ref of refs) {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(ref)) continue;
    const resolved = resolveRelativeWorkspacePath(routePath, ref);
    if (!resolved) continue;
    const matches = entries.filter((entry) => String(entry.path || '') === resolved);
    if (matches.length === 1) return Object.freeze({ state: 'qualified', markdown: decodeUtf8(matches[0].data), basis: 'artifact-first-workspace-archive', workspaceRelativePath: resolved, sha256: String(matches[0].sha256 || '') });
  }
  const expectedDigest = String(targetEntry?.value || '').trim();
  if (!expectedDigest) return Object.freeze({ state: 'unresolved', reason: 'parent-target-digest-missing' });
  const digestMatches = new Map();
  for (const candidate of parentCandidates || []) {
    const data = packageFileBytes({ data: candidate.data });
    if (!data.byteLength) continue;
    if (Number(candidate.bytes || data.byteLength) !== data.byteLength || (candidate.sha256 && String(candidate.sha256) !== sha256Hex(data))) continue;
    const markdown = decodeUtf8(data);
    if (!markdown) continue;
    const self = validatedC14nV2PrimarySelfDigest(markdown);
    if (self.state !== 'verified' || self.value !== expectedDigest) continue;
    const key = `${String(candidate.workspaceId || '')}\u0000${String(candidate.workspaceRelativePath || '')}\u0000${String(candidate.archiveEntry || '')}`;
    digestMatches.set(key, Object.freeze({ state: 'qualified', markdown, basis: 'artifact-first-detached-parent-target-digest-candidate', workspaceRelativePath: String(candidate.workspaceRelativePath || ''), archiveEntry: String(candidate.archiveEntry || ''), sha256: sha256Hex(data) }));
  }
  if (digestMatches.size === 1) return [...digestMatches.values()][0];
  if (digestMatches.size > 1) return Object.freeze({ state: 'ambiguous', reason: 'multiple-parent-target-digest-candidates' });
  return Object.freeze({ state: 'unresolved', reason: 'parent-entry-unresolved' });
}

export function phase1CacheParentCandidates(cacheQualifications = []) {
  const candidates = [];
  for (const cache of cacheQualifications || []) {
    if (cache?.state !== 'qualified' || cache.archive?.state !== 'qualified') continue;
    for (const material of cache.materials || []) {
      if (String(material.classification || '') !== 'parent-boundary') continue;
      const matches = (cache.archive.entries || []).filter((entry) => String(entry.path || '') === String(material.archiveEntry || ''));
      if (matches.length !== 1) continue;
      const entry = matches[0];
      const data = packageFileBytes({ data: entry.data });
      if (Number(material.bytes || 0) !== data.byteLength || String(material.sha256 || '') !== sha256Hex(data)) continue;
      candidates.push(Object.freeze({ workspaceId: String(cache.workspaceId || ''), workspaceRelativePath: normalizeRoutePath(material.referenceTarget || ''), archiveEntry: String(material.archiveEntry || ''), bytes: data.byteLength, sha256: sha256Hex(data), data }));
    }
  }
  return Object.freeze(candidates);
}

export function resolveRelativeWorkspacePath(fromPath = '', ref = '') {
  const value = String(ref || '').split('#')[0].replace(/\\/g, '/');
  if (!value || value.startsWith('/') || /^[A-Za-z]:\//.test(value)) return '';
  const base = String(fromPath || '').replace(/\\/g, '/').split('/'); base.pop();
  const parts = value.startsWith('./') || value.startsWith('../') ? [...base, ...value.split('/')] : [...base, ...value.split('/')];
  const out = [];
  for (const part of parts) { if (!part || part === '.') continue; if (part === '..') { if (!out.length) return ''; out.pop(); } else out.push(part); }
  return out.join('/');
}

export function parseHandoffParties(markdown = '') { const section = sectionText(markdown, 'Handoff Parties'); return Object.freeze({ from: fieldValue(section, 'From'), to: fieldValue(section, 'To') }); }
