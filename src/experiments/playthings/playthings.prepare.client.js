import { compactPlaythingsWorkspacesCooperatively, preparePlaythingsSnapshot } from './playthings.prepare.js';

export async function preparePlaythingsSnapshotAsync(workspaces = [], onProgress = null) {
  const compact = await compactPlaythingsWorkspacesCooperatively(workspaces, onProgress, yieldToBrowser);
  if (typeof Worker === 'undefined') return prepareFallback(compact, onProgress);
  return new Promise((resolve, reject) => {
    const requestId = `pt-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const worker = new Worker(new URL('./playthings.worker.js', import.meta.url), { type: 'module', name: 'tiinex-playthings-projection' });
    const finish = () => worker.terminate();
    worker.onmessage = (event) => {
      const message = event?.data || {};
      if (String(message.requestId || '') !== requestId) return;
      if (message.type === 'progress') { onProgress?.({ value: Math.max(10, Number(message.value || 0)), label: String(message.label || '') }); return; }
      if (message.type === 'ready') { onProgress?.({ value: 100, label: String(message.label || 'Ready') }); finish(); resolve(message.snapshot); return; }
      if (message.type === 'error') { finish(); reject(new Error(message.message || 'Playthings preparation failed')); }
    };
    worker.onerror = (event) => { finish(); reject(event?.error || new Error(event?.message || 'Playthings worker failed')); };
    worker.postMessage({ requestId, workspaces: compact });
  });
}

async function prepareFallback(compact, onProgress) {
  // Unsupported browsers still paint the Verse shell first and yield between
  // preparation boundaries. Current browsers use the worker above, keeping
  // lineage/world generation entirely off the UI thread.
  await yieldToBrowser();
  return preparePlaythingsSnapshot(compact, onProgress);
}
function yieldToBrowser() {
  if (typeof globalThis !== 'undefined' && typeof globalThis.scheduler?.yield === 'function') return globalThis.scheduler.yield();
  return new Promise((resolve) => setTimeout(resolve, 0));
}
