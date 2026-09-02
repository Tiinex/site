import fs from 'node:fs';
import { decodeZipBufferEntries } from './src/adapters/archive/archive.adapter.js';
import { inspectRecipientFacingV2Topology } from './src/tooling/portable/handoff/recipientV2.inspect.js';
const bytes = fs.readFileSync('/mnt/data/tiinex-site-001-1-1-1-1-1-1-1-anchor-to-anchor.handoff-package.zip');
const decoded = await decodeZipBufferEntries(bytes, {source:'test', excludeRepositoryInternals:true});
const inspection = inspectRecipientFacingV2Topology({ files: decoded.entries });
console.log(JSON.stringify({status:inspection.status,detected:inspection.detected,workspaces:inspection.workspaces,routes:inspection.routes?.map(x=>({workspaceId:x.workspaceId,path:x.path,routeId:x.routeId})),findings:inspection.findings?.slice(0,5)},null,2));
