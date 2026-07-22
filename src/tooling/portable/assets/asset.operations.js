import { normalizePortableInput, portableInputFiles } from '../input/portable.input.js';
import { portableFinding, summarizePortableFindings } from '../findings.js';
import { discoverPortableHostCapabilities } from '../host/host.capabilities.js';

export const PORTABLE_ASSET_INDEX_SCHEMA_ID = 'tiinex.portable.asset-index.v1';
export const PORTABLE_ASSET_ANALYSIS_REQUEST_SCHEMA_ID = 'tiinex.portable.asset-analysis-request.v1';

export function inspectPortableAssets(input = {}, options = {}) {
  const material = normalizePortableInput(input);
  const files = portableInputFiles(input);
  const references = buildReferenceIndex(material.records || []);
  const assets = (material.assets || []).map((asset) => {
    const file = files.find((entry) => normalizePath(entry.path || entry.name) === normalizePath(asset.path)) || {};
    const mimeType = inferMimeType(asset.path, asset.type || file.type || '');
    return Object.freeze({
      path: asset.path,
      kind: asset.kind || 'asset',
      mimeType,
      mediaKind: mediaKind(mimeType, asset.path),
      size: Number(asset.size || file.size || 0),
      contentAvailable: Boolean(file.content || file.data || file.bytes || file.buffer),
      locator: sanitizeLocator(file.locator || asset.locator || null),
      referencedBy: Object.freeze(references.get(normalizePath(asset.path)) || []),
      analysis: Object.freeze({
        portableSemanticAnalysis: false,
        requiresHostCapability: mediaKind(mimeType, asset.path) === 'image' ? 'multimodal.images' : mediaKind(mimeType, asset.path) === 'pdf' ? 'multimodal.pdf' : 'host-specific'
      })
    });
  });
  const findings = [...(material.findings || [])];
  return Object.freeze({
    schema: PORTABLE_ASSET_INDEX_SCHEMA_ID,
    boundary: Object.freeze({
      receivedCodeExecution: false,
      automaticSemanticAnalysis: false,
      localAssetIsNotRemoteSource: true
    }),
    assets: Object.freeze(assets),
    counts: Object.freeze({
      total: assets.length,
      images: assets.filter((asset) => asset.mediaKind === 'image').length,
      pdfs: assets.filter((asset) => asset.mediaKind === 'pdf').length,
      referenced: assets.filter((asset) => asset.referencedBy.length).length,
      contentAvailable: assets.filter((asset) => asset.contentAvailable).length
    }),
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
}

export function preparePortableAssetAnalysis(input = {}, options = {}) {
  const index = inspectPortableAssets(input, options);
  const path = normalizePath(input.assetPath || input.path || options.assetPath || '');
  const asset = index.assets.find((entry) => normalizePath(entry.path) === path || normalizePath(entry.path).endsWith(path));
  const discovery = discoverPortableHostCapabilities(input.host || input, options.host || options);
  const findings = [...(index.findings || []), ...(discovery.findings || [])];
  if (!asset) findings.push(portableFinding('error', 'portable.asset-analysis.asset.not-found', 'Requested asset was not found in supplied material.', { ref: path }));
  const capability = asset?.mediaKind === 'image' ? 'images' : asset?.mediaKind === 'pdf' ? 'pdf' : '';
  const supported = Boolean(asset && capability && discovery.profile.capabilities.multimodal[capability]);
  if (asset && !capability) findings.push(portableFinding('warning', 'portable.asset-analysis.media.unsupported', 'Portable tooling cannot identify a standard multimodal analysis capability for this asset type.', { ref: asset.path, mimeType: asset.mimeType }));
  if (asset && capability && !supported) findings.push(portableFinding('warning', 'portable.asset-analysis.host-capability.unavailable', 'The host profile does not expose the required multimodal capability.', { ref: asset.path, capability: `multimodal.${capability}` }));

  const request = asset ? Object.freeze({
    schema: PORTABLE_ASSET_ANALYSIS_REQUEST_SCHEMA_ID,
    status: supported ? 'host-action-ready' : 'host-capability-required',
    asset: Object.freeze({
      path: asset.path,
      mimeType: asset.mimeType,
      mediaKind: asset.mediaKind,
      size: asset.size,
      locator: asset.locator,
      contentAvailable: asset.contentAvailable,
      referencedBy: asset.referencedBy
    }),
    requiredCapability: capability ? `multimodal.${capability}` : 'host-specific',
    hostAction: Object.freeze({
      sequence: Object.freeze([
        ...(asset.contentAvailable ? [] : ['materialize-or-extract-asset-by-path']),
        capability === 'image' ? 'open-image-with-host-vision' : capability === 'pdf' ? 'open-or-render-pdf-with-host-reader' : 'select-host-specific-reader',
        'return-analysis-as-explicit-result',
        'do-not-promote-analysis-to-evidence-without-human-intent'
      ]),
      ingestResultAs: Object.freeze({
        schema: 'tiinex.portable.asset-analysis-response.v1',
        assetPath: asset.path,
        description: '<host-generated description>',
        observations: Object.freeze(['<bounded observation>']),
        qualification: Object.freeze({ mode: 'host-multimodal', sourceAssetPreserved: true, analysisIsNotSourceMaterial: true })
      })
    }),
    boundary: Object.freeze({
      assetRemainsLocalUnlessExplicitlyPublished: true,
      analysisDoesNotAlterAsset: true,
      analysisIsInterpretationNotEmbeddedProvenance: true
    })
  }) : null;
  return Object.freeze({
    schema: 'tiinex.portable.asset-analysis-preparation.v1',
    status: request?.status || 'blocked',
    request,
    host: discovery.profile,
    findings: Object.freeze(findings),
    findingSummary: summarizePortableFindings(findings)
  });
}

function buildReferenceIndex(records = []) {
  const map = new Map();
  for (const record of records) {
    const markdown = String(record.markdown || '');
    const re = /!?\[[^\]]*\]\(([^)]+)\)/g;
    for (const match of markdown.matchAll(re)) {
      const target = normalizeReferenceTarget(match[1]);
      if (!target || /^https?:\/\//i.test(target)) continue;
      const resolved = resolveRelative(record.path || '', target);
      if (!map.has(resolved)) map.set(resolved, []);
      map.get(resolved).push(Object.freeze({ recordId: record.id, path: record.path, target }));
    }
  }
  return map;
}

function resolveRelative(recordPath, target) {
  const base = normalizePath(recordPath).split('/');
  base.pop();
  const parts = [...base, ...normalizePath(target).split('/')];
  const out = [];
  for (const part of parts) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}

function normalizeReferenceTarget(value = '') {
  return String(value || '').trim().replace(/^<|>$/g, '').split(/[?#]/)[0];
}

function inferMimeType(path = '', explicit = '') {
  if (explicit) return explicit;
  const lower = String(path || '').toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (/\.jpe?g$/.test(lower)) return 'image/jpeg';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (lower.endsWith('.svg')) return 'image/svg+xml';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  if (lower.endsWith('.mp4')) return 'video/mp4';
  return 'application/octet-stream';
}

function mediaKind(mimeType = '', path = '') {
  if (String(mimeType).startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf' || String(path).toLowerCase().endsWith('.pdf')) return 'pdf';
  if (String(mimeType).startsWith('video/')) return 'video';
  return 'binary';
}

function sanitizeLocator(locator) {
  if (!locator || typeof locator !== 'object') return null;
  return Object.freeze({
    kind: String(locator.kind || ''),
    archivePath: String(locator.archivePath || ''),
    entryPath: normalizePath(locator.entryPath || ''),
    localPath: String(locator.localPath || '')
  });
}

function normalizePath(value = '') { return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '').replace(/\/+/g, '/'); }
