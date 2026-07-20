(function attachTiinexIconPaths(global) {
  'use strict';

  const iconPaths = Object.freeze({
    previous: '<path d="M15 6l-6 6 6 6"/>',
    next: '<path d="M9 6l6 6-6 6"/>',
    // circle + icon for Create (visually closer to the legacy header)
    create: '<circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/>',
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
    preview: '<path d="M4 6h16v12H4z"/><path d="M8 10h8M8 14h5"/>',
    database: '<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v6c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/><path d="M5 11v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"/>',
    file: '<path d="M7 3h7l3 3v15H7z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
    seedling: '<path d="M12 20v-7"/><path d="M12 13c-4 0-6-2-6-5 4 0 6 2 6 5z"/><path d="M12 13c4 0 6-2 6-5-4 0-6 2-6 5z"/>',
    pen: '<path d="M4 20l4-1 10-10-3-3L5 16z"/><path d="M13 6l3 3"/>',
    shareNodes: '<circle cx="7" cy="12" r="2"/><circle cx="17" cy="7" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 11l6-3M9 13l6 3"/>',
    scale: '<path d="M12 4v16M5 7h14"/><path d="M7 7l-3 6h6zM17 7l-3 6h6z"/>',
    document: '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    download: '<path d="M12 4v10M8 10l4 4 4-4"/><path d="M5 20h14"/>',
    folder: '<path d="M3 7h7l2 3h9v9H3z"/>',
    github: '<path d="M12 3a9 9 0 00-3 17c.5.1.7-.2.7-.5v-2c-3 .7-3.6-1.2-3.6-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 0 1.5 1 1.5 1 .9 1.5 2.4 1.1 3 .8.1-.7.4-1.1.7-1.3-2.4-.3-5-1.2-5-5.4 0-1.2.4-2.1 1-2.9-.1-.3-.4-1.4.1-2.8 0 0 .8-.3 2.9 1.1.8-.2 1.7-.3 2.6-.3s1.8.1 2.6.3c2.1-1.4 2.9-1.1 2.9-1.1.5 1.4.2 2.5.1 2.8.6.8 1 1.7 1 2.9 0 4.2-2.6 5.1-5 5.4.4.3.8 1 .8 2v2.7c0 .3.2.6.8.5A9 9 0 0012 3z"/>',
    link: '<path d="M10 13a5 5 0 007 0l2-2a5 5 0 00-7-7l-1 1"/><path d="M14 11a5 5 0 00-7 0l-2 2a5 5 0 007 7l1-1"/>',
    spinner: '<path d="M12 3a9 9 0 019 9"/><path d="M21 12a9 9 0 01-9 9" opacity=".35"/><path d="M12 21a9 9 0 01-9-9" opacity=".35"/><path d="M3 12a9 9 0 019-9" opacity=".35"/>'
  });

  global.TiinexIconPaths = iconPaths;
})(typeof window !== 'undefined' ? window : globalThis);
