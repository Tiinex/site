import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const smoke=readFileSync(new URL('../tools/browser-smoke.py',import.meta.url),'utf8');

test('Playthings browser smoke follows the current host/Verse DOM contract',()=>{
  assert.match(smoke,/data-visible-moment-count/);
  assert.doesNotMatch(smoke,/2 \/ 2 declared historical moments|1 \/ 2 declared historical moments/);
  assert.match(smoke,/Root Gate menu/);
  assert.match(smoke,/name='Fullscreen'/);
  assert.match(smoke,/name='Back to Viewer'/);
  assert.match(smoke,/name='Exit Verse'/);
  assert.match(smoke,/TIINEX_BROWSER_EXECUTABLE/);
  assert.match(smoke,/TIINEX_BROWSER_SMOKE_VITE_LOG/);
  assert.match(smoke,/PROGRAMFILES\(X86\)/);
  assert.match(smoke,/LOCALAPPDATA/);
  assert.match(smoke,/chrome\.exe/);
  assert.match(smoke,/msedge\.exe/);
  assert.match(smoke,/chromium\.exe/);
  assert.match(smoke,/playwright\.chromium\.executable_path/);
  assert.match(smoke,/No browser download is attempted automatically/);
  assert.match(smoke,/browserSource/);
  assert.match(smoke,/browserChecked/);
  assert.match(smoke,/failureStage/);
  assert.match(smoke,/vite-startup/);
  assert.match(smoke,/browser-launch/);
  assert.match(smoke,/smoke-assertion/);
});
