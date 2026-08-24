import { sealC14nV2Self } from './integrity.c14nV2.js';
import { C14N_V2_VALIDATOR_TARGET } from './integrity.methodReference.js';

export function sealedC14nV2FixtureMarkdown(label = 'Fixture Parent') {
  const unsigned = `# ${String(label || 'Fixture Parent')}\n\nFixture bytes used only as a validated c14n-v2 Parent integrity target in tests.\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v2](${C14N_V2_VALIDATOR_TARGET})\n  - Towards: self\n  - Value: pending`;
  const sealed = sealC14nV2Self(unsigned);
  if (sealed.state !== 'sealed') throw new Error(`fixture-self-seal-${sealed.reason || sealed.state}`);
  return sealed.markdown;
}
