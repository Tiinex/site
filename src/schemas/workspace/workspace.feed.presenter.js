import { workspacePresent } from './workspace.presenter.js';
export function presentWorkspaceFeed(workspace, context = {}) { return { ...workspacePresent(workspace, context), surface: 'feed' }; }
