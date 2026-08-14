import { useState } from 'react';
import { runWorkspaceEntrypointIntakeCommand } from './workspaceEntrypointIntakeCommand.js';
import { passwordProviderForWindow } from './useLocalMaterialIntake.js';

export function useWorkspaceEntrypointIntake({
  getLifecycle,
  getState,
  parseWorkspaceConfig,
  setNotice,
  setDialog,
  commit,
  materializeSource,
  windowObj = null
} = {}) {
  const [pendingWorkspaceEntrypoint, setPendingWorkspaceEntrypoint] = useState(null);

  async function handleGlobalWorkspaceDrop(fileList, options = {}) {
    const result = await runWorkspaceEntrypointIntakeCommand({
      lifecycle: getLifecycle?.(),
      state: getState?.(),
      parseWorkspaceConfig,
      fileList,
      options: Object.assign({}, options, { passwordProvider: options.passwordProvider || passwordProviderForWindow(windowObj) })
    });
    if (result.requiresChoice) {
      setPendingWorkspaceEntrypoint({ adapterResult: result.adapterResult, workspaceEntries: result.workspaceEntries || [], options });
      setDialog?.('workspace-entrypoint-choice');
      setNotice?.('');
      return false;
    }
    return finalizeWorkspaceEntrypointResult(result);
  }

  async function resolveWorkspaceEntrypointChoice(mode = '') {
    const pending = pendingWorkspaceEntrypoint;
    if (!pending) {
      setDialog?.(null);
      return false;
    }
    if (mode === 'cancel') {
      setPendingWorkspaceEntrypoint(null);
      setDialog?.(null);
      return false;
    }
    const result = await runWorkspaceEntrypointIntakeCommand({
      lifecycle: getLifecycle?.(),
      state: getState?.(),
      parseWorkspaceConfig,
      adapterResult: pending.adapterResult,
      mode,
      options: pending.options || {}
    });
    return finalizeWorkspaceEntrypointResult(result);
  }

  async function finalizeWorkspaceEntrypointResult(result = {}) {
    if (!result?.ok) {
      setNotice?.(result.notice || result.message || 'Could not apply workspace entrypoint.');
      return false;
    }
    setPendingWorkspaceEntrypoint(null);
    setDialog?.(null);
    setNotice?.(result.notice || 'Workspace entrypoint applied.');
    commit?.(result.state, 'push');
    let materialState = result.state;
    for (const sourceInput of result.sourceInputs || []) {
      const loaded = await materializeSource?.(sourceInput, { state: materialState, workspaceId: sourceInput.workspaceId || '' });
      if (loaded?.state) materialState = loaded.state;
    }
    return true;
  }

  return { handleGlobalWorkspaceDrop, resolveWorkspaceEntrypointChoice, pendingWorkspaceEntrypoint };
}
