import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,existsSync} from 'node:fs';
import config from '../tiinex.config.js';
test('Site contains only the deployment entrypoint and consumes package APIs',()=>{
 assert.deepEqual(readdirSync('src'),['main.jsx']);
 const entry=readFileSync('src/main.jsx','utf8');assert.match(entry,/@tiinex\/app\/viewer/);assert.doesNotMatch(entry,/\.\.\/.*(?:core|app)\/src/);
 assert.equal(existsSync('shared-core'),false);assert.equal(config.deploymentId,'tiinex-site');
});
