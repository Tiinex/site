import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createPersistenceOwnershipPolicy, PersistenceRouteOwner } from '../app/persistenceOwnership.js';
import { executeCanonicalTransitionLocalCreate } from '../app/canonicalTransitionLocalCreateCommand.js';
import { canonicalC14nV2SelfState } from '../integrity/integrity.c14nV2.js';
import { CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST } from '../transitions/canonicalTransition.schemaCache.js';
import { prepareCanonicalTransitionProductActions, prepareCanonicalTransitionWorkspaceActions } from '../transitions/transition.productPreparation.js';
import '../workspaces/workspace.persistenceRecovery.js';
import '../workspaces/workspace.persistenceRouteCache.js';
import '../workspaces/workspace.persistencePresentation.js';
import '../workspaces/workspace.persistenceClear.js';
import '../workspaces/workspace.persistence.js';
import '../workspaces/workspace.lifecycle.js';

const lifecycle=globalThis.TiinexWorkspaceLifecycle, persistence=globalThis.TiinexWorkspacePersistence;
const ownership=createPersistenceOwnershipPolicy(PersistenceRouteOwner.semanticState);
const cachePaths={
 'tiinex.root.v1':'src/transitions/canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.root.v1.schema.md',
 'tiinex.transition.definition.v1':'src/transitions/canonical-schema-cache/d69b8ff55a56b8cb9282b8684db6a938a4435b94/tiinex.transition.definition.v1.schema.md',
 'tiinex.task.v1':'src/schemas/core/task/tiinex.task.v1.schema.md',
 'tiinex.topic.v1':'src/transitions/canonical-schema-cache/52ecdea0a75893882ce282214d155f70e1309c2a/tiinex.topic.v1.schema.md',
 'tiinex.interpretation.v1':'src/schemas/core/interpretation/tiinex.interpretation.v1.schema.md',
 'tiinex.relation.v1':'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.relation.v1.schema.md',
 'tiinex.schema.contract.v1':'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.contract.v1.schema.md',
 'tiinex.schema.generation.v1':'src/transitions/canonical-schema-cache/053d46ce082d4ec261b82abc44ecca403d61e240/tiinex.schema.generation.v1.schema.md'
};
const schemaCache=CANONICAL_TRANSITION_SCHEMA_CACHE_MANIFEST.map((item)=>({...item,markdown:fs.readFileSync(cachePaths[item.schemaId],'utf8'),sourceQualification:'source-qualified-cache'}));
function bundled(path,title,sourceQualification='site-local-definition-source-qualified'){return Object.freeze({path,title,markdown:fs.readFileSync(path,'utf8'),sourceQualification,sourceMode:'bundled-canonical-transition-definition',source:Object.freeze({id:`site:${path}`,adapterId:'static',sourceKind:'bundled-canonical',sourceMode:'bundled-canonical-transition-definition',sourceArtifactPath:path})});}
const definitions=Object.freeze([
 bundled('src/schemas/core/task/.transitions/topic-to-task-transition-definition.trace.md','Topic to Task','compiled-semantic-package-qualified'),
 bundled('src/schemas/core/interpretation/.transitions/evidence-to-interpretation-transition-definition.trace.md','Evidence to Interpretation'),
 bundled('src/schemas/core/relation/.transitions/topic-references-task-transition-definition.trace.md','Topic references Task'),
 bundled('src/schemas/core/topic/.transitions/create-topic-transition-definition.trace.md','Create standalone Topic'),
 bundled('src/schemas/core/task/.transitions/create-task-transition-definition.trace.md','Create standalone Task')
]);
const state={version:1,activeWorkspaceId:'w',view:{universe:'column',workspaceVerse:'feed',reader:'scan',query:''},workspaces:[{id:'w',name:'Workspace',title:'Workspace',createdAt:'2026-08-20T00:00:00.000Z',kind:'workspace',source:{id:'local',adapterId:'local',kind:'local-session'},sources:[],sourceOrder:[],records:[],assets:[],importLog:[],mode:'feed'}],audit:null};
const workspaceActions=prepareCanonicalTransitionWorkspaceActions({workspaceId:'w',schemaCache,bundledDefinitions:definitions});
const createTopic=workspaceActions.actions.find((a)=>a.canonicalIdentifier==='tiinex.site.create-topic.v1');
const createTask=workspaceActions.actions.find((a)=>a.canonicalIdentifier==='tiinex.site.create-task.v1');
assert.equal(createTopic.icon,'create'); assert.equal(createTask.icon,'create');

// Q-reported valid-looking Topic failure: canonical Topic materialization owns representation-local whitespace normalization; generic authoring values remain untouched.
const topic=executeCanonicalTransitionLocalCreate({lifecycle,state,workspaceId:'w',currentRecordId:'',definitionKey:createTopic.definitionKey,values:{Summary:'  Standalone Topic  ','Current Read':'  Current state\n','Design Direction':' Move here  ','Next Artifacts':' One task   '},placementFolder:'.topics/research',schemaCache,bundledDefinitions:definitions,persistenceOwnership:ownership,clock:()=> '2026-08-20T10:00:00.000Z'});
assert.equal(topic.ok,true,topic.notice);
assert.equal(topic.record.title,'Standalone Topic');
assert.match(topic.record.path,/^\.topics\/research\/standalone-topic--topic(?:-\d+)?\.trace\.md$/);
assert.equal(topic.placement.mode,'explicit-same-workspace-folder');
assert.equal(topic.placement.folder,'.topics/research');
assert.equal(canonicalC14nV2SelfState(topic.record.markdown).state,'verified');

// Parent semantics remain canonical while only the storage coordinate changes.
const prep=prepareCanonicalTransitionProductActions({currentRecord:topic.record,workspaceRecords:topic.workspace.records,workspaceId:'w',schemaCache,bundledDefinitions:definitions});
const cont=prep.actions.find((a)=>a.canonicalIdentifier==='tiinex.site.topic-to-task.v1');
const reference=prep.actions.find((a)=>a.canonicalIdentifier==='tiinex.site.topic-references-task.v1');
assert.equal(cont.icon,'continue'); assert.equal(reference.icon,'reference');
const task=executeCanonicalTransitionLocalCreate({lifecycle,state:topic.state,workspaceId:'w',currentRecordId:topic.record.id,definitionKey:cont.definitionKey,values:{Summary:'Placed Task',Objective:'Do it','Done Criteria':'Done',Scope:'Local',Dependencies:'None'},placementFolder:'.topics/research/tasks',schemaCache,bundledDefinitions:definitions,persistenceOwnership:ownership,clock:()=> '2026-08-20T10:01:00.000Z'});
assert.equal(task.ok,true,task.notice);
assert.match(task.record.path,/^\.topics\/research\/tasks\//);
assert.equal(task.record.parentSchemaId,'tiinex.topic.v1');
assert.ok(task.record.trace || task.record.origin, 'canonical Parent representation remains present');
assert.equal(task.record.sourceTarget,undefined);

// Exact placement survives durable workspace persistence/reopen as ordinary path truth.
const env=memoryEnv(); persistence.writeState(task.state,{storage:env.storage,location:env.location,history:env.history,mode:'replace'}); const reopened=persistence.readRecoverableLocalState(env.storage);
assert.equal(reopened.workspaces[0].records.find((r)=>r.id===task.record.id).path,task.record.path);

// Product shape: one generic selection session drives Reference / fixed Parent review / storage placement; dialogs yield while selection is active.
const authoring=fs.readFileSync('src/schemas/workspace/workspace.canonicalTaskDialog.views.jsx','utf8');
const referenceDialog=fs.readFileSync('src/schemas/workspace/workspace.canonicalReferenceDialog.views.jsx','utf8');
const surface=fs.readFileSync('src/schemas/workspace/workspace.selection.views.jsx','utf8');
assert(authoring.includes("CANONICAL_STORAGE_PLACEMENT_SELECTION_ROLE = 'storage-placement'"));
assert(authoring.includes("CANONICAL_CONTINUITY_PARENT_SELECTION_ROLE = 'continuity-parent'"));
assert(referenceDialog.includes("CANONICAL_REFERENCE_SELECTION_ROLE = 'reference-target'"));
assert(authoring.includes('return null'));
assert(referenceDialog.includes('return null'));
assert(surface.includes('Existing workspace context remains visible while selection is active'));
assert.equal(surface.includes('session?.candidates'),false,'selection banner no longer owns a parallel generic candidate list');
assert.equal(authoring.includes("schemaId === 'tiinex.task.v1'"),false);
assert.equal(referenceDialog.includes("canonicalIdentifier ==="),false);

console.log('post-v450 M0 product acceptance hardening: PASS');
function memoryEnv(){const map=new Map();const location={pathname:'/index.html',search:'',hash:''};const history={replaceState:(_a,_b,url)=>{location.hash=url.includes('#')?`#${url.split('#').pop()}`:'';},pushState:(_a,_b,url)=>{location.hash=url.includes('#')?`#${url.split('#').pop()}`:'';}};const storage={getItem:(k)=>map.get(k)||null,setItem:(k,v)=>map.set(k,String(v)),removeItem:(k)=>map.delete(k)};return{map,location,history,storage};}
