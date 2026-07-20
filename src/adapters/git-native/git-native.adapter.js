import { AdapterAvailability, makeAdapterDefinition, makeUnavailableAdapterResult } from '../adapter.contracts.js';

export const GIT_NATIVE_ADAPTER_ID = 'git-native';

export function createGitNativeAdapter() {
  return makeAdapterDefinition({
    id: GIT_NATIVE_ADAPTER_ID,
    label: 'Git native bridge',
    availability: AdapterAvailability.unavailable,
    sourceKinds: ['git.native-repo', 'git.object-store', 'git.time-portal'],
    capabilities: {
      registerSource: true,
      materialize: false,
      discover: false,
      resolveAsset: false,
      openExternal: false,
      requiresBridge: true
    },
    configShape: {
      remote: 'git remote url',
      ref: 'branch | tag | commit',
      rootPaths: 'artifact roots',
      runtime: 'injected git/fs/http bridge required'
    },
    boundary: 'native Git object-store reads require an explicit runtime bridge; browser viewer must not fake them',
    unavailableReason: 'No native git/fs bridge is available in the public browser viewer.',
    notes: [
      'Ported from the PoC git-native adapter contract as an honest capability definition.',
      'Permalinks are recovery anchors, not primary material reads.'
    ]
  });
}

export function gitNativeUnavailableResult(reason = 'native git bridge unavailable') {
  return makeUnavailableAdapterResult(GIT_NATIVE_ADAPTER_ID, reason, {
    diagnostics: {
      requiresBridge: true,
      hiddenNetwork: false,
      hiddenProxy: false,
      primaryReadPath: 'local-git-object-store'
    }
  });
}
