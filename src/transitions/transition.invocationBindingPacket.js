export function normalizeInvocationBindingPacket(packet = {}) {
  return Object.freeze({
    inputRoles: Object.freeze(asArray(packet.inputRoles).map((entry) => Object.freeze({
      role: token(entry?.role),
      members: Object.freeze(asArray(entry?.members).map((member) => Object.freeze({ ...member })))
    }))),
    destinations: Object.freeze(asArray(packet.destinations).map((entry) => Object.freeze({
      name: token(entry?.name),
      hasValue: hasConcreteInvocationValue(entry),
      value: entry?.value
    }))),
    naming: Object.freeze(asArray(packet.naming).map((entry) => Object.freeze({
      placement: token(entry?.placement),
      hasValue: hasConcreteInvocationValue(entry),
      value: entry?.value
    }))),
    memberAssociations: Object.freeze(asArray(packet.memberAssociations).map((entry) => Object.freeze({
      group: token(entry?.group),
      effect: token(entry?.effect),
      associations: Object.freeze(asArray(entry?.associations).map((association) => Object.freeze({
        from: Object.freeze({ ...(association?.from || {}) }),
        to: Object.freeze({ ...(association?.to || {}) })
      })))
    })))
  });
}

export function hasConcreteInvocationValue(entry) {
  return Object.prototype.hasOwnProperty.call(entry || {}, 'value') && entry?.value !== undefined;
}

export function invocationBindingPacketCounts(packet) {
  return Object.freeze({
    inputRoleEntries: packet.inputRoles.length,
    destinationEntries: packet.destinations.length,
    namingEntries: packet.naming.length,
    memberAssociationEntries: packet.memberAssociations.length
  });
}

export function immutableInvocationValue(value) {
  if (value === undefined || value === null || typeof value !== 'object') return value;
  return deepFreeze(structuredClone(value));
}

function asArray(value) { return Array.isArray(value) ? value : []; }
function token(value = '') { return String(value || '').trim(); }
function deepFreeze(value) {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  for (const key of Reflect.ownKeys(value)) deepFreeze(value[key]);
  return Object.freeze(value);
}
