import { readFile } from 'node:fs/promises';
import { loadNodePortableInput } from '../../input/node.input.js';

export async function prepareQualifyColdStartCommandInput(parsed, flags = {}) {
  const evidenceFile = flags.evidence || flags.trace || flags.input || '';
  if (evidenceFile) {
    const evidence = JSON.parse(await readFile(evidenceFile, 'utf8'));
    return { input: { ...evidence, ingressKind: flags.ingress || evidence.ingressKind || evidence.kind || 'routed-handoff-package' }, options: {} };
  }
  const packagePath = String(flags.package || parsed.positionals[0] || '').trim();
  if (!packagePath) throw new Error('portable.cli.cold-start-package-or-evidence.required');
  const material = await loadNodePortableInput([packagePath], { maxFiles: flags['max-files'], maxTextBytes: flags['max-text-bytes'] });
  const interaction = await readOptionalJson(flags.interaction);
  return {
    input: {
      ...material,
      bundle: material,
      ingressKind: flags.ingress || flags.kind || 'routed-handoff-package',
      route: flags.route || '',
      packageSourcePath: packagePath,
      preTakeover: flags['pre-takeover'] || 'unverified',
      hostEvidenceSource: flags['evidence-source'] || '',
      interaction: interaction.interaction || interaction,
      holderBinding: { roleLabel: flags['holder-role'] || '', holderId: flags['holder-id'] || '' },
      toolingAvailable: flags['tooling-unavailable'] ? false : true
    },
    options: {}
  };
}

async function readOptionalJson(file) {
  if (!file) return {};
  return JSON.parse(await readFile(file, 'utf8'));
}
