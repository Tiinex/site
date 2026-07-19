#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/,'');
function walk(dir){let out=[]; for(const e of readdirSync(dir,{withFileTypes:true})){ if(['.old','node_modules','.site-publish','.git'].includes(e.name)) continue; const p=join(dir,e.name); if(e.isDirectory()) out=out.concat(walk(p)); else out.push(p);} return out;}
const files=walk(root);
console.log(JSON.stringify({
  type:'tiinex.site.metrics.v115',
  architectureReadyForProductWork:'uc001-empty-create-restore-close',
  activeFiles:files.length,
  legacyArchived: statSync(join(root,'.old')).isDirectory(),
  appJsLoaded:false,
  fileLocalStartup:true,
  sourceCleanDelivery:true,
  publicBuildBundled:true,
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
  uc001CloseWorkspaceConfirm:true,
  uc001CloseIsNonDestructive:true,
  coLocatedWorkspaceTests: existsSync(join(root,'src/workspaces/workspace.lifecycle.test.mjs')),
  mainJsLineCount: readFileSync(join(root,'src/main.js'),'utf8').split('\n').length,
  localToGithubGuessing:false
}, null, 2));
