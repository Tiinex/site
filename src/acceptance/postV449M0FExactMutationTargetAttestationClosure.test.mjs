import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (relative) => fs.readFileSync(path.join(root, relative), 'utf8');
const product = read('app/workspaceGithubPublication.js');
const controller = read('schemas/workspace/workspace.exportDialog.controller.jsx');
const view = read('schemas/workspace/workspace.exportDialog.views.jsx');
const receipts = read('workspaces/workspace.publicationReceipts.js');
const targetParser = read('sources/github/github.issueTarget.js');
const sharedResult = read('publication/publication.contract.js');

assert.ok(product.includes('qualifyMutationTarget') && product.includes('parseExactGithubIssueTarget'), 'Site reuses accepted exact GitHub target seam for mutation evidence');
assert.equal(product.includes('WEB_ISSUE_LEXICAL'), false, 'Site publication product does not add a second social URL grammar');
assert.ok(product.includes('mutationTarget: targetQualification.target') && product.includes('githubPublicationHumanMutationAttestation.v2'), 'attestation persists exact qualified target beside exact plan');
const verifyOwner = product.slice(product.indexOf('export async function verifyWorkspaceGithubPublication'));
assert.ok(verifyOwner.indexOf('const targetQualification = qualifyMutationTarget(plan, input.finalTarget)') < verifyOwner.indexOf('readExactGithubIssuePublicationRepresentation(exactTarget'), 'verification qualifies target + attestation before remote read');
assert.ok(controller.includes("'finalTarget'") && controller.includes('mutationAttestation: identityBearing ? null'), 'changing final target invalidates controller attestation state');
assert.ok(controller.includes('confirmWorkspaceGithubPublicationMutation') && controller.includes('finalTarget: publication?.verificationTarget'), 'confirmation binds current exact verification target');
assert.ok(view.includes('!product.mutationTargetQualified') && view.includes('this exact GitHub target'), 'UI cannot attest before exact target qualification and says target-bound truth');
assert.ok(receipts.includes('resultTarget') && receipts.includes('attestedTarget') && receipts.includes('parsedResult.inputTarget !== parsedAttested.inputTarget'), 'durable receipt rejects target-mismatched execution evidence');
assert.ok(targetParser.includes('parseExactGithubIssueTarget') && targetParser.includes('issueNumber'), 'accepted shared exact target parser remains present');
assert.ok(sharedResult.includes('export function buildPublicationResult') && sharedResult.includes('qualifiedSuccess'), 'shared buildPublicationResult remains success authority');
console.log('postV449M0FExactMutationTargetAttestationClosure: PASS');
