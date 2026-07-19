(function attachTiinexIconPaths(global) {
  'use strict';

  const iconPaths = Object.freeze({
    previous: '<path d="M15 6l-6 6 6 6"/>',
    next: '<path d="M9 6l6 6-6 6"/>',
    create: '<path d="M12 5v14M5 12h14"/>',
    multiverse: '<path d="M5 7h14M5 12h14M5 17h14"/>',
    display: '<path d="M5 7h14M5 12h14M5 17h14"/>',
    source: '<path d="M12 4l7 4-7 4-7-4 7-4z"/><path d="M5 12l7 4 7-4M5 16l7 4 7-4"/>',
    audit: '<path d="M5 13l4 4L19 7"/>',
    external: '<path d="M8 16L16 8M10 8h6v6"/>',
    close: '<path d="M7 7l10 10M17 7L7 17"/>',
    share: '<path d="M8 12h8M12 8l4 4-4 4"/>',
    open: '<path d="M4 8h7l2 3h7v8H4z"/>',
    merge: '<path d="M6 6v4a4 4 0 004 4h8"/><path d="M14 10l4 4-4 4"/>',
    lineage: '<path d="M7 7h4v4H7zM13 13h4v4h-4z"/><path d="M11 9h2a2 2 0 012 2v2"/>',
    help: '<path d="M9 9a3 3 0 116 2c-2 1-3 2-3 4"/><path d="M12 19h.01"/>',
    load: '<path d="M12 4v10M8 10l4 4 4-4"/><path d="M5 20h14"/>',
    preview: '<path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/>'
  });

  global.TiinexIconPaths = iconPaths;
})(typeof window !== 'undefined' ? window : globalThis);
