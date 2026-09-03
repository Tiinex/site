import { preparePlaythingsSnapshot } from './playthings.prepare.js';

self.onmessage = (event) => {
  const requestId = String(event?.data?.requestId || '');
  const workspaces = Array.isArray(event?.data?.workspaces) ? event.data.workspaces : [];
  try {
    const snapshot = preparePlaythingsSnapshot(workspaces, ({ value, label }) => self.postMessage({ type: 'progress', requestId, value, label }));
    self.postMessage({ type: 'ready', requestId, value: 100, label: 'Entering Playthings', snapshot });
  } catch (error) {
    self.postMessage({ type: 'error', requestId, message: String(error?.message || error || 'Playthings preparation failed') });
  }
};
