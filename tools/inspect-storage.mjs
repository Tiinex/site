#!/usr/bin/env node
import { readFileSync } from 'node:fs';
const persistence = readFileSync(new URL('../src/workspaces/workspace.persistence.js', import.meta.url), 'utf8');
const app = readFileSync(new URL('../src/app/TiinexApp.jsx', import.meta.url), 'utf8');
const failures = [];
if (!persistence.includes('tiinex.site.workspaceState.v1')) failures.push('missing workspace storage key');
if (!persistence.includes('#state=')) failures.push('missing URL hash state prefix');
if (!persistence.includes('writeState')) failures.push('missing state writer');
if (!persistence.includes('readInitialState')) failures.push('missing restore path');
if (!app.includes('persistence?.resolveInitialState')) failures.push('React runtime must use semantic persistence resolveInitialState');
if (app.includes('localStorage.getItem')) failures.push('React runtime must not direct-bootstrap from localStorage');
if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log('✓ storage scan passed for v119 React hash/local-storage workspace lifecycle');
