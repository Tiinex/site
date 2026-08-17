import { useState } from 'react';
import { makePastedTraceFile, runLocalMaterialImportCommand } from './localMaterialCommand.js';

export function useLocalMaterialIntake({ getLifecycle, getState, getPersistenceOwnership = null, workspaceId = '', setNotice, setDialog, commit, windowObj = null } = {}) {
  const [pendingLocalImport, setPendingLocalImport] = useState(null);

  async function addLocalFiles(fileList, options = {}, preparedAdapterResult = null) {
    const targetWorkspaceId = String(options.workspaceId || workspaceId || '').trim();
    const passwordProvider = options.passwordProvider || passwordProviderForWindow(windowObj);
    const commandOptions = Object.assign({}, options, { passwordProvider });
    const result = await runLocalMaterialImportCommand({
      lifecycle: getLifecycle?.(),
      state: getState?.(),
      workspaceId: targetWorkspaceId,
      fileList,
      adapterResult: preparedAdapterResult,
      options: commandOptions,
      persistenceOwnership: getPersistenceOwnership?.() || null
    });
    if (result.exception) console.error(result.exception);
    if (result.error === 'import.conflict.requires-resolution') {
      setPendingLocalImport({ fileList: Array.from(fileList || []), adapterResult: result.adapterResult, options: Object.assign({}, commandOptions, { workspaceId: targetWorkspaceId }), conflicts: result.conflicts || [] });
      setDialog?.('import-conflict');
      setNotice?.('');
      return false;
    }
    if (!result.ok) {
      setNotice?.(result.notice || 'Could not add selected material.');
      return false;
    }
    setPendingLocalImport(null);
    setDialog?.(null);
    setNotice?.(result.notice || 'Import completed.');
    commit?.(result.state, 'push');
    return true;
  }

  async function resolveLocalImportConflict(resolution) {
    const pending = pendingLocalImport;
    if (!pending) {
      setDialog?.(null);
      return false;
    }
    if (resolution === 'cancel') {
      setPendingLocalImport(null);
      setDialog?.('add-to-workspace');
      return false;
    }
    return addLocalFiles(pending.fileList, Object.assign({}, pending.options, { conflictResolution: resolution }), pending.adapterResult);
  }

  function addPastedTrace(text) {
    const file = makePastedTraceFile(text);
    if (!file) {
      setNotice?.('Clipboard text does not look like Tiinex trace Markdown.');
      return false;
    }
    void addLocalFiles([file], { sourceMode: 'pasted-trace' });
    return true;
  }

  return { addLocalFiles, resolveLocalImportConflict, addPastedTrace, pendingLocalImport };
}

export function passwordProviderForWindow(windowObj = null) {
  if (!windowObj?.prompt) return undefined;
  return async (file) => windowObj.prompt(`Password for ${file?.name || 'password-protected zip'}`) || '';
}
