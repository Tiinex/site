import React from 'react';
import { createRoot } from 'react-dom/client';

import './ui/icon.paths.js';
import './workspaces/workspace.config.js';
import { tiinexBuildIdentity, TIINEX_RUNTIME_ID } from './build.identity.js';
import './sources/source.identity.js';
import './workspaces/workspace.lifecycle.js';
import './workspaces/workspace.route.js';
import './workspaces/workspace.persistence.js';

import './styles/tokens.css';
import './styles/theme.css';
import './styles/responsive.css';
import './styles/app.css';

import { TiinexApp } from './app/TiinexApp.jsx';

const root = document.getElementById('root');
if (!root) throw new Error('Missing #root mount point');

window.TiinexRuntimeIdentity = tiinexBuildIdentity();
document.documentElement.dataset.tiinexRuntime = TIINEX_RUNTIME_ID;

createRoot(root).render(
  <React.StrictMode>
    <TiinexApp />
  </React.StrictMode>
);
