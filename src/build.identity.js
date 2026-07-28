export const TIINEX_SITE_CHECKPOINT = 'v285';
export const TIINEX_SITE_VERSION = '0.2.105-v285';
export const TIINEX_SITE_TITLE = 'Tiinex Site v285';
export const TIINEX_RUNTIME_ID = 'react-v285-deferred-view-route-persistence';
export const TIINEX_PUBLIC_BUILD_SOURCE = 'v285-deferred-view-route-persistence';

export function tiinexBuildIdentity() {
  return Object.freeze({
    schema: 'tiinex.build.identity.v1',
    checkpoint: TIINEX_SITE_CHECKPOINT,
    siteVersion: TIINEX_SITE_VERSION,
    title: TIINEX_SITE_TITLE,
    runtimeId: TIINEX_RUNTIME_ID,
    publicBuildSource: TIINEX_PUBLIC_BUILD_SOURCE
  });
}
