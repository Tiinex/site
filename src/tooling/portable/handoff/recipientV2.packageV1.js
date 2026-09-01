import { packageFileBytes } from '../../../export/package.bytes.js';
import { RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID } from './recipientV2.packageV1.constants.js';
import { currentSchemaId, decodeUtf8 } from './recipientV2.packageV1.shared.js';

export { RECIPIENT_V2_PACKAGE_V1_FORMAT_ID, RECIPIENT_V2_PACKAGE_V1_ROOT_PATH, RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID, RECIPIENT_V2_PACKAGE_V1_SCHEMA_TARGET } from './recipientV2.packageV1.constants.js';
export { buildRecipientFacingV2PackageV1 } from './recipientV2.packageV1.build.js';
export { inspectRecipientFacingV2PackageV1 } from './recipientV2.packageV1.inspect.js';
export { parseHandoffPackageV1, renderHandoffPackageV1 } from './recipientV2.packageV1.contract.js';

export function isRecipientV2PackageV1Surface(files = []) {
  return files.some((file) => /\.md$/i.test(String(file.path || '')) && currentSchemaId(decodeUtf8(packageFileBytes(file))) === RECIPIENT_V2_PACKAGE_V1_SCHEMA_ID);
}
