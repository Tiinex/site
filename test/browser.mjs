import {mountTiinexApp} from '@tiinex/app/viewer';
import {createPlaythingsVerse} from '@tiinex/playthings/app';
const markdown=(title,time,parent='')=>`# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n${parent?'- Parent\n  - Parent Schema: tiinex.task.v1\n  - Trace: '+parent+'\n':''}- Current\n  - Current Schema: tiinex.task.v1\n  - Created At: ${time}\n  - Authors: Anchor\n  - Summary: ${title}\n\n---\n\n# ${title}\n`;
const workspaces=[{id:'browser-fixture',title:'Integration fixture',records:[{path:'.topics/parent.trace.md',markdown:markdown('Parent fixture','2026-09-08 10:00:00')},{path:'.topics/child.trace.md',markdown:markdown('Child fixture','2026-09-08 10:01:00','parent.trace.md')}],assets:[],sources:[]}];
mountTiinexApp(document.getElementById('root'),{deploymentId:'integration-fixture',verses:[createPlaythingsVerse()],workspaces});
