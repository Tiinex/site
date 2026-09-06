export async function reductionPreflightCliInput({ material, flags, options, readOptionalJson, splitFlag }) {
  const value = await readOptionalJson(flags['reduction-inputs'] || flags.inputs || flags['eligibility-inputs']);
  const candidateSet = value.candidateSet || value.candidates || splitFlag(flags.candidate || flags.candidates);
  return {
    input: {
      ...material,
      ...value,
      candidateSet,
      reductionArtifactPath: flags.reduction || flags['reduction-artifact'] || value.reductionArtifactPath || value.reduction || '',
      immutableSources: value.immutableSources || await readOptionalJson(flags['immutable-sources'])
    },
    options
  };
}
