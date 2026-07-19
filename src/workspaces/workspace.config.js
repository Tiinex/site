(function attachWorkspaceConfig(global) {
  'use strict';

  const DEFAULT_WORKSPACE_MARKDOWN = "# Continuity Context\n\n- Envelope Schema: [tiinex.root.v1](https://github.com/Tiinex/docs/blob/7aecdb99551c4b6850665cdee418f0b9907d9616/.topics/.schemas/tiinex.root.v1.schema.md)\n- Current\n  - Current Schema: [tiinex.workspace.v1](../.schemas/tiinex.workspace.v1.schema.md)\n  - Created At: 2026-06-16 00:00:00\n  - Why: Defines a portable multi-lineage workspace entrypoint.\n  - Summary: Opens the Tiinex docs workspace and declares the default viewer discovery lens.\n\n---\n\n# Tiinex Viewer\n\n## Viewer Identity\n\n- Icon: ../../assets/tiinex-logo-white-transparent.png\n- Browser Title: Tiinex\n- Home: https://github.com/Tiinex\n- Public Viewer URL: https://tiinex.dev/\n- Workspace Home: https://tiinex.dev/\n\n## Empty Stage\n\n- Subtitle: Every handoff starts somewhere\n- Subtitle: Start where the last thread ends\n- Subtitle: Leave enough for the next mind\n- Subtitle: A thread is waiting\n- Subtitle: Nothing starts from nothing\n\n## Schema Origins\n\n- [Tiinex docs schemas](https://github.com/Tiinex/docs/tree/master/.topics/.schemas)\n  - Kind: github-tree\n  - Repository: Tiinex/docs\n  - Ref: master\n  - Root Path: .topics/.schemas\n  - Trust Role: canonical-core\n\n- [Viewer local schemas](../../src/schemas)\n  - Kind: app-local\n  - Repository: Tiinex/site\n  - Root Path: src/schemas\n  - Trust Role: viewer-extension\n  - Purpose: app-specific schema projections and viewer-only modules\n\n## Workspace Discovery\n\n- [Tiinex docs workspaces](https://github.com/Tiinex/docs)\n  - Kind: github-tree\n  - Ref: master\n  - Root Path: .topics\n  - Match: *.workspace.md\n  - Label: Tiinex docs workspaces\n  - Open Behavior: chooser\n\n## Workspace Entrypoints\n\n### Tiinex docs\n\n- Source Kind: github-tree\n- Repository: Tiinex/docs\n- Ref: master\n- Root Path: .topics\n- Repo Files Discovery: on\n- Issue Discovery: on\n- Issue URL: https://github.com/Tiinex/docs/issues/9\n- Default View: feed\n- Default Filter: all\n\n## Repository Mirrors\n\n### Tiinex docs\n\n- Repository: Tiinex/docs\n- URL: https://github.com/Tiinex/docs.git\n\n### Tiinex ai-provenance\n\n- Repository: Tiinex/ai-provenance\n- URL: https://github.com/Tiinex/ai-provenance.git\n\n## Repository Transports\n\n### Shared browser Git proxy\n\n- Kind: git-proxy\n- Match: github.com/*\n- Proxy: https://cors.isomorphic-git.org\n\n## Help\n\n### What is this view?\n\nThis workspace opens Tiinex markdown artifacts so an external reviewer and their LLM helpers can inspect continuity, source material, integrity signals, and continuation paths.\n\n### What should I check first?\n\nStart with what is loaded.\n\nCheck the workspace source, then inspect the visible badges. Treat integrity mismatch, missing integrity, unknown schema, and local-only material as review signals, not automatic failure.\n\n### What should I trust?\n\nTrust only what the artifact and its sources actually show.\n\nUse `Source` to inspect where material came from, `Markdown` to read the artifact, `Open` to inspect the selected node, and `Continue` only when the next step is clear enough to preserve.\n\n### What should an LLM preserve?\n\nDo not collapse Parent and Origin.\n\nParent is the declared continuity edge. Origin is provenance for where the material came from. If either is missing or weak, say so rather than filling the gap.\n\n### What should I send back?\n\nA useful validation note names the selected artifact, the source inspected, the observed signal, and the smallest next correction or continuation.\n\n---\n\n# Continuity Integrity\n\n- [sha256-base64url-c14n-v1](https://github.com/Tiinex/docs/blob/3466e50d739a9ba65319297cef79c6b09844b1d7/.topics/.validators/sha256-base64url-c14n-v1.validator.md)\n  - Towards: [viewer.workspace.md](viewer.workspace.md)\n  - Value: 6H8m4TbXAerVosJMfQWwGw9diSTKhp2rbaTqiClVP7k\n";

  function parseWorkspaceConfig(markdown) {
    const text = String(markdown || '');
    return {
      source: { kind: 'workspace-md', path: '.topics/.workspaces/viewer.workspace.md', fallback: !text.trim() },
      viewerIdentity: parseViewerIdentity(text),
      emptyStage: parseEmptyStage(text),
      schemaOrigins: parseLinkedGroups(markdownSection(text, 'Schema Origins')),
      workspaceDiscovery: parseLinkedGroups(markdownSection(text, 'Workspace Discovery')),
      workspaceEntrypoints: parseHeadingGroups(markdownSection(text, 'Workspace Entrypoints')),
      repositoryMirrors: parseHeadingGroups(markdownSection(text, 'Repository Mirrors')),
      repositoryTransports: parseHeadingGroups(markdownSection(text, 'Repository Transports')),
      help: parseHelp(markdownSection(text, 'Help'))
    };
  }

  function createDefaultWorkspaceConfig(markdown) {
    return parseWorkspaceConfig(markdown || DEFAULT_WORKSPACE_MARKDOWN);
  }

  function parseViewerIdentity(markdown) {
    const map = sectionKeyValueMap(markdownSection(markdown, 'Viewer Identity'));
    return {
      icon: firstValue(map, ['Icon'], '../../assets/tiinex-logo-white-transparent.png'),
      browserTitle: firstValue(map, ['Browser Title', 'Title'], 'Tiinex'),
      home: firstValue(map, ['Home'], ''),
      publicViewerUrl: firstValue(map, ['Public Viewer URL'], ''),
      workspaceHome: firstValue(map, ['Workspace Home', 'Home'], '')
    };
  }

  function parseEmptyStage(markdown) {
    const map = sectionKeyValueMap(markdownSection(markdown, 'Empty Stage'));
    const subtitles = valuesFor(map, ['Subtitle', 'Subtitles']).filter(Boolean);
    return {
      subtitles: subtitles.length ? subtitles : ['Everything starts from somewhere.'],
      dropBehavior: firstValue(map, ['Empty Drop Behavior'], 'create-or-open-local-workspace'),
      copyLinkBehavior: firstValue(map, ['Empty Copy Link Behavior'], 'clean-url')
    };
  }

  function emptyStageSubtitle(config, cursor = 0) {
    const subtitles = Array.isArray(config?.emptyStage?.subtitles) && config.emptyStage.subtitles.length
      ? config.emptyStage.subtitles
      : ['Everything starts from somewhere.'];
    return subtitles[Math.abs(Number(cursor) || 0) % subtitles.length];
  }

  function markdownSection(markdown, heading) {
    const lines = String(markdown || '').split(/\r?\n/);
    const start = lines.findIndex((line) => line.trim().toLowerCase() === `## ${heading}`.toLowerCase());
    if (start < 0) return '';
    const out = [];
    for (let index = start + 1; index < lines.length; index += 1) {
      if (/^##\s+/.test(lines[index])) break;
      out.push(lines[index]);
    }
    return out.join('\n');
  }

  function parseLinkedGroups(section) {
    const lines = String(section || '').split(/\r?\n/);
    const groups = [];
    let current = null;
    lines.forEach((line) => {
      const top = line.match(/^\s*[-*]\s+\[(.+?)\]\((.+?)\)\s*$/);
      const child = line.match(/^\s{2,}[-*]\s+([^:]+):\s*(.+?)\s*$/);
      if (top) {
        current = { title: top[1].trim(), href: top[2].trim() };
        groups.push(current);
      } else if (current && child) {
        current[toCamel(child[1])] = cleanListValue(child[2]);
      }
    });
    return groups;
  }

  function parseHeadingGroups(section) {
    const lines = String(section || '').split(/\r?\n/);
    const groups = [];
    let current = null;
    lines.forEach((line) => {
      const heading = line.match(/^###\s+(.+?)\s*$/);
      const item = line.match(/^\s*[-*]\s+([^:]+):\s*(.+?)\s*$/);
      if (heading) {
        current = { name: heading[1].trim() };
        groups.push(current);
      } else if (current && item) {
        current[toCamel(item[1])] = cleanListValue(item[2]);
      }
    });
    return groups;
  }

  function parseHelp(section) {
    return parseHeadingGroups(section).map((group) => {
      const lines = markdownSubsection(section, group.name).split(/\r?\n/).filter(Boolean);
      return { question: group.name, body: lines.join('\n').trim() };
    });
  }

  function markdownSubsection(section, heading) {
    const lines = String(section || '').split(/\r?\n/);
    const start = lines.findIndex((line) => line.trim().toLowerCase() === `### ${heading}`.toLowerCase());
    if (start < 0) return '';
    const out = [];
    for (let index = start + 1; index < lines.length; index += 1) {
      if (/^###\s+/.test(lines[index])) break;
      out.push(lines[index]);
    }
    return out.join('\n').trim();
  }

  function sectionKeyValueMap(section) {
    const map = new Map();
    String(section || '').split(/\r?\n/).forEach((line) => {
      const match = line.match(/^\s*[-*]\s+([^:]+):\s*(.+?)\s*$/);
      if (!match) return;
      const key = match[1].trim();
      const value = cleanListValue(match[2]);
      if (!map.has(key)) map.set(key, []);
      if (value) map.get(key).push(value);
    });
    return map;
  }

  function valuesFor(map, keys) { return keys.flatMap((key) => map.get(key) || []); }
  function firstValue(map, keys, fallback = '') { return valuesFor(map, keys)[0] || fallback; }
  function cleanListValue(value) { return String(value || '').replace(/^\[(.+?)\]\(.+?\)$/u, '$1').trim(); }
  function toCamel(value) { return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+([a-z0-9])/g, (_m, c) => c.toUpperCase()); }

  global.TiinexWorkspaceConfig = {
    DEFAULT_WORKSPACE_MARKDOWN,
    createDefaultWorkspaceConfig,
    emptyStageSubtitle,
    parseWorkspaceConfig,
    parseHeadingGroups,
    parseLinkedGroups
  };
})(typeof window !== 'undefined' ? window : globalThis);
