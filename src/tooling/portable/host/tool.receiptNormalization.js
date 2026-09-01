import { portableFinding } from '../findings.js';

export function normalizeRepositoryFiles(normalized, findings) {
  const files = normalizeFiles(normalized);
  const out = [];
  for (const file of files) {
    if (!file.path || typeof file.content !== 'string') {
      findings.push(portableFinding('error', 'portable.host-receipt.repository-file.invalid', 'Repository read receipts require path and UTF-8 content.', { ref: file.path || '' }));
      continue;
    }
    const source = file.source || normalized.source || {};
    if (!source.repository) findings.push(portableFinding('error', 'portable.host-receipt.repository-source.missing', 'Repository read receipts require explicit repository identity.', { ref: file.path }));
    if (!source.commit) findings.push(portableFinding('warning', 'portable.host-receipt.repository-commit.unpinned', 'Repository material was returned without a resolved commit and remains moving-ref qualified.', { ref: file.path, repository: source.repository || '' }));
    const authority = source.authority === 'canonical-core' && !source.commit ? 'remote-repository-unpinned' : String(source.authority || 'remote-repository-unverified');
    out.push(Object.freeze({
      path: normalizePath(file.path),
      content: file.content,
      sourceMode: 'portable-host-repository',
      source: Object.freeze({
        repository: String(source.repository || ''),
        ref: String(source.ref || ''),
        commit: String(source.commit || ''),
        path: normalizePath(source.path || file.path),
        authority,
        remoteFetch: true,
        receiptQualification: 'accepted-host-repository-read',
        provenanceQualification: source.commit ? 'accepted-host-repository-pinned' : 'accepted-host-repository-moving-ref',
        ...(source.permalink ? { permalink: String(source.permalink) } : {}),
        ...(source.durableLocator ? { durableLocator: String(source.durableLocator) } : {})
      })
    }));
  }
  return out;
}

export function normalizeLocalFiles(normalized, findings, capabilityName) {
  const files = normalizeFiles(normalized);
  return files.flatMap((file) => {
    if (!file.path || (typeof file.content !== 'string' && !file.locator)) {
      findings.push(portableFinding('error', 'portable.host-receipt.local-file.invalid', 'Local/archive read receipts require a path plus content or an explicit locator.', { ref: file.path || '' }));
      return [];
    }
    if (file.source?.repository || normalized.source?.repository) findings.push(portableFinding('warning', 'portable.host-receipt.local-source.stripped', 'Repository source metadata was ignored for a local/archive read receipt.', { ref: file.path }));
    return [Object.freeze({
      path: normalizePath(file.path),
      ...(typeof file.content === 'string' ? { content: file.content } : {}),
      ...(file.locator ? { locator: sanitizeLocator(file.locator) } : {}),
      sourceMode: capabilityName === 'archiveRead' ? 'portable-host-archive' : 'portable-host-local',
      source: null
    })];
  });
}

export function normalizeInterpretations(normalized, findings, capabilityName) {
  if (!normalized.assetPath || !normalized.description) {
    findings.push(portableFinding('error', 'portable.host-receipt.interpretation.invalid', 'Multimodal receipts require assetPath and a generated description.'));
    return [];
  }
  return [Object.freeze({
    schema: 'tiinex.portable.asset-analysis-response.v1',
    assetPath: normalizePath(normalized.assetPath),
    description: String(normalized.description),
    observations: Object.freeze(normalizeList(normalized.observations)),
    qualification: Object.freeze({
      mode: normalized.qualification?.mode || (capabilityName === 'images' ? 'host-multimodal-image' : 'host-multimodal-pdf'),
      generatedInterpretation: true,
      sourceAssetPreserved: true,
      analysisIsNotSourceMaterial: true
    })
  })];
}

function normalizeFiles(value = {}) {
  if (Array.isArray(value.files)) return value.files;
  if (value.file && typeof value.file === 'object') return [value.file];
  if (value.path || value.content) return [value];
  return [];
}

export function normalizeList(value) {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set(list.map((item) => String(item || '').trim()).filter(Boolean))];
}

function sanitizeLocator(locator = {}) {
  return Object.freeze({
    kind: String(locator.kind || ''),
    archivePath: String(locator.archivePath || ''),
    entryPath: normalizePath(locator.entryPath || ''),
    localPath: String(locator.localPath || '')
  });
}

export function serializableSchema(value) {
  if (!value || typeof value !== 'object') return value || null;
  try { return JSON.parse(JSON.stringify(value)); } catch { return null; }
}

function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+/g, '/'); }
