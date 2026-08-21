import fs from 'node:fs';
import path from 'node:path';
import { installedBindingPaths, projectionPathForBinding, runtimeProjectionForFiles, stringifyProjection } from './schema-runtime-projection.lib.mjs';

const findings = [];
let checked = 0;
for (const bindingPath of installedBindingPaths()) {
  const markdownPath = bindingPath.replace(/\.schema\.json$/, '.schema.md');
  if (!fs.existsSync(markdownPath)) continue;
  const projectionPath = projectionPathForBinding(bindingPath);
  checked += 1;
  if (!fs.existsSync(projectionPath)) {
    findings.push(`missing projection: ${path.relative(process.cwd(), projectionPath)}`);
    continue;
  }
  const expected = stringifyProjection(runtimeProjectionForFiles(markdownPath, bindingPath));
  const actual = fs.readFileSync(projectionPath, 'utf8');
  if (actual !== expected) findings.push(`stale projection: ${path.relative(process.cwd(), projectionPath)}`);
}
if (findings.length) {
  console.error(`schema-runtime-projections: FAIL (${findings.length}/${checked})`);
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}
console.log(`schema-runtime-projections: PASS (${checked}/${checked} exact generated projections)`);
