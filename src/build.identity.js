export const TIINEX_SITE_CHECKPOINT = 'v270';
export const TIINEX_SITE_VERSION = '0.2.90-v270';
export const TIINEX_SITE_TITLE = 'Tiinex Site v270';
export const TIINEX_RUNTIME_ID = 'react-v270-abortable-repo-proxy-transport';
export const TIINEX_PUBLIC_BUILD_SOURCE = 'v270-abortable-repo-proxy-transport';

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
