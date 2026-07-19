#!/usr/bin/env node
import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=fileURLToPath(new URL('..', import.meta.url)).replace(/[\/]$/,'');
function walk(dir){let out=[]; for(const e of readdirSync(dir,{withFileTypes:true})){ if(['.old','node_modules','.site-publish'].includes(e.name)) continue; const p=join(dir,e.name); if(e.isDirectory()) out=out.concat(walk(p)); else out.push(p);} return out;}
const files=walk(root);
console.log(JSON.stringify({
  type:'tiinex.site.metrics.v100',
  architectureReadyForProductWork:'column-discovery-lineage-action-height-continuity',
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
  feedTreeParity:true,
  verseConcept:true,
  auditLoadAllSkeleton:true,
  sourceDiscoveryControls:true,
  ergonomicControlRule:true,
  interactionSpine:true,
  scaffoldActionsMarked:true,
  multiverseConceptScaffold:true,
  universeEntryVerse:true,
  columnVerseDefault:true,
  verseScopeCleaned:true,
  visibleImplementedVersesOnly:true,
  verseContextAvailability:true,
  workspaceMapVerseRuntime:false,
  plannedMapAtlasOnly:true,
  visualContinuityPass:true,
  legacyPatternBaseline:true,
  primaryDiagnosticsCollapsed:true,
  mobileTransportLessonsCaptured:true,
  atlasModeledAsPlannedUniverseContext:true,
  columnOnlyRuntimeVerse:true,
  titleLegibilityCorrected:true,
  oldActionRhythmParity:true,
  discoveryLineageModeParity:true,
  focusedHeightContinuity:true,
  legacyTopCounters:true,
  adaptersAreSourceTransportBoundaries:true,
  renderersAreNotAdapters:true,
  desktopVersePlannedContext:true,
  noArbitraryNestingDepth:true,
  cycleRoundtripGuardModel:true,
  legacyBehaviorReference:true,
  localToGithubGuessing:false
}, null, 2));
