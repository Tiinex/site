import { shortText } from '../core/text.mjs';
import { stripMarkdownInline } from '../core/markdown.mjs';
import { escapeHtml } from './html.mjs';

export function renderPreviewSections(sections, names) {
  const html = names
    .filter((name) => sections[name] && sections[name].trim())
    .slice(0, 4)
    .map((name) => `<section class="preview-section"><h4>${escapeHtml(name)}</h4><p>${escapeHtml(shortText(stripMarkdownInline(sections[name]), 260))}</p></section>`)
    .join('');
  return html || '<p class="preview-note">No prioritized continuity sections found for this schema.</p>';
}
