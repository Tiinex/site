import React, { useEffect, useMemo, useState } from 'react';
import { buildPlaythingsTechTree } from './playthings.techTree.js';
import { assignPlaythingsHotbarSkill, clearPlaythingsHotbarSlot, inspectPlaythingsSchema, upgradePlaythingsSchema } from './playthings.profile.js';

export function PlaythingsProgression({ model, profile, enabled = false, onProfileChange, onOpenRecord, onActivateSkill }) {
  const tree = useMemo(() => buildPlaythingsTechTree(model), [model]);
  const [treeOpen, setTreeOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [shiftHeld, setShiftHeld] = useState(false);
  const inspected = useMemo(() => new Set(profile.inspectedSchemaIds || []), [profile.inspectedSchemaIds]);
  const upgraded = useMemo(() => new Set(profile.upgradedSchemaIds || []), [profile.upgradedSchemaIds]);
  const skillNodes = tree.nodes.filter((node) => upgraded.has(node.schemaId) && node.creatable);

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
      <div className="tx-playthings-panel-head"><div><strong>SCHEMA TECH TREE</strong><small>Known blueprints · Playthings progress only</small></div><button type="button" onClick={() => setTreeOpen(false)}>×</button></div>
      <div className="tx-playthings-tech-tree">
        {tree.nodes.map((node) => {
          const isInspected = inspected.has(node.schemaId), isUpgraded = upgraded.has(node.schemaId);
          const depth = treeDepth(node, tree.byId);
          const canUpgrade = node.implemented && !isUpgraded && (isInspected || shiftHeld);
          return <article key={node.schemaId} className={`tx-playthings-tech-node ${node.locked ? 'is-locked' : ''} ${isUpgraded ? 'is-upgraded' : ''}`} style={{ '--pt-tech-depth': depth }} title={node.locked ? 'Not yet implemented in this Site build' : node.summary}>
            <div className="tx-playthings-tech-wire" aria-hidden="true" />
            <div className="tx-playthings-tech-node-title"><span>{node.locked ? '▧' : isUpgraded ? '◆' : '◇'}</span><div><strong>{node.label}</strong><small>{node.schemaId}</small></div></div>
            <div className="tx-playthings-tech-status">{node.locked ? 'LOCKED · NOT YET IMPLEMENTED' : node.abstract ? 'ABSTRACT BLUEPRINT' : node.creatable ? 'CREATE CAPABLE' : 'IMPLEMENTED'}</div>
            <div className="tx-playthings-tech-actions">
              <button type="button" onClick={() => inspect(node)} disabled={!node.openAvailable} title={node.openAvailable ? 'Open the observed schema artifact detail' : 'Schema artifact is not loaded in the observed material'}>{isInspected ? 'Open again' : 'Open'}</button>
              <button type="button" className="upgrade" onClick={() => upgrade(node)} disabled={!canUpgrade}>{isUpgraded ? (node.creatable ? 'Skill unlocked' : 'Upgraded') : !node.implemented ? 'Locked' : !isInspected && !shiftHeld ? 'Open first' : shiftHeld && !isInspected ? 'Quick upgrade' : 'Upgrade'}</button>
            </div>
          </article>;
        })}
      </div>
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

function treeDepth(node, byId) {
  let depth = 0, cursor = node, seen = new Set([node.schemaId]);
  while (cursor?.parentSchemaId && byId.has(cursor.parentSchemaId) && !seen.has(cursor.parentSchemaId)) { seen.add(cursor.parentSchemaId); cursor = byId.get(cursor.parentSchemaId); depth += 1; }
  return Math.min(6, depth);
}
