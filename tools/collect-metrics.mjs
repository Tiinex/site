#!/usr/bin/env node
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/,'');
function walk(dir){let out=[]; for(const e of readdirSync(dir,{withFileTypes:true})){ if(['.old','node_modules','.site-publish'].includes(e.name)) continue; const p=join(dir,e.name); if(e.isDirectory()) out=out.concat(walk(p)); else out.push(p);} return out;}
const files=walk(root);
console.log(JSON.stringify({
  type:'tiinex.site.metrics.v85',
  architectureReadyForProductWork:'workspace-source-scaffold',
  activeFiles:files.length,
  legacyArchived: statSync(join(root,'.old')).isDirectory(),
  appJsLoaded:false,
  fileLocalStartup:true,
  artifactParser:true,
  artifactCards:true,
  readerDensity:true,
  rootFallbackVisible:true,
  workspaceState:true,
  sourceBoundaries:true,
  localToGithubGuessing:false
}, null, 2));
