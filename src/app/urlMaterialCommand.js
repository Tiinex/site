import { materializeExplicitUrls } from '../adapters/static/static.adapter.js';

export async function runExplicitUrlMaterialImportCommand(input = {}) {
  const lifecycle = input.lifecycle;
  const state = input.state;
  const workspaceId = String(input.workspaceId || state?.activeWorkspaceId || '').trim();
  const urls = Array.isArray(input.urls) ? input.urls.map((url) => String(url || '').trim()).filter(Boolean) : String(input.urlText || '').split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (!urls.length) return { ok: false, error: 'url.required', state, notice: 'Paste at least one URL.' };
  try {
    const adapterResult = await materializeExplicitUrls(urls, { fetchImpl: input.fetchImpl });
    if (!adapterResult.records.length) return { ok: false, error: 'url.material.empty', state, notice: `No URLs could be loaded${adapterResult.errors?.length ? '; check CORS/source availability.' : '.'}`, adapterResult };
    const result = lifecycle?.addWorkspaceRecords?.(state, workspaceId, adapterResult.records);
    if (!result?.ok) return { ok: false, error: result?.error || 'url.material.add.failed', state, notice: 'Could not add URL material.', adapterResult };
    return {
      ok: true,
      state: result.state,
      records: result.records || [],
      adapterResult,
      notice: `Added ${result.records.length} URL artifact${result.records.length === 1 ? '' : 's'}${adapterResult.errors?.length ? `; ${adapterResult.errors.length} failed` : ''}.`
    };
  } catch (exception) {
    return { ok: false, error: 'url.material.exception', exception, state, notice: 'Could not load URL material.' };
  }
}
