import { publicAuthorSchemaBodyContractHelpLines } from './cli.author-contract.js';

export function portableCliHelpText(commandPrefix = '', surfaceCommand = '', flags = {}) {
  const command = String(commandPrefix || '').trim()
    || (String(process.argv[1] || '').replace(/\\/g, '/').includes('/bin/') ? 'node bin/tiinex-portable.mjs' : 'node tools/tiinex-portable.mjs');
  const common = String(surfaceCommand || '').trim().toLowerCase();
  const specific = commonCommandHelp(command, common, flags);
  if (specific) return specific.join('\n');
  return [
    'Tiinex portable tooling',
    '',
    'Common path (same command for humans and LLMs):',
    `${command} ground <handoff-package.zip> --route <Continue-from>`,
    `${command} ground <handoff-package.zip> --route <Continue-from> --continue <workspace-dir>`,
    `${command} author <workspace-dir> --schema <schema-id> --path <workspace-relative-artifact> --body <body.md> [--parent <workspace-relative-parent>] [--title <title>] [--summary <summary>] [--why <why>]`,
    `${command} handoff <workspace-dir>`,
    '',
    `Handoff aliases: ${command} orient <carrier.zip>; ${command} validate <carrier.zip>`,
    `Advanced/internal catalog: ${command} operations`,
    '',
    'Common boundaries:',
    '- `orient`, `ground`, and public `handoff` use compact decision-first default projections; add `--full` on the same command for the complete qualified receipt.',
    '- `ground` is read-only; append `--continue <workspace-dir>` only after `grounded-to-act` to materialize the selected carried Workspace and runtime-only `.tiinex/continuation.json`.',
    '- `author` uses continuation state to infer ordinary Parent continuity, seal c14n-v2 integrity, audit, and stage; invalid artifacts are not retained.',
    '- `handoff` uses continuation state plus the latest qualified authored Handoff to manufacture the canonical return carrier and excludes runtime-only `.tiinex` state. Normal operator completion is one Handoff package plus the exact routing text; markdown-capable hosts render that routing in a fenced code block, and do not emit loose Evidence/Handoff markdown as extra transport payloads.',
    '- Remote reads/writes remain explicit host concerns. Tooling operation safety does not create or revoke semantic Task/Handoff authority.',
    '',
    'Use `<common-command> --help` for focused common-path usage. Use `operations` deliberately for the advanced/internal operation catalog.'
  ].join('\n');
}

function commonCommandHelp(command, surfaceCommand, flags = {}) {
  if (surfaceCommand === 'ground') return [
    'Tiinex portable tooling — ground',
    '',
    `${command} ground <handoff-package.zip> --route <Continue-from>`,
    `${command} ground <handoff-package.zip> --route <Continue-from> --continue <workspace-dir>`,
    '',
    'Reads and qualifies the exact selected Handoff route. The default projection keeps readiness, recipient authority boundary, Required Context closure, continuity/blockers, current Task identity, and exact next action compact; add `--full` for the full qualified receipt.',
    'Add `--include-required-context <requirement-id,name|all>` and/or `--include-current-work` only when exact body text is needed. `ground --continue` includes the bounded current Task body needed to proceed, retains Required Context counts and continuity/recovery state, and does not repeat qualified Required Context item paths or root-detail receipts unless explicitly requested (or `--full` is used).',
    'After `grounded-to-act`, `--continue` materializes the selected carried Workspace into an empty local directory and writes runtime-only `.tiinex/continuation.json`. The grounding operation itself is non-mutating; downstream work authority comes from qualified Handoff/Task/Role artifacts, not from that operation-safety fact.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'author') {
    const schemaId = typeof flags.schema === 'string' ? flags.schema.trim() : '';
    return [
      'Tiinex portable tooling — author',
      '',
      `${command} author <workspace-dir> --schema <schema-id> --path <workspace-relative-artifact> --body <body.md> [--parent <workspace-relative-parent>] [--title <title>] [--summary <summary>] [--why <why>]`,
      '',
      'Uses qualified continuation state to infer the ordinary Parent when `--parent` is omitted, seals c14n-v2 self-integrity, audits, stages, and updates continuation state only after qualification. Invalid output is not retained.',
      '',
      'Schema-body contract discovery:',
      `- Run ${command} author --help --schema <schema-id> to see the required body headings and fields from the registered schema runtime validation contract.`,
      ...(schemaId ? ['', ...publicAuthorSchemaBodyContractHelpLines(schemaId)] : []),
      '',
      `Advanced/internal catalog: ${command} operations`
    ];
  }
  if (surfaceCommand === 'handoff') return [
    'Tiinex portable tooling — handoff',
    '',
    `${command} handoff <workspace-dir>`,
    '',
    'Infers the latest qualified authored Handoff, selected Workspace identity/target, received package parent, unchanged sibling Workspace providers, canonical projected filename, and return output directory. The default receipt keeps output identity, routing text, closure/workspace qualification, verification, and actionable findings compact; add `--full` for the complete manufacture receipt. Normal operator completion is exactly one Handoff package plus the adjacent exact routing text. In markdown-capable hosts render that routing in a fenced code block; do not emit canonical Workspace Evidence/Handoff markdown as additional loose transport files. Runtime-only `.tiinex` state is excluded from canonical manufacture.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'orient') return [
    'Tiinex portable tooling — orient',
    '',
    `${command} orient <handoff-package.zip>`,
    '',
    'Read-only recipient orientation for a supplied Handoff carrier. The default projection identifies qualified Workspaces/routes, selection, non-authority, and the exact grounding route; add `--full` for endpoint, closure, and package-detail receipts.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  if (surfaceCommand === 'validate') return [
    'Tiinex portable tooling — validate',
    '',
    `${command} validate <handoff-package.zip>`,
    '',
    'Audits carried Handoff-package context and qualification evidence without mutating source material.',
    '',
    `Advanced/internal catalog: ${command} operations`
  ];
  return null;
}
