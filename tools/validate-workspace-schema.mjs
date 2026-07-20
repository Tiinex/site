#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/, '');
const schema = readFileSync(join(root, '.topics/.schemas/tiinex.workspace.v1.schema.md'), 'utf8');
const workspace = readFileSync(join(root, '.topics/.workspaces/viewer.workspace.md'), 'utf8');
const parser = readFileSync(join(root, 'src/workspaces/workspace.config.js'), 'utf8');
const failures = [];

const schemaRequired = [
  'Schema Origins', 'Browser Title', 'Public Viewer URL', 'Workspace Home',
  'Repo Files Discovery', 'Issue Discovery', 'Issue URL', 'Trust Role', 'Purpose',
  'canonical-core', 'viewer-extension'
];
const workspaceRequired = [
  '## Schema Origins', 'Browser Title', 'Public Viewer URL', 'Workspace Home',
  'Repo Files Discovery', 'Issue Discovery', 'Issue URL', 'Trust Role', 'Purpose'
];
const parserRequired = [
  'schemaOrigins', 'publicViewerUrl', 'workspaceHome', 'repoFilesDiscovery', 'issueDiscovery', 'issueUrl'
];
for (const item of schemaRequired) if (!schema.includes(item)) failures.push(`workspace schema does not declare ${item}`);
for (const item of workspaceRequired) if (!workspace.includes(item)) failures.push(`viewer.workspace.md does not use expected ${item}`);
for (const item of parserRequired) if (!parser.includes(item)) failures.push(`workspace parser does not expose ${item}`);

if (!schema.includes('Tiinex/docs') && !schema.includes('Tiinex docs')) failures.push('workspace schema should name canonical core source family');
if (!schema.includes('app-specific schema projections')) failures.push('workspace schema should document viewer-extension companion use');

if (failures.length) {
  console.error(failures.map((f) => `- ${f}`).join('\n'));
  process.exit(1);
}
console.log('✓ workspace schema/config/parser drift guard passed');
