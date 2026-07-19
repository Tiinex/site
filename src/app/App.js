import { surfaceLabels } from '../surfaces/registry.js';

function badge(text) { return `<span class="tx-badge">${text}</span>`; }
function row(title, detail, badges=[]) { return `<div class="tx-row"><div><strong>${title}</strong><div class="tx-muted">${detail}</div></div><div class="tx-badges">${badges.map(badge).join('')}</div></div>`; }

export function renderApp(root, model) {
  if (!root) throw new Error('Missing #root mount point');
  const schemas = model.schemas.modules.map((schema) => row(schema.label, schema.summary, [schema.kind, schema.id]));
  const surfaces = surfaceLabels().map((surface) => row(surface.label, surface.purpose, [surface.kind]));
  root.innerHTML = `
    <main class="tx-shell">
      <header class="tx-topbar">
        <div class="tx-brand"><img class="tx-logo" src="./public/assets/tiinex-logo-white-transparent.png" alt=""><span>Tiinex Site</span></div>
        <nav class="tx-toolbar"><span class="tx-pill">fresh v82 shell</span><span class="tx-pill">legacy archived</span><span class="tx-pill">i18n ready</span></nav>
      </header>
      <section class="tx-hero">
        <h1>${model.title}</h1>
        <p class="tx-muted">${model.summary}</p>
        <div class="tx-badges">${badge('app.js not loaded')}${badge('schema modules')}${badge('presentation surfaces')}${badge('audit owns load-all')}</div>
      </section>
      <section class="tx-grid">
        <article class="tx-card"><h2>Schema module projection</h2><div class="tx-list">${schemas.join('')}</div></article>
        <article class="tx-card"><h2>Presentation surfaces</h2><div class="tx-list">${surfaces.join('')}</div></article>
        <article class="tx-card"><h2>Audit ownership</h2><pre>${model.audit}</pre></article>
        <article class="tx-card tx-warning"><h2>Boundary</h2><p class="tx-muted">The v79 app is available in <code>.old/</code> for UX and behavior reference, but it is ignored and not imported by this runtime.</p></article>
      </section>
    </main>`;
}
