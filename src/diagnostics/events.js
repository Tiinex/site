export function diagnosticEvent(type, data = {}) { return { type, data, at: new Date().toISOString() }; }
