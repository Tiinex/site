export const TIINEX_SITE_CHECKPOINT = 'v288';
export const TIINEX_SITE_VERSION = '0.2.108-v288';
export const TIINEX_SITE_TITLE = 'Tiinex Site v288';
export const TIINEX_RUNTIME_ID = 'react-v288-mobile-read-sheet-config-source';
export const TIINEX_PUBLIC_BUILD_SOURCE = 'v288-mobile-read-sheet-config-source';

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
