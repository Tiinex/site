export const TIINEX_SITE_CHECKPOINT = 'v201';
export const TIINEX_SITE_VERSION = '0.2.21-v201';
export const TIINEX_SITE_TITLE = 'Tiinex Site v201';
export const TIINEX_RUNTIME_ID = 'react-v201-release-checkpoint-consolidation';
export const TIINEX_PUBLIC_BUILD_SOURCE = 'v201-release-checkpoint-consolidation';

export function tiinexBuildIdentity() {
  return Object.freeze({
    type: 'tiinex.site.build.identity.v1',
    checkpoint: TIINEX_SITE_CHECKPOINT,
    version: TIINEX_SITE_VERSION,
    runtime: TIINEX_RUNTIME_ID,
    publicBuildSource: TIINEX_PUBLIC_BUILD_SOURCE
  });
}
