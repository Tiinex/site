export const defaultReaderModes = Object.freeze(['scan','detail','audit','handover','mobile','print']);
export function resolveReaderMode(mode = 'scan') { return defaultReaderModes.includes(mode) ? mode : 'scan'; }
