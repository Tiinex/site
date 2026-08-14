import assert from 'node:assert/strict';
import { workspaceHomeHref } from './workspaceHomeTarget.js';
const locationLike = { href: 'http://localhost/index.html?x=1#state=abc', pathname: '/index.html', search: '?x=1' };
assert.equal(workspaceHomeHref({ viewerIdentity: { workspaceHome: 'https://tiinex.dev/' } }, locationLike), 'https://tiinex.dev/');
assert.equal(workspaceHomeHref({ viewerIdentity: { workspaceHome: '#home' } }, locationLike), '/index.html?x=1#home');
assert.equal(workspaceHomeHref({ viewerIdentity: { publicViewerUrl: 'https://public.example/' } }, locationLike), 'https://public.example/');
assert.equal(workspaceHomeHref({ viewerIdentity: {} }, locationLike), '/index.html?x=1');
console.log('✓ workspace home target tests passed');
