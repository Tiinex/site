import fs from 'node:fs';
import { installedBindingPaths, projectionPathForBinding, runtimeProjectionForFiles, stringifyProjection } from './schema-runtime-projection.lib.mjs';

for (const bindingPath of installedBindingPaths()) {
  const markdownPath = bindingPath.replace(/\.schema\.json$/, '.schema.md');
  if (!fs.existsSync(markdownPath)) continue;
  const projectionPath = projectionPathForBinding(bindingPath);
  fs.writeFileSync(projectionPath, stringifyProjection(runtimeProjectionForFiles(markdownPath, bindingPath)));
  console.log(`generated ${projectionPath}`);
}
