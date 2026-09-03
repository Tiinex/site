import React, { useEffect, useMemo, useState } from 'react';
import { buildPlaythingsTechTree, filterPlaythingsTechTreeNodes } from './playthings.techTree.js';
import { assignPlaythingsHotbarSkill, clearPlaythingsHotbarSlot, inspectPlaythingsSchema, upgradePlaythingsSchema } from './playthings.profile.js';

export function PlaythingsProgression({ model, profile, enabled = false, onProfileChange, onOpenRecord, onActivateSkill }) {
  const tree = useMemo(() => buildPlaythingsTechTree(model), [model]);
  const [treeOpen, setTreeOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [implementedOnly, setImplementedOnly] = useState(true);
  const [shiftHeld, setShiftHeld] = useState(false);
  const inspected = useMemo(() => new Set(profile.inspectedSchemaIds || []), [profile.inspectedSchemaIds]);
  const upgraded = useMemo(() => new Set(profile.upgradedSchemaIds || []), [profile.upgradedSchemaIds]);
  const skillNodes = tree.nodes.filter((node) => upgraded.has(node.schemaId) && node.creatable);
  const visibleTechNodes = useMemo(() => filterPlaythingsTechTreeNodes(tree, { implementedOnly }), [tree, implementedOnly]);
  const visibleTechIds = useMemo(() => new Set(visibleTechNodes.map((node) => node.schemaId)), [visibleTechNodes]);
  const techColumns = useMemo(() => techTreeColumns(visibleTechNodes, tree.byId), [visibleTechNodes, tree.byId]);
  const implementedCount = tree.nodes.filter((node) => node.implemented).length;
  const observedLockedCount = tree.nodes.filter((node) => !node.implemented && node.openAvailable).length;

  useEffect(() => {
    if (!enabled) { setShiftHeld(false); return undefined; }
    const down = (event) => { if (event.key === 'Shift') setShiftHeld(true); };
    const up = (event) => { if (event.key === 'Shift') setShiftHeld(false); };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;
    const activate = (event) => {
      const tag = String(event.target?.tagName || '').toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag) || event.altKey || event.ctrlKey || event.metaKey) return;
      const index = Number(event.key) - 1;
      if (!Number.isInteger(index) || index < 0 || index >= profile.hotbar.length) return;
      const schemaId = profile.hotbar[index];
      if (!schemaId) return;
      event.preventDefault();
      onActivateSkill?.(schemaId);
    };
    window.addEventListener('keydown', activate);
    return () => window.removeEventListener('keydown', activate);
  }, [enabled, profile.hotbar, onActivateSkill]);

  function inspect(node) {
    onProfileChange?.(inspectPlaythingsSchema(profile, node.schemaId));
    if (node.openAvailable) onOpenRecord?.(node.recordId, node.workspaceId);
  }
  function upgrade(node) {
    if (!node.implemented || upgraded.has(node.schemaId)) return;
    if (!shiftHeld && !inspected.has(node.schemaId)) return;
    onProfileChange?.(upgradePlaythingsSchema(profile, node.schemaId));
  }
  function dropSkill(event, slot) {
    event.preventDefault();
    const schemaId = event.dataTransfer?.getData('application/x-tiinex-playthings-skill') || event.dataTransfer?.getData('text/plain') || '';
    if (!schemaId || !skillNodes.some((node) => node.schemaId === schemaId)) return;
    onProfileChange?.(assignPlaythingsHotbarSkill(profile, slot, schemaId));
  }
  function quickAssign(schemaId) {
    const empty = profile.hotbar.findIndex((value) => !value);
    onProfileChange?.(assignPlaythingsHotbarSkill(profile, empty >= 0 ? empty : 0, schemaId));
  }

  if (!enabled) return null;
  return <>
    <div className="tx-playthings-live-tools" aria-label="Playthings live tools">
      <button type="button" onClick={() => setTreeOpen((value) => !value)} className={treeOpen ? 'is-active' : ''}>Tech Tree</button>
      <button type="button" onClick={() => setInventoryOpen((value) => !value)} className={inventoryOpen ? 'is-active' : ''}>Skills <b>{skillNodes.length}</b></button>
      <span>{shiftHeld ? 'SHIFT · quick unlock' : 'Open → Upgrade → skill'}</span>
    </div>

    {treeOpen ? <div className="tx-playthings-tech-panel" role="dialog" aria-label="Playthings schema tech tree">
      <div className="tx-playthings-panel-head tx-playthings-tech-head">
        <div><strong>SCHEMA TECH TREE</strong><small>Blueprint projection · real Parent topology · local game progression only</small></div>
        <button type="button" onClick={() => setTreeOpen(false)}>×</button>
      </div>
      <div className="tx-playthings-tech-toolbar">
        <label className="tx-playthings-tech-filter">
          <input type="checkbox" checked={implementedOnly} onChange={(event) => setImplementedOnly(event.currentTarget.checked)} />
          <span>Implemented only</span>
        </label>
        <div className="tx-playthings-tech-stats"><span><b>{implementedCount}</b> in Site</span><span><b>{observedLockedCount}</b> observed locked</span><span>{shiftHeld ? 'SHIFT HELD · quick upgrade' : 'Hold Shift to skip Open friction'}</span></div>
      </div>
      <div className="tx-playthings-tech-scroll">
        <div className="tx-playthings-tech-columns" style={{ '--pt-tech-columns': Math.max(1, techColumns.length) }}>
          {techColumns.map((column) => <section key={column.depth} className="tx-playthings-tech-column" data-depth={column.depth}>
            <header><span>TIER {column.depth}</span><b>{column.nodes.length}</b></header>
            <div className="tx-playthings-tech-column-nodes">
              {column.nodes.map((node) => <TechTreeNode key={node.schemaId} node={node} tree={tree} visibleTechIds={visibleTechIds} inspected={inspected} upgraded={upgraded} shiftHeld={shiftHeld} onInspect={inspect} onUpgrade={upgrade} />)}
            </div>
          </section>)}
        </div>
      </div>
      {!visibleTechNodes.length ? <div className="tx-playthings-tech-empty">No implemented schemas are visible in this observed material.</div> : null}
    </div> : null}

    {inventoryOpen ? <aside className="tx-playthings-skill-inventory" aria-label="Unlocked Playthings skills">
      <div className="tx-playthings-panel-head"><div><strong>SKILL INVENTORY</strong><small>Drag to hotbar · click to quick-slot</small></div><button type="button" onClick={() => setInventoryOpen(false)}>×</button></div>
      <div className="tx-playthings-skill-list">{skillNodes.length ? skillNodes.map((node) => <button key={node.schemaId} type="button" draggable onDragStart={(event) => { event.dataTransfer?.setData('application/x-tiinex-playthings-skill', node.schemaId); event.dataTransfer?.setData('text/plain', node.schemaId); }} onClick={() => quickAssign(node.schemaId)}><b>＋</b><span>{node.label}<small>{node.schemaId}</small></span></button>) : <p>Upgrade a creatable schema in the Tech Tree first.</p>}</div>
    </aside> : null}

    <div className="tx-playthings-hotbar" aria-label="Playthings skill hotbar">
      {profile.hotbar.map((schemaId, index) => {
        const node = tree.byId.get(schemaId);
        return <div key={index} className={`tx-playthings-hotbar-slot ${schemaId ? 'is-filled' : ''}`} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropSkill(event, index)}>
          <button type="button" disabled={!schemaId} onClick={() => schemaId && onActivateSkill?.(schemaId)} title={schemaId ? `Create ${node?.label || schemaId}` : 'Drop an unlocked skill here'}><kbd>{index + 1}</kbd><span>{node?.label || 'EMPTY'}</span></button>
          {schemaId ? <button type="button" className="clear" aria-label={`Clear hotbar slot ${index + 1}`} onClick={() => onProfileChange?.(clearPlaythingsHotbarSlot(profile, index))}>×</button> : null}
        </div>;
      })}
    </div>
  </>;
}

function TechTreeNode({ node, tree, visibleTechIds, inspected, upgraded, shiftHeld, onInspect, onUpgrade }) {
  const isInspected = inspected.has(node.schemaId);
  const isUpgraded = upgraded.has(node.schemaId);
  const canUpgrade = node.implemented && !isUpgraded && (isInspected || shiftHeld);
  const parent = node.parentSchemaId ? tree.byId.get(node.parentSchemaId) || null : null;
  const parentVisible = parent ? visibleTechIds.has(parent.schemaId) : false;
  const parentHint = parent ? (parentVisible ? `← ${parent.label}` : '← … hidden ancestor') : 'ROOT BLUEPRINT';
  const status = node.locked ? 'NOT IN SITE' : node.abstract ? 'ABSTRACT' : node.creatable ? 'CREATE CAPABLE' : 'IMPLEMENTED';
  return <article className={`tx-playthings-tech-node ${node.locked ? 'is-locked' : ''} ${isUpgraded ? 'is-upgraded' : ''} ${parent && !parentVisible ? 'has-hidden-parent' : ''}`} title={node.locked ? 'Not yet implemented in this Site build' : node.summary}>
    <div className="tx-playthings-tech-parent" title={parent?.schemaId || ''}>{parentHint}</div>
    <div className="tx-playthings-tech-node-title"><span className="tx-playthings-blueprint-chip">{node.locked ? '▧' : isUpgraded ? '◆' : '◇'}</span><div><strong>{node.label}</strong><small>{node.schemaId}</small></div></div>
    <div className="tx-playthings-tech-status"><span>{status}</span>{isInspected ? <span>INSPECTED</span> : null}{isUpgraded ? <span>UPGRADED</span> : null}</div>
    <p>{node.summary}</p>
    <div className="tx-playthings-tech-actions">
      <button type="button" onClick={() => onInspect(node)} disabled={!node.openAvailable} title={node.openAvailable ? 'Open the observed schema artifact detail' : 'Schema artifact is not loaded in the observed material'}>{isInspected ? 'Open again' : 'Open blueprint'}</button>
      <button type="button" className="upgrade" onClick={() => onUpgrade(node)} disabled={!canUpgrade}>{isUpgraded ? (node.creatable ? 'Skill unlocked' : 'Upgraded') : !node.implemented ? 'Locked' : !isInspected && !shiftHeld ? 'Open first' : shiftHeld && !isInspected ? 'Quick upgrade' : 'Upgrade'}</button>
    </div>
  </article>;
}

function techTreeColumns(nodes = [], byId = new Map()) {
  const columns = new Map();
  for (const node of nodes) {
    const depth = treeDepth(node, byId);
    if (!columns.has(depth)) columns.set(depth, []);
    columns.get(depth).push(node);
  }
  const maxDepth = Math.max(0, ...columns.keys());
  return Array.from({ length: maxDepth + 1 }, (_, depth) => ({
    depth,
    nodes: (columns.get(depth) || []).slice().sort((a, b) => String(a.parentSchemaId || '').localeCompare(String(b.parentSchemaId || '')) || a.label.localeCompare(b.label))
  })).filter((column) => column.nodes.length);
}

function treeDepth(node, byId) {
  let depth = 0, cursor = node, seen = new Set([node.schemaId]);
  while (cursor?.parentSchemaId && byId.has(cursor.parentSchemaId) && !seen.has(cursor.parentSchemaId)) { seen.add(cursor.parentSchemaId); cursor = byId.get(cursor.parentSchemaId); depth += 1; }
  return Math.min(8, depth);
}
