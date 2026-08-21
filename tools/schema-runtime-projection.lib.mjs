import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { compilePortableSchemaContract, compilePortableSchemaContractChain } from '../src/tooling/portable/schema/contract.compile.js';
import { parsePortableSchemaDocument, requiredCreationContentInputs, requiredCreationSections } from '../src/tooling/portable/schema/schema.contract.js';

export const SCHEMA_RUNTIME_PROJECTION_ID = 'tiinex.site.schema-runtime-projection.v1';
export const SCHEMA_RUNTIME_PROJECTION_GENERATOR = 'schema-runtime-projection-v1';

export function runtimeProjectionForFiles(markdownPath, bindingPath) {
  const markdown = fs.readFileSync(markdownPath, 'utf8');
  const binding = JSON.parse(fs.readFileSync(bindingPath, 'utf8'));
  const document = parsePortableSchemaDocument(markdown);
  const compiled = compilePortableSchemaContract(document);
  const sourceChecksum = crypto.createHash('sha256').update(Buffer.from(markdown, 'utf8')).digest('hex');
  const creation = compiled?.creation || {};
  const inputBindings = Object.freeze(creationInputBindings(document, creation));
  const requiredShape = Object.freeze(creationRequiredShapeItems(document, creation, inputBindings));
  const exactResultProjectionNeeded = Boolean((creation.groups || []).length) && (creation.requiredInputs || []).every((name) => {
    const binding = inputBindings.find((item) => String(item?.input || '') === String(name || ''));
    return binding && ['section-body', 'root-current-summary-body-title'].includes(String(binding.kind || ''));
  });
  const validationContract = exactResultProjectionNeeded ? runtimeValidationContractForSchema(markdownPath, bindingPath) : null;
  return Object.freeze({
    schema: SCHEMA_RUNTIME_PROJECTION_ID,
    generator: SCHEMA_RUNTIME_PROJECTION_GENERATOR,
    schemaId: String(compiled?.schemaId || ''),
    sourceChecksum,
    sourceBytes: Buffer.byteLength(markdown, 'utf8'),
    bindingChecksum: String(binding?.checksum?.value || binding?.checksum || ''),
    validationContract,
    creation: Object.freeze({
      declared: Array.isArray(creation.groups) && creation.groups.length > 0,
      groupNames: Object.freeze((creation.groups || []).map((group) => String(group?.name || '')).filter(Boolean)),
      requiredInputs: Object.freeze([...(creation.requiredInputs || [])]),
      optionalInputs: Object.freeze([...(creation.optionalInputs || [])]),
      requiredSections: Object.freeze([...(creation.requiredSections || [])]),
      toolingConfigurationFields: Object.freeze([...(creation.toolingConfigurationFields || [])]),
      inputBindings,
      requiredShape
    })
  });
}


function creationRequiredShapeItems(document = {}, creation = {}, inputBindings = []) {
  const schemaId = String(document?.schemaId || '').trim();
  const sectionBindings = new Map(inputBindings.filter((item) => item?.kind === 'section-body').map((item) => [String(item.section || ''), item]));
  const summaryBinding = inputBindings.find((item) => item?.kind === 'root-current-summary-body-title');
  const out = [];
  for (const group of document?.creation?.groups || []) {
    for (const category of group?.categories || []) {
      if (String(category?.name || '') !== 'Required Shape') continue;
      const nodes = Array.isArray(category?.nodes) ? category.nodes : [];
      for (let index = 0; index < (category?.items || []).length; index += 1) {
        const sourceText = String(category.items[index] || '');
        const line = Number(nodes[index]?.line || 0);
        const id = `${schemaId}#artifact-creation/${String(group?.name || 'group')}/required-shape/${line || index + 1}`;
        let primitive = Object.freeze({ kind: 'residual' });
        if (sourceText === 'first heading uses `# {{summary}}`' && summaryBinding) primitive = Object.freeze({ kind: 'body-title-summary', input: String(summaryBinding.input || '') });
        else {
          const match = sourceText.match(/^`## ([^`]+)` section$/);
          if (match && sectionBindings.has(match[1])) primitive = Object.freeze({ kind: 'section-body', section: match[1], input: String(sectionBindings.get(match[1])?.input || '') });
        }
        out.push(Object.freeze({ id, sourceSchemaId: schemaId, group: String(group?.name || ''), category: 'Required Shape', line, sourceText, primitive }));
      }
    }
  }
  return out;
}

function creationInputBindings(document = {}, creation = {}) {
  const sectionByIdentity = new Map(requiredCreationSections(document).map((name) => [String(name), String(name)]));
  const contentInputIdentities = new Set(requiredCreationContentInputs(document).map((name) => String(name)));
  return (creation.requiredInputs || []).map((name) => {
    const input = String(name || '').trim();
    if (contentInputIdentities.has(input) && sectionByIdentity.has(input)) return Object.freeze({ input, kind: 'section-body', section: sectionByIdentity.get(input) });
    if (contentInputIdentities.has(input) && input === 'Summary') return Object.freeze({ input, kind: 'root-current-summary-body-title', section: '' });
    return Object.freeze({ input, kind: 'unmapped', section: '' });
  });
}


function runtimeValidationContractForSchema(markdownPath, bindingPath) {
  const index = schemaDocumentIndex(projectRootForBinding(bindingPath));
  const targetMarkdown = fs.readFileSync(markdownPath, 'utf8');
  const targetDocument = parsePortableSchemaDocument(targetMarkdown);
  const lineage = schemaLineageMarkdown(targetDocument?.schemaId || '', index);
  const compiled = compilePortableSchemaContractChain(lineage);
  return compactValidationContract(compiled);
}

function compactValidationContract(compiled = {}) {
  const ordinaryGroups = compiled?.validation?.ordinaryGroups || [];
  const declarations = compiled?.declarations || [];
  const ordinaryNames = new Set(ordinaryGroups.map((group) => normalizeKey(group?.group)));
  const declarationNames = new Set(declarations.map((group) => normalizeKey(group?.group)));
  const requiredFields = [];
  for (const group of compiled?.validation?.groups || []) {
    const name = normalizeKey(group?.name);
    if (ordinaryNames.has(name) || declarationNames.has(name) || (group?.requiredWhen || []).length) continue;
    for (const category of group?.categories || []) {
      if (String(category?.name || '') !== 'Required Fields') continue;
      requiredFields.push(...(category?.items || []).map((item) => String(item || '').trim()).filter(Boolean));
    }
  }
  const uniqueRequiredFields = [...new Set(requiredFields)];
  return Object.freeze({
    schema: 'tiinex.site.compact-portable-validation-contract.v1',
    schemaId: String(compiled?.schemaId || ''),
    lineage: Object.freeze([...(compiled?.lineage || [])]),
    lineageQualification: compiled?.lineageQualification || Object.freeze({ state: 'unresolved', complete: false, lineage: Object.freeze([]), findings: Object.freeze(['Validation lineage unavailable.']) }),
    validation: Object.freeze({
      groups: Object.freeze(uniqueRequiredFields.length ? [Object.freeze({
        name: 'Runtime Required Fields',
        requiredWhen: Object.freeze([]),
        categories: Object.freeze([Object.freeze({ name: 'Required Fields', items: Object.freeze(uniqueRequiredFields) })])
      })] : []),
      requiredSections: Object.freeze([...(compiled?.validation?.requiredSections || [])]),
      requiredHeadings: Object.freeze([...(compiled?.validation?.requiredHeadings || [])]),
      requiredEntries: Object.freeze([...(compiled?.validation?.requiredEntries || [])]),
      ordinaryGroups: Object.freeze([...(ordinaryGroups || [])])
    }),
    declarations: Object.freeze([...(declarations || [])]),
    constraints: Object.freeze([...(compiled?.constraints || [])])
  });
}

function schemaDocumentIndex(root) {
  const index = new Map();
  for (const bindingPath of installedBindingPaths(root)) {
    const markdownPath = bindingPath.replace(/\.schema\.json$/, '.schema.md');
    if (!fs.existsSync(markdownPath)) continue;
    const markdown = fs.readFileSync(markdownPath, 'utf8');
    const document = parsePortableSchemaDocument(markdown);
    const schemaId = String(document?.schemaId || '').trim();
    if (schemaId) index.set(schemaId, { markdown, document });
  }
  return index;
}

function schemaLineageMarkdown(schemaId, index, seen = new Set()) {
  const id = String(schemaId || '').trim();
  if (!id || seen.has(id)) throw new Error(`schema-runtime-projection-lineage-invalid:${id || 'unknown'}`);
  const item = index.get(id);
  if (!item) throw new Error(`schema-runtime-projection-lineage-missing:${id}`);
  const next = new Set(seen); next.add(id);
  const parent = String(item.document?.parentSchemaId || '').trim();
  return Object.freeze([...(parent ? schemaLineageMarkdown(parent, index, next) : []), item.markdown]);
}

function projectRootForBinding(bindingPath) {
  const absolute = path.resolve(bindingPath);
  const marker = `${path.sep}src${path.sep}schemas${path.sep}`;
  const index = absolute.lastIndexOf(marker);
  if (index < 0) return process.cwd();
  return absolute.slice(0, index);
}

function normalizeKey(value = '') { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, ' '); }

export function projectionPathForBinding(bindingPath) {
  return bindingPath.replace(/\.schema\.json$/, '.schema.runtime.json');
}

export function stringifyProjection(projection) {
  return `${JSON.stringify(projection, null, 2)}\n`;
}

export function installedBindingPaths(root = process.cwd()) {
  const schemaRoot = path.join(root, 'src', 'schemas');
  const out = [];
  walk(schemaRoot, (file) => { if (file.endsWith('.schema.json')) out.push(file); });
  return out.sort();
}

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, visit);
    else if (entry.isFile()) visit(full);
  }
}
