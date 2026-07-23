export const TIINEX_SITE_CHECKPOINT = 'v217';
export const TIINEX_SITE_VERSION = '0.2.37-v217';
export const TIINEX_SITE_TITLE = 'Tiinex Site v217';
export const TIINEX_RUNTIME_ID = 'react-v217-trace-discovery-read-model';
export const TIINEX_PUBLIC_BUILD_SOURCE = 'v217-trace-discovery-read-model';


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
