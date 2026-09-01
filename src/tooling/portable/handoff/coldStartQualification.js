import { qualifyPortableColdStartTrace } from './coldStartQualification.observation.js';
import {
  isOneShotColdStartQualificationInput,
  qualifyPortableColdStartRun
} from './coldStartQualification.run.js';

export {
  COLD_START_INGRESS_KINDS,
  PORTABLE_COLD_CONSUMER_GROUNDING_SCHEMA_ID,
  PORTABLE_COLD_START_HOST_PROJECTION_SCHEMA_ID,
  PORTABLE_COLD_START_INGRESS_CONTRACT_SCHEMA_ID,
  PORTABLE_COLD_START_QUALIFICATION_SCHEMA_ID,
  describePortableColdStartIngress,
  projectPortableColdStartHostGuidance
} from './coldStartQualification.contract.js';
export { groundPortableColdConsumer } from './coldStartQualification.grounding.js';
export { qualifyPortableColdStartRun } from './coldStartQualification.run.js';

export function qualifyPortableColdStart(input = {}, options = {}) {
  if (isOneShotColdStartQualificationInput(input)) return qualifyPortableColdStartRun(input, options);
  return qualifyPortableColdStartTrace(input, options);
}
