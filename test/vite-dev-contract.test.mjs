import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const viteConfig = readFileSync(new URL('../vite.config.ts', import.meta.url), 'utf8');

test('Vite dev serves the source-distributed App package through normal transforms', () => {
  assert.match(
    viteConfig,
    /optimizeDeps\s*:\s*\{[\s\S]*?exclude\s*:\s*\[\s*['"]@tiinex\/app['"]\s*\]/,
  );
});
