import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const context = { window: {}, globalThis: {} };
context.globalThis = context.window;
vm.createContext(context);
vm.runInContext(readFileSync(new URL('./origins.js', import.meta.url), 'utf8'), context);
const api = context.window.TiinexSchemaOrigins;
const origins = api.schemaOriginsFromWorkspaceConfig({ schemaOrigins: [{ title: 'App schemas', kind: 'app-local', rootPath: 'src/app-schemas', trustRole: 'viewer-extension' }] });
if (origins[0].id !== 'app-local-src-app-schemas') throw new Error('schema origin id should be stable and portable');
if (!api.originCanProvideSchema(origins[0], 'app.custom.v1')) throw new Error('viewer-extension origin should be allowed to provide app schemas');
const defaults = api.schemaOriginsFromWorkspaceConfig({});
if (!defaults.some((origin) => origin.repository === 'Tiinex/docs')) throw new Error('default origins should include Tiinex/docs');
if (!defaults.some((origin) => origin.kind === 'app-local')) throw new Error('default origins should include viewer-local extension origin');
console.log('✓ schema origins tests passed');
