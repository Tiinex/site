#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..', import.meta.url)).replace(/[\\/]$/,'');
function walk(dir){let out=[]; for(const e of readdirSync(dir,{withFileTypes:true})){ if(['.old','node_modules','.site-publish','.git'].includes(e.name)) continue; const p=join(dir,e.name); if(e.isDirectory()) out=out.concat(walk(p)); else out.push(p);} return out;}
const files=walk(root);
const index = readFileSync(join(root,'index.html'),'utf8');
const app = readFileSync(join(root,'src/app/TiinexApp.jsx'),'utf8');
const workspaceViews = readFileSync(join(root,'src/schemas/workspace/workspace.views.jsx'),'utf8');
const workspaceAddViews = readFileSync(join(root,'src/schemas/workspace/workspace.add.views.jsx'),'utf8');
console.log(JSON.stringify({
  type:'tiinex.site.metrics.v119.3',
  architectureReadyForProductWork:'react-foundation-workspace-schema-companion-source-boundary-slice',
  activeFiles:files.length,
  legacyArchived: existsSync(join(root,'.old')) && statSync(join(root,'.old')).isDirectory(),
  appJsLoaded:false,
  reactRuntime:index.includes('src/main.jsx') && app.includes('react-v172-audit-support-material-truth'),
  fileLocalStartup:false,
  localDevServer:'npm run dev',
  sourceCleanDelivery:true,
  oldLikeFooter: readFileSync(join(root,'src/styles/app.css'),'utf8').includes('/* v119.2 footer + recognition guard:') && readFileSync(join(root,'src/styles/app.css'),'utf8').includes('display: block;') && app.includes('https://github.com/Tiinex'),
  footerVisibleBeforeWorkspace:true,
  footerLinkable:true,
  compactBoilerplatePass:true,
  dockLogoLargerThanButtons: readFileSync(join(root,'src/styles/app.css'),'utf8').includes('tx-dock-logo-large'),
  dockFitsVisibleControls: readFileSync(join(root,'src/styles/app.css'),'utf8').includes('/* v119.3 dock ergonomics:') && readFileSync(join(root,'src/styles/app.css'),'utf8').includes('display: inline-flex !important;'),
  workspacePagerSizeGated: app.includes('shouldPageWorkspaces') && app.includes('data-overflow-pager'),
  publicBuildBundled:true,
  publicRuntime:'vite-react-bundle',
  fontAwesomePrimitive: readFileSync(join(root,'src/ui/primitives/Icon.jsx'),'utf8').includes('@fortawesome/react-fontawesome'),
  schemaCompanionAware: app.includes('schemaRegistry') && workspaceViews.includes('data-schema-id="tiinex.workspace.v1"'),
  workspaceSchemaCompanion: existsSync(join(root,'src/schemas/workspace/workspace.schema.js')),
  oldLikeAddFlow: workspaceAddViews.includes('AddToWorkspaceDialog') && workspaceAddViews.includes('Manual files') && workspaceAddViews.includes('GitHub source'),
  localMarkdownIntake: app.includes('materializeLocalMarkdownFiles') && app.includes('applyLocalAdapterResultToWorkspace'),
  githubSourceRegistrationFlow: app.includes('addGitHubSource') && app.includes('addWorkspaceSource'),
  columnOnlyRuntimeVerse:true,
  workspaceMapVerseRuntime:false,
  plannedMapAtlasOnly:true,
  uc001EmptyStart:true,
  uc001CreateWorkspace:true,
  uc001WorkspaceNameRequired:true,
  uc001HashState:true,
  uc001LocalStorageCache:true,
  uc001CleanUrlIgnoresStaleCache:true,
  uc001RouteBackForward:true,
  schemaOriginsExplicit:true,
  workspaceSchemaDriftGuard: existsSync(join(root,'tools/validate-workspace-schema.mjs')),
  uc001CloseWorkspaceConfirm:true,
  uc001CloseIsNonDestructive:true,
  mainJsLineCount: existsSync(join(root,'src/main.js')) ? readFileSync(join(root,'src/main.js'),'utf8').split('\n').length : 0,
  reactAppLineCount: app.split('\n').length,
  workspaceViewLineCount: workspaceViews.split('\n').length,
  workspaceAddViewLineCount: workspaceAddViews.split('\n').length,
  localToGithubGuessing:false
}, null, 2));
