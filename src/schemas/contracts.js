export const SchemaKind = Object.freeze({ abstract: 'abstract', concrete: 'concrete', structural: 'structural' });

export function defineSchemaModule(module) {
  if (!module || !module.id || !module.kind) throw new Error('Invalid schema module');
  return Object.freeze(module);
}
