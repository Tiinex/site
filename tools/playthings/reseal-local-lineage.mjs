#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { canonicalC14nV2SelfState, sealC14nV2Self } from '../../src/integrity/integrity.c14nV2.js';

const root = path.resolve(process.argv[2] || '.');
function walk(d){ let out=[]; for(const e of fs.readdirSync(d,{withFileTypes:true})){ const p=path.join(d,e.name); if(e.isDirectory()) out=out.concat(walk(p)); else if(/\.(trace|workspace)\.md$/i.test(e.name)) out.push(p); } return out; }
function digestOf(p){ const s=canonicalC14nV2SelfState(fs.readFileSync(p,'utf8')); return ['verified','mismatch','prepared'].includes(s.state) ? s.computedValue : ''; }
function updateTargetValues(p,text){
  const lines=text.replace(/\r\n/g,'\n').replace(/\r/g,'\n').split('\n');
  let changed=false;
  for(let i=0;i<lines.length;i++){
    const m=lines[i].match(/^\s*-\s+Towards:\s+\[[^\]]+\]\(([^)]+)\)\s*$/);
    if(!m) continue;
    const target=m[1].trim();
    if(!target || /^[a-z]+::/i.test(target) || /^[a-z]+:\/\//i.test(target) || target.startsWith('#')) continue;
    const abs=path.resolve(path.dirname(p),target.split('#')[0]);
    if(!fs.existsSync(abs) || !fs.statSync(abs).isFile()) continue;
    const d=digestOf(abs); if(!d) continue;
    for(let j=i+1;j<Math.min(lines.length,i+5);j++){
      const v=lines[j].match(/^(\s+-\s+Value:)\s*(.*)$/);
      if(v){ const nl=`${v[1]} ${d}`; if(lines[j]!==nl){ lines[j]=nl; changed=true; } break; }
      if(/^\s*-\s+Towards:/.test(lines[j])) break;
    }
  }
  return { text: lines.join('\n'), changed };
}
const files=walk(path.join(root,'.topics'));
let totalWrites=0;
for(let pass=0; pass<20; pass++){
  let writes=0;
  for(const p of files){
    let text=fs.readFileSync(p,'utf8');
    const upd=updateTargetValues(p,text); text=upd.text;
    const s=sealC14nV2Self(text);
    if(s.state!=='sealed') continue;
    const next=s.markdown+'\n';
    if(next!==fs.readFileSync(p,'utf8')){ fs.writeFileSync(p,next); writes++; }
  }
  totalWrites+=writes;
  if(!writes){ console.log(JSON.stringify({status:'stable',passes:pass+1,totalWrites,files:files.length},null,2)); process.exit(0); }
}
console.error(JSON.stringify({status:'unstable',totalWrites},null,2)); process.exit(2);
