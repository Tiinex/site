import assert from 'node:assert/strict';
import fs from 'node:fs';

const core=fs.readFileSync('src/app/workspaceSelectionSession.js','utf8');
const controller=fs.readFileSync('src/app/useWorkspaceSelectionProductController.jsx','utf8');
const referenceAdapter=fs.readFileSync('src/app/useCanonicalReferenceSelectionOptions.js','utf8');
const placementAdapter=fs.readFileSync('src/app/useCanonicalPlacementSelectionOptions.js','utf8');
const referenceDialog=fs.readFileSync('src/schemas/workspace/workspace.canonicalReferenceDialog.views.jsx','utf8');
const authoring=fs.readFileSync('src/schemas/workspace/workspace.canonicalTaskDialog.views.jsx','utf8');
const selectionView=fs.readFileSync('src/schemas/workspace/workspace.selection.views.jsx','utf8');
const workspaceView=fs.readFileSync('src/schemas/workspace/workspace.views.jsx','utf8');
const cards=fs.readFileSync('src/schemas/workspace/workspace.cards.views.jsx','utf8');
const tree=fs.readFileSync('src/schemas/workspace/workspace.tree.views.jsx','utf8');
const app=fs.readFileSync('src/app/TiinexApp.jsx','utf8');
const authoringValues=fs.readFileSync('src/app/canonicalAuthoringValues.js','utf8');
const productPreparation=fs.readFileSync('src/transitions/transition.productPreparation.js','utf8');

// A — opaque role/candidate transport.
assert.equal(core.includes('WorkspaceSelectionRole'),false,'picker core has no closed role registry');
assert.equal(core.includes('labelForRole'),false,'picker core owns no role-specific title mapping');
assert.equal(core.includes("candidate.kind === 'folder'"),false,'picker core does not synthesize identity by candidate semantic kind');
assert(core.includes('candidate?.key'),'candidate identity is exact caller-supplied transport');
assert(fs.readFileSync('src/app/workspaceSelectionSession.test.mjs','utf8').includes("role:'transition-input:A'"),'synthetic future role is proved without core edit');

// B — generic controller is orchestration-only; semantic qualification stays in callers/adapters.
assert.equal(controller.includes('canonicalReferenceTargetOptions'),false);
assert.equal(controller.includes('workspacePlacementOptions'),false);
assert(controller.includes('createWorkspaceSelectionSession'));
assert(controller.includes('workspaceSelectionResult'));
assert(referenceAdapter.includes('canonicalReferenceTargetOptions'));
assert(placementAdapter.includes('workspacePlacementOptions'));
assert(referenceDialog.includes("CANONICAL_REFERENCE_SELECTION_ROLE = 'reference-target'"));
assert(authoring.includes("CANONICAL_STORAGE_PLACEMENT_SELECTION_ROLE = 'storage-placement'"));
assert(authoring.includes("CANONICAL_CONTINUITY_PARENT_SELECTION_ROLE = 'continuity-parent'"));

// C — selection traversal is an ambient presentation transaction, not permanent workspace focus.
assert(app.includes('captureWorkspaceSelectionOriginContext'));
assert(app.includes('restoreWorkspaceSelectionOriginContext'));
assert(app.includes("if (!selection.session && !itemActive) activateWorkspace(workspace.id)"),'workspace-frame activation is suppressed while selecting');
assert(fs.readFileSync('src/app/canonicalCreationProductSettlement.js','utf8').includes('stateWithWorkspaceViewPatchAndFocus'),'successful Reference/create settlement explicitly focuses the subject/result workspace');

// D — selection decorates existing workspace surfaces instead of replacing them with a semantic list model.
assert.equal(selectionView.includes('session?.candidates'),false,'selection banner owns no parallel candidate list');
assert(workspaceView.includes('selectionCandidates={selectionCandidates}'));
assert(workspaceView.includes('onSelectCandidate={onSelectionChoose}'));
assert(cards.includes('selectionCandidate'));
assert(cards.includes('>Select</Button>'));
assert(tree.includes('selectionByFolderPath'));
assert(tree.includes('Select folder'));

// E — no universal required-string trimming; canonical Topic/Task materializers own representation-local normalization.
assert.equal(authoringValues.includes('.trim()'),false,'generic authoring submission does not mutate arbitrary caller strings');
assert(fs.readFileSync('src/schemas/core/topic/tiinex.topic.v1.localMaterialization.js','utf8').includes('canonicalSection'));
assert(fs.readFileSync('src/schemas/core/task/tiinex.task.v1.localMaterialization.js','utf8').includes('canonicalSection'));
assert(fs.readFileSync('src/app/canonicalAuthoringValues.test.mjs','utf8').includes('opaque/multiline exact-style input'));

// F — authoring field names are not action-icon semantic authority.
assert.equal(productPreparation.includes("includes('Interpretation Action')"),false);

// Scaling — real owner extraction creates meaningful headroom.
assert(app.split(/\r?\n/).length < 840,`TiinexApp should retain material headroom after v451 extraction, got ${app.split(/\r?\n/).length}`);
assert(app.includes('createCanonicalCreationProductController'));

console.log('post-v451 v450 human-product architecture correction: PASS');
