await import('./src/sources/source.identity.js');
await import('./src/workspaces/workspace.lifecycle.js');
const l=globalThis.TiinexWorkspaceLifecycle;
let s=l.makeEmptyAppState();
for (let wi=0;wi<3;wi++) { const c=l.createWorkspace(s,{name:`W${wi}`,id:`w${wi}`},{clock:()=>`2026-09-02T20:0${wi}:00.000Z`}); s=c.state; const rows=Array.from({length:80},(_,i)=>({title:`old ${wi}-${i}`,path:`old/${wi}/${i}.md`,markdown:'# A\n'+('x'.repeat(1800))})); s=l.addWorkspaceRecords(s,`w${wi}`,rows).state; }
const incoming=Array.from({length:150},(_,i)=>({title:`new ${i}`,path:`new/${i}.md`,markdown:'# N\n'+('y'.repeat(1800))}));
const t=performance.now(); const r=l.addWorkspaceRecords(s,'w2',incoming); const ms=performance.now()-t;
console.log(JSON.stringify({ok:r.ok,ms:Number(ms.toFixed(1)),workspaces:r.state.workspaces.length,records:r.state.workspaces.find(w=>w.id==='w2').records.length}));
