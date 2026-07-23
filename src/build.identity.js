export const TIINEX_SITE_CHECKPOINT = 'v218';
export const TIINEX_SITE_VERSION = '0.2.38-v218';
export const TIINEX_SITE_TITLE = 'Tiinex Site v218';
export const TIINEX_RUNTIME_ID = 'react-v218-discovery-path-parent-read-model';
export const TIINEX_PUBLIC_BUILD_SOURCE = 'v218-discovery-path-parent-read-model';


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
