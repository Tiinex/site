import React from 'react';
import { Badge } from '../../ui/primitives/Badge.jsx';
import { Icon } from '../../ui/primitives/Icon.jsx';
import { schemaReadPresentation } from '../companion.js';
import { readStateLabel, schemaCoverageLabel } from './workspace.viewFormatting.js';

function SchemaReadSectionBody({ value = '' }) {
  const blocks = schemaReadBlocks(value);
  if (!blocks.length) return <p className="tx-schema-read-paragraph">—</p>;
  return (
    <div className="tx-schema-read-body">
      {blocks.map((block, index) => block.type === 'list' ? (
        <ul key={`list-${index}`}>
          {block.items.map((item, itemIndex) => <li key={`${index}-${itemIndex}`}>{item}</li>)}
        </ul>
      ) : (
        <p key={`paragraph-${index}`} className="tx-schema-read-paragraph">{block.text}</p>
      ))}
    </div>
  );
}

function SchemaReadStateChips({ presentation = {} }) {
  const readState = presentation.readState || (presentation.fallbackUsed ? 'root-fallback' : 'schema-owned');
  const coverage = presentation.schemaCoverage || (presentation.fallbackUsed ? 'unknown-schema' : 'exact-companion');
  const body = presentation.bodyAvailability || 'available';
  return (
    <div className="tx-read-state-chips" aria-label="Read-state contract">
      <Badge className={`tx-read-state-chip tx-read-state-${readState}`}>{readStateLabel(readState)}</Badge>
      {coverage !== 'exact-companion' ? <Badge className={`tx-read-state-chip tx-schema-coverage-${coverage}`}>{schemaCoverageLabel(coverage)}</Badge> : null}
      {body === 'unavailable-body' ? <Badge className="tx-read-state-chip tx-read-state-unavailable-body">body unavailable</Badge> : null}
    </div>
  );
}

function schemaReadBlocks(value = '') {
  const lines = String(value || '').split(/\r?\n/);
  const blocks = [];
  let list = null;
  let paragraph = [];
  const flushParagraph = () => {
    const text = paragraph.join(' ').replace(/\s+/g, ' ').trim();
    if (text && text !== '---') blocks.push({ type: 'paragraph', text });
    paragraph = [];
  };
  const flushList = () => {
    if (list?.items?.length) blocks.push(list);
    list = null;
  };
  for (const rawLine of lines) {
    const line = String(rawLine || '').trim();
    if (!line || line === '---') {
      flushParagraph();
      flushList();
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.+)$/);
    if (bullet) {
      flushParagraph();
      if (!list) list = { type: 'list', items: [] };
      list.items.push(bullet[1].trim());
      continue;
    }
    flushList();
    paragraph.push(line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

export function SchemaReadView({ record = {}, compact = false, maxSections = null, showHeader = true, lineClamp = false }) {
  const presentation = schemaReadPresentation(record, { compact, maxSections, lineClamp });
  const fallbackUsed = presentation.readMode === 'root-fallback' || presentation.fallbackUsed === true;
  const readState = presentation.readState || (fallbackUsed ? 'root-fallback' : 'schema-owned');
  if (!presentation.sections.length) {
    return (
      <section className={`tx-schema-read-view tx-schema-read-fallback tx-schema-read-empty-fallback tx-read-state-${readState}`} aria-label="Root fallback artifact read view">
        <SchemaReadStateChips presentation={presentation} />
        <div className="tx-schema-read-disclosure"><Icon name="warning" /><strong>{readState === 'unavailable-body' ? 'Body unavailable' : 'Root fallback'}</strong><span>{readState === 'unavailable-body' ? 'Material is not loaded in this route/session; source boundary is preserved.' : 'Exact schema read companion is not registered yet; source Markdown remains available.'}</span></div>
      </section>
    );
  }
  return (
    <section className={`tx-schema-read-view ${compact ? 'tx-schema-read-compact' : ''} ${fallbackUsed ? 'tx-schema-read-fallback' : 'tx-schema-read-owned'} tx-read-state-${readState}`} aria-label={fallbackUsed ? 'Root fallback artifact read view' : 'Schema-owned artifact read view'}>
      {showHeader ? (
        <header>
          <span>{presentation.label}</span>
          <h3>{presentation.title}</h3>
          {presentation.summary ? <p>{presentation.summary}</p> : null}
        </header>
      ) : null}
      <SchemaReadStateChips presentation={presentation} />
      {fallbackUsed ? <div className="tx-schema-read-disclosure"><Icon name="warning" /><strong>Root fallback</strong><span>Generic Root projection; exact child companion is not implemented yet.</span></div> : null}
      <div className="tx-schema-read-sections">
        {presentation.sections.map((section) => (
          <article key={section.label} className="tx-schema-read-section">
            <span>{section.label}</span>
            <SchemaReadSectionBody value={section.value} />
          </article>
        ))}
      </div>
    </section>
  );
}
