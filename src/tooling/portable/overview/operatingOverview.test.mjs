import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { sealC14nV2Self } from '../../../integrity/integrity.c14nV2.js';
import { projectPortableOperatingOverview } from './operatingOverview.js';
import { runPortableOperation } from '../operation.catalog.js';
import { runPortableCli } from '../adapters/cli/cli.run.js';

function artifact({ schemaId, title, status = 'active/local', summary = title, body = '' }) {
  const unsigned = `# Continuity Context\n\n- Envelope Schema: tiinex.root.v1\n- Current\n  - Current Schema: ${schemaId}\n  - Created At: 2026-08-28 21:20:00\n  - Authors: Fixture\n  - Summary: ${summary}\n  - Status: ${status}\n\n---\n\n# ${title}\n\n${body.trim()}\n\n---\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](https://github.com/Tiinex/docs/blob/3988951208eb9a8926e84ab42625d4b42fa00c2d/.topics/.validators/sha256-base64url-c14n-v2.validator.md)\n  - Towards: self\n  - Value: \n`;
  return sealC14nV2Self(unsigned).markdown;
}

const files = [
  {
    path: 'business/001-product-project.trace.md',
    content: artifact({
      schemaId: 'tiinex.project.v1',
      title: 'Product Project',
      body: `## Purpose\n\nShip the bounded product initiative.\n\n## Scope\n\n- Site and Business coordination.`
    })
  },
  {
    path: 'business/002-current-task.trace.md',
    content: artifact({
      schemaId: 'tiinex.task.v1',
      title: 'Current Task',
      status: 'blocked/local',
      body: `## Objective\n\nLand the current projection.\n\n## Done Criteria\n\n- projection is shared\n\n## Scope\n\n- loaded material only\n\n## Dependencies\n\n- Blocked by unavailable signing key.\n- Docs snapshot remains readable.`
    })
  },
  {
    path: 'business/003-completed-task.trace.md',
    content: artifact({
      schemaId: 'tiinex.task.v1',
      title: 'Completed Task',
      status: 'completed/local',
      body: `## Objective\n\nOld work.\n\n## Done Criteria\n\n- done\n\n## Scope\n\n- old\n\n## Dependencies\n\n- none`
    })
  },
  {
    path: 'business/004-resource-need.trace.md',
    content: artifact({
      schemaId: 'tiinex.resource.need.v1',
      title: 'Signing Key Needed',
      status: 'blocking/local',
      body: `## Resource Need\n\n- Need: signing key\n- State: unavailable\n\n## Interpretation Limits\n\n- Does Not Mean: a provider has been selected.`
    })
  },
  {
    path: 'business/005-monitoring.trace.md',
    content: artifact({
      schemaId: 'tiinex.discovery.monitoring.v1',
      title: 'Release Watch',
      body: `## Observation Boundary\n\nWatch the declared release source.`
    })
  },
  {
    path: 'business/006-source.trace.md',
    content: artifact({
      schemaId: 'tiinex.source.v1',
      title: 'Release Source',
      body: `## Source Identity\n\nDeclared release source.`
    })
  },
  {
    path: 'business/007-relation.trace.md',
    content: artifact({
      schemaId: 'tiinex.relation.v1',
      title: 'Cross Repository Work Relation',
      body: `## Relation\n\n- Target: external://tiinex/docs/release-work`
    })
  }
];

const projected = projectPortableOperatingOverview({ files });
assert.equal(projected.schema, 'tiinex.portable.operating-overview.v1');
assert.equal(projected.status, 'ready');
assert.equal(projected.boundary.material, 'loaded-only');
assert.equal(projected.boundary.remoteFetch, false);
assert.equal(projected.boundary.semanticAuthority, 'projection-only');
assert.equal(projected.boundary.lineageLeafMeansFrontier, false);

assert.equal(projected.projects.length, 1);
assert.equal(projected.projects[0].title, 'Product Project');
assert.equal(projected.projects[0].schemaId, 'tiinex.project.v1');

assert.deepEqual(projected.frontierCandidates.map((item) => item.title), ['Current Task']);
assert.equal(projected.frontierCandidates[0].declaredStatus, 'blocked/local');
assert.equal(projected.frontierCandidates[0].basis.kind, 'task-declared-nonterminal-status');
assert.equal(projected.frontierCandidates[0].basis.lineageLeafUsed, false);
assert.equal(projected.frontierCandidates[0].qualification.state, 'exact');

assert.equal(projected.blockerSignals.some((item) => item.kind === 'task-status' && item.title === 'Current Task'), true);
assert.equal(projected.blockerSignals.some((item) => item.kind === 'task-dependency' && item.text.includes('Blocked by unavailable signing key')), true);
assert.equal(projected.resourceSignals.some((item) => item.schemaId === 'tiinex.resource.need.v1' && item.title === 'Signing Key Needed'), true);

assert.equal(projected.monitoring.loadedMonitoring, 1);
assert.equal(projected.monitoring.loadedSources, 1);
assert.equal(projected.monitoring.freshnessProjection, 'deferred-no-dedicated-freshness-derivation');
assert.equal(projected.crossRepository.loadedRelations, 1);
assert.equal(projected.crossRepository.remoteTraversal, false);
assert.equal(projected.crossRepository.state, 'loaded-relevance-only');
assert.equal(projected.capabilities.firstLoadedMaterialSlice, 'ready');
assert.equal(projected.capabilities.monitoringFreshness, 'deferred');
assert.equal(projected.capabilities.crossRepositoryTraversal, 'deferred');
assert.doesNotThrow(() => JSON.stringify(projected));

const catalogProjected = await runPortableOperation('project-operating-overview', { files });
assert.equal(catalogProjected.operation, 'project-operating-overview');
assert.equal(catalogProjected.resultSchema, 'tiinex.portable.operating-overview.v1');
assert.equal(catalogProjected.frontierCandidates.length, 1);
assert.equal(catalogProjected.projects.length, 1);

const cliDir = await mkdtemp(path.join(os.tmpdir(), 'tiinex-overview-'));
try {
  for (const file of files) {
    const target = path.join(cliDir, file.path);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, file.content, 'utf8');
  }
  const output = [];
  const errors = [];
  const code = await runPortableCli(['project-operating-overview', cliDir, '--compact'], {
    log(value) { output.push(value); },
    error(value) { errors.push(value); }
  });
  assert.equal(code, 0, errors.join('\n'));
  const cliProjected = JSON.parse(output.join('\n'));
  assert.equal(cliProjected.operation, 'project-operating-overview');
  assert.equal(cliProjected.resultSchema, 'tiinex.portable.operating-overview.v1');
  assert.deepEqual(cliProjected.frontierCandidates.map((item) => item.title), ['Current Task']);
  assert.deepEqual(cliProjected.projects.map((item) => item.title), ['Product Project']);
} finally {
  await rm(cliDir, { recursive: true, force: true });
}



const sourceBasisProjected = projectPortableOperatingOverview({ files: [
  {
    path: 'archive/001-project.trace.md',
    content: artifact({
      schemaId: 'tiinex.project.v1',
      title: 'Archive Project',
      body: `## Purpose

Archive source basis.

## Scope

- loaded archive material`
    }),
    sourceMode: 'portable-node-zip',
    locator: { kind: 'node-zip-entry', archivePath: '/tmp/material-a.zip', entryPath: 'archive/001-project.trace.md' }
  },
  {
    path: 'supplied/002-project.trace.md',
    content: artifact({
      schemaId: 'tiinex.project.v1',
      title: 'Supplied Source Project',
      body: `## Purpose

Explicit supplied source metadata basis.

## Scope

- no inferred repository authority`
    }),
    sourceMode: 'portable-supplied',
    source: { adapterId: 'github', repo: 'Tiinex/example', path: 'supplied/002-project.trace.md' }
  }
] });
const archiveProject = sourceBasisProjected.projects.find((item) => item.title === 'Archive Project');
const suppliedProject = sourceBasisProjected.projects.find((item) => item.title === 'Supplied Source Project');
assert.equal(archiveProject.loadedSourceBasis.locatorClass, 'archive-entry');
assert.deepEqual(archiveProject.loadedSourceBasis.locator, {
  kind: 'node-zip-entry',
  archivePath: '/tmp/material-a.zip',
  entryPath: 'archive/001-project.trace.md'
});
assert.equal(suppliedProject.loadedSourceBasis.locatorClass, 'supplied-source-metadata');
assert.equal(suppliedProject.loadedSourceBasis.suppliedSource.adapterId, 'github');
assert.equal(suppliedProject.loadedSourceBasis.suppliedSource.provenanceQualification, 'explicit-supplied-unverified');
assert.equal(suppliedProject.loadedSourceBasis.repositoryIdentity, 'unavailable-not-explicitly-qualified');


const repositoryBasisProjected = projectPortableOperatingOverview({ files: [
  {
    path: 'repository/pinned-project.trace.md',
    content: artifact({
      schemaId: 'tiinex.project.v1',
      title: 'Pinned Repository Project',
      body: `## Purpose

Pinned accepted repository material.

## Scope

- accepted host repository receipt`
    }),
    sourceMode: 'portable-host-repository',
    source: {
      repository: 'Tiinex/business',
      ref: 'main',
      commit: 'abc123',
      path: 'repository/pinned-project.trace.md',
      authority: 'canonical-core',
      remoteFetch: true,
      receiptQualification: 'accepted-host-repository-read',
      provenanceQualification: 'accepted-host-repository-pinned',
      permalink: 'https://evidence.example/Tiinex/business/abc123/pinned-project.trace.md'
    }
  },
  {
    path: 'repository/moving-project.trace.md',
    content: artifact({
      schemaId: 'tiinex.project.v1',
      title: 'Moving Repository Project',
      body: `## Purpose

Moving-ref accepted repository material.

## Scope

- accepted host repository receipt`
    }),
    sourceMode: 'portable-host-repository',
    source: {
      repository: 'Tiinex/business',
      ref: 'main',
      commit: '',
      path: 'repository/moving-project.trace.md',
      authority: 'remote-repository-unpinned',
      remoteFetch: true,
      receiptQualification: 'accepted-host-repository-read',
      provenanceQualification: 'accepted-host-repository-moving-ref'
    }
  },
  {
    path: 'repository/lookalike-project.trace.md',
    content: artifact({
      schemaId: 'tiinex.project.v1',
      title: 'Lookalike Repository Project',
      body: `## Purpose

Unverified lookalike repository metadata.

## Scope

- must remain weak`
    }),
    source: {
      repository: 'Tiinex/business',
      ref: 'main',
      commit: 'fake123',
      path: 'repository/lookalike-project.trace.md',
      authority: 'canonical-core'
    }
  }
] });
const pinnedRepositoryProject = repositoryBasisProjected.projects.find((item) => item.title === 'Pinned Repository Project');
const movingRepositoryProject = repositoryBasisProjected.projects.find((item) => item.title === 'Moving Repository Project');
const lookalikeRepositoryProject = repositoryBasisProjected.projects.find((item) => item.title === 'Lookalike Repository Project');
assert.equal(pinnedRepositoryProject.loadedSourceBasis.locatorClass, 'accepted-repository-receipt');
assert.equal(pinnedRepositoryProject.loadedSourceBasis.repositorySource.repository, 'Tiinex/business');
assert.equal(pinnedRepositoryProject.loadedSourceBasis.repositorySource.commit, 'abc123');
assert.equal(pinnedRepositoryProject.loadedSourceBasis.repositoryIdentity, 'explicit-accepted-repository-material');
assert.equal(pinnedRepositoryProject.loadedSourceBasis.stability, 'pinned-commit');
assert.equal(pinnedRepositoryProject.loadedSourceBasis.publicPermalink, 'https://evidence.example/Tiinex/business/abc123/pinned-project.trace.md');
assert.equal(movingRepositoryProject.loadedSourceBasis.repositorySource.ref, 'main');
assert.equal(movingRepositoryProject.loadedSourceBasis.repositorySource.commit, '');
assert.equal(movingRepositoryProject.loadedSourceBasis.stability, 'moving-ref');
assert.equal(movingRepositoryProject.loadedSourceBasis.publicPermalink, 'unavailable-not-explicitly-qualified');
assert.equal(lookalikeRepositoryProject.loadedSourceBasis.repositoryIdentity, 'unavailable-not-explicitly-qualified');
assert.equal(lookalikeRepositoryProject.loadedSourceBasis.repositorySource, null);
assert.equal(lookalikeRepositoryProject.loadedSourceBasis.publicPermalink, 'unavailable-not-explicitly-qualified');

const samePathRoot = await mkdtemp(path.join(os.tmpdir(), 'tiinex-overview-multi-root-'));
try {
  const rootA = path.join(samePathRoot, 'root-a');
  const rootB = path.join(samePathRoot, 'root-b');
  const relativeProjectPath = path.join('business', '001-shared-project.trace.md');
  const sharedProject = artifact({
    schemaId: 'tiinex.project.v1',
    title: 'Shared Authored Project',
    body: `## Purpose

Prove same authored path across supplied roots remains distinguishable by loaded material basis.

## Scope

- Keep authored path and id semantics unchanged.`
  });
  for (const root of [rootA, rootB]) {
    const target = path.join(root, relativeProjectPath);
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(target, sharedProject, 'utf8');
  }

  const multiRootOutput = [];
  const multiRootErrors = [];
  const multiRootCode = await runPortableCli(['project-operating-overview', rootA, rootB, '--compact'], {
    log(value) { multiRootOutput.push(value); },
    error(value) { multiRootErrors.push(value); }
  });
  assert.equal(multiRootCode, 0, multiRootErrors.join('\n'));
  const multiRootProjected = JSON.parse(multiRootOutput.join('\n'));
  assert.equal(multiRootProjected.projects.length, 2);
  assert.deepEqual(multiRootProjected.projects.map((item) => item.path), [
    'business/001-shared-project.trace.md',
    'business/001-shared-project.trace.md'
  ]);
  assert.equal(multiRootProjected.projects.every((item) => item.loadedSourceBasis?.authority === 'non-authoritative-consumer-evidence'), true);
  assert.equal(multiRootProjected.projects.every((item) => item.loadedSourceBasis?.locatorClass === 'local-file'), true);
  assert.equal(new Set(multiRootProjected.projects.map((item) => item.loadedSourceBasis?.locator?.localPath)).size, 2);
  assert.equal(multiRootProjected.projects.every((item) => item.loadedSourceBasis?.repositoryIdentity === 'unavailable-not-explicitly-qualified'), true);
  assert.equal(multiRootProjected.projects.every((item) => item.loadedSourceBasis?.publicPermalink === 'unavailable-not-explicitly-qualified'), true);
} finally {
  await rm(samePathRoot, { recursive: true, force: true });
}



const crossRepositoryRelevanceProjected = projectPortableOperatingOverview({ files: [
  {
    path: 'relations/001-unique-cross-source.trace.md',
    content: artifact({
      schemaId: 'tiinex.relation.v1',
      title: 'Unique Cross Source Relation',
      body: `## Relation Declaration

- Relation Type: work dependency
- Relation Direction: current relation source -> target artifact
- Relation Scope: artifact-level

## Relation Target

- Target: [Loaded Target](../repo-b/work/001-target-task.trace.md)

## Relation Boundary

- The target is a typed non-Parent relevance target; it is not the Tiinex continuity Parent.`
    }),
    sourceMode: 'portable-host-repository',
    source: {
      repository: 'Tiinex/source-a',
      ref: 'main',
      commit: 'aaa111',
      path: 'relations/001-unique-cross-source.trace.md',
      authority: 'remote-repository-pinned',
      remoteFetch: true,
      receiptQualification: 'accepted-host-repository-read',
      provenanceQualification: 'accepted-host-repository-pinned'
    }
  },
  {
    path: 'repo-b/work/001-target-task.trace.md',
    content: artifact({
      schemaId: 'tiinex.task.v1',
      title: 'Loaded Cross Source Target',
      status: 'completed/local',
      body: `## Objective

Provide the uniquely loaded cross-source target.

## Done Criteria

- target is already loaded

## Scope

- already loaded only

## Dependencies

- none`
    }),
    sourceMode: 'portable-host-repository',
    source: {
      repository: 'Tiinex/source-b',
      ref: 'main',
      commit: 'bbb222',
      path: 'repo-b/work/001-target-task.trace.md',
      authority: 'remote-repository-pinned',
      remoteFetch: true,
      receiptQualification: 'accepted-host-repository-read',
      provenanceQualification: 'accepted-host-repository-pinned'
    }
  },
  {
    path: 'relations/002-ambiguous-cross-source.trace.md',
    content: artifact({
      schemaId: 'tiinex.relation.v1',
      title: 'Ambiguous Cross Source Relation',
      body: `## Relation Declaration

- Relation Type: work dependency
- Relation Direction: current relation source -> target artifact
- Relation Scope: artifact-level

## Relation Target

- Target: ../shared/001-ambiguous-task.trace.md

## Relation Boundary

- The target is a typed non-Parent relevance target; it is not the Tiinex continuity Parent.`
    }),
    sourceMode: 'portable-host-repository',
    source: {
      repository: 'Tiinex/source-a',
      ref: 'main',
      commit: 'aaa111',
      path: 'relations/002-ambiguous-cross-source.trace.md',
      authority: 'remote-repository-pinned',
      remoteFetch: true,
      receiptQualification: 'accepted-host-repository-read',
      provenanceQualification: 'accepted-host-repository-pinned'
    }
  },
  {
    path: 'shared/001-ambiguous-task.trace.md',
    content: artifact({
      schemaId: 'tiinex.task.v1',
      title: 'Ambiguous Target From Source B',
      status: 'completed/local',
      body: `## Objective

First exact same-path loaded candidate.

## Done Criteria

- loaded candidate remains distinguishable

## Scope

- ambiguity pressure

## Dependencies

- none`
    }),
    sourceMode: 'portable-host-repository',
    source: {
      repository: 'Tiinex/source-b',
      ref: 'main',
      commit: 'bbb222',
      path: 'shared/001-ambiguous-task.trace.md',
      authority: 'remote-repository-pinned',
      remoteFetch: true,
      receiptQualification: 'accepted-host-repository-read',
      provenanceQualification: 'accepted-host-repository-pinned'
    }
  },
  {
    path: 'shared/001-ambiguous-task.trace.md',
    content: artifact({
      schemaId: 'tiinex.task.v1',
      title: 'Ambiguous Target From Source C',
      status: 'completed/local',
      body: `## Objective

Second exact same-path loaded candidate.

## Done Criteria

- loaded candidate remains distinguishable

## Scope

- ambiguity pressure

## Dependencies

- none`
    }),
    sourceMode: 'portable-host-repository',
    source: {
      repository: 'Tiinex/source-c',
      ref: 'main',
      commit: 'ccc333',
      path: 'shared/001-ambiguous-task.trace.md',
      authority: 'remote-repository-pinned',
      remoteFetch: true,
      receiptQualification: 'accepted-host-repository-read',
      provenanceQualification: 'accepted-host-repository-pinned'
    }
  },
  {
    path: 'relations/003-unresolved-cross-source.trace.md',
    content: artifact({
      schemaId: 'tiinex.relation.v1',
      title: 'Unresolved Cross Source Relation',
      body: `## Relation Declaration

- Relation Type: work dependency
- Relation Direction: current relation source -> target artifact
- Relation Scope: artifact-level

## Relation Target

- Target: ../missing/404-project.trace.md

## Relation Boundary

- The target is a typed non-Parent relevance target; it is not the Tiinex continuity Parent.`
    }),
    sourceMode: 'portable-host-repository',
    source: {
      repository: 'Tiinex/source-a',
      ref: 'main',
      commit: 'aaa111',
      path: 'relations/003-unresolved-cross-source.trace.md',
      authority: 'remote-repository-pinned',
      remoteFetch: true,
      receiptQualification: 'accepted-host-repository-read',
      provenanceQualification: 'accepted-host-repository-pinned'
    }
  }
] });

assert.equal(crossRepositoryRelevanceProjected.crossRepository.relevanceEdges.length, 3);
const uniqueEdge = crossRepositoryRelevanceProjected.crossRepository.relevanceEdges.find((edge) => edge.relation.title === 'Unique Cross Source Relation');
const ambiguousEdge = crossRepositoryRelevanceProjected.crossRepository.relevanceEdges.find((edge) => edge.relation.title === 'Ambiguous Cross Source Relation');
const unresolvedEdge = crossRepositoryRelevanceProjected.crossRepository.relevanceEdges.find((edge) => edge.relation.title === 'Unresolved Cross Source Relation');
assert.equal(uniqueEdge.resolution.state, 'resolved');
assert.equal(uniqueEdge.resolution.candidateCount, 1);
assert.equal(uniqueEdge.target.title, 'Loaded Cross Source Target');
assert.equal(uniqueEdge.sourceBases.relation.repositorySource.repository, 'Tiinex/source-a');
assert.equal(uniqueEdge.sourceBases.target.repositorySource.repository, 'Tiinex/source-b');
assert.equal(uniqueEdge.resolution.remoteTraversal, false);
assert.equal(uniqueEdge.resolution.heuristicMatching, false);
assert.equal(uniqueEdge.resolution.lifecycleInference, false);
assert.equal(ambiguousEdge.resolution.state, 'ambiguous');
assert.equal(ambiguousEdge.resolution.candidateCount, 2);
assert.equal(ambiguousEdge.target, null);
assert.deepEqual(new Set(ambiguousEdge.candidates.map((item) => item.loadedSourceBasis.repositorySource.repository)), new Set(['Tiinex/source-b', 'Tiinex/source-c']));
assert.equal(unresolvedEdge.resolution.state, 'unresolved');
assert.equal(unresolvedEdge.resolution.candidateCount, 0);
assert.equal(unresolvedEdge.target, null);
assert.equal(crossRepositoryRelevanceProjected.frontierCandidates.length, 0);
assert.equal(crossRepositoryRelevanceProjected.crossRepository.remoteTraversal, false);
assert.equal(crossRepositoryRelevanceProjected.capabilities.crossRepositoryTraversal, 'deferred');

console.log('✓ operating overview projection preserves owning-artifact semantics and loaded-only boundaries');
