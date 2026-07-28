export const TIINEX_SITE_CHECKPOINT = 'v284';
export const TIINEX_SITE_VERSION = '0.2.104-v284';
export const TIINEX_SITE_TITLE = 'Tiinex Site v284';
export const TIINEX_RUNTIME_ID = 'react-v284-scroll-restore-idle-persistence';
export const TIINEX_PUBLIC_BUILD_SOURCE = 'v284-scroll-restore-idle-persistence';

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
