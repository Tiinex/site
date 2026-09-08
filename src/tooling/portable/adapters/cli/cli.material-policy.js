export const OPERATIONS_WITHOUT_EXPLICIT_MATERIAL = new Set([
  'prepare-task','prepare-materialization','create-local-artifact-set','create-local-draft','plan-host-action','accept-host-receipt',
  'describe-checkpoint-gate','qualify-checkpoint','describe-schema-chain','schema-guide','plan-artifact','list-material-providers',
  'resolve-schema-material','resolve-schema-chain-material','materialize-durable-findings','build-runtime-package','roundtrip-runtime-package',
  'describe-cold-start-ingress','project-cold-start-host','qualify-cold-start','ground-cold-consumer'
]);
