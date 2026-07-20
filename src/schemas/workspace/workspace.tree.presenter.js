import { workspacePresent } from './workspace.presenter.js';
export function presentWorkspaceTree(workspace, context = {}) { return { ...workspacePresent(workspace, context), surface: 'tree' }; }
