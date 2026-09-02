import React from 'react';

export function PixelPlaything({ role = 'leaf', branchDepth = 0, variant = 0, ghost = false, shirtColor = '#79b86f', idleState = 'normal' }) {
  const v = Math.abs(Number(variant || 0)) % 4;
  return <g className={`tx-playthings-sprite role-${role} variant-${v} ${ghost ? 'is-ghost' : ''}`} style={{ '--plaything-shirt': shirtColor }}>
    {v === 0 ? <>
      <rect className="body" x="-7" y="-8" width="14" height="17" />
      <rect className="shirt" x="-6" y="2" width="12" height="6" />
      <rect className="face" x="-5" y="-5" width="10" height="7" />
      <rect className="eye" x="-3" y="-3" width="2" height="2" /><rect className="eye" x="2" y="-3" width="2" height="2" />
      <rect className="foot" x="-7" y="9" width="5" height="4" /><rect className="foot" x="2" y="9" width="5" height="4" />
      <rect className="accent" x="-10" y="-10" width="4" height="5" /><rect className="accent" x="6" y="-10" width="4" height="5" />
    </> : null}
    {v === 1 ? <>
      <rect className="body" x="-6" y="-10" width="12" height="19" />
      <rect className="shirt" x="-5" y="2" width="10" height="6" />
      <rect className="face" x="-5" y="-6" width="10" height="8" />
      <rect className="eye" x="-3" y="-4" width="2" height="2" /><rect className="eye" x="2" y="-4" width="2" height="2" />
      <rect className="limb" x="-10" y="-3" width="4" height="7" /><rect className="limb" x="6" y="-3" width="4" height="7" />
      <rect className="antenna" x="-1" y="-15" width="2" height="5" /><rect className="accent" x="-3" y="-17" width="6" height="3" />
    </> : null}
    {v === 2 ? <>
      <rect className="body" x="-9" y="-6" width="18" height="15" />
      <rect className="shirt" x="-8" y="3" width="16" height="5" />
      <rect className="face" x="-7" y="-4" width="14" height="7" />
      <rect className="eye" x="-5" y="-2" width="3" height="2" /><rect className="eye" x="3" y="-2" width="3" height="2" />
      <rect className="foot" x="-8" y="9" width="5" height="4" /><rect className="foot" x="3" y="9" width="5" height="4" />
      <rect className="accent" x="-12" y="-8" width="5" height="4" /><rect className="accent" x="7" y="-8" width="5" height="4" />
    </> : null}
    {v === 3 ? <>
      <rect className="body" x="-8" y="-8" width="16" height="17" />
      <rect className="shirt" x="-7" y="3" width="14" height="5" />
      <rect className="face" x="-6" y="-5" width="12" height="8" />
      <rect className="eye" x="-4" y="-3" width="2" height="3" /><rect className="eye" x="3" y="-3" width="2" height="3" />
      <rect className="limb" x="-11" y="0" width="3" height="7" /><rect className="limb" x="8" y="0" width="3" height="7" />
      <rect className="accent" x="-3" y="-13" width="6" height="5" />
    </> : null}
    <RoleSigil role={role} />
    {idleState === 'long-idle' ? <g className="idle-wear"><rect className="idle-cap" x="-6" y="-13" width="12" height="3" /><rect className="idle-trouser" x="-6" y="8" width="5" height="3" /><rect className="idle-trouser" x="1" y="8" width="5" height="3" /></g> : null}
    {idleState === 'resting' ? <g className="rest-wear"><rect className="idle-cap" x="-7" y="-14" width="14" height="4" /><rect className="rest-tassel" x="6" y="-12" width="4" height="2" /></g> : null}
    {branchDepth > 0 ? <rect className="branch-crown" x="-4" y="-19" width="8" height="2" /> : null}
  </g>;
}

export function PixelOrganizationPlace({ depth = 0 }) {
  const level = Math.max(0, Number(depth || 0));
  if (level === 0) return <g className="tx-playthings-organization-art is-castle">
    <rect className="wall" x="-24" y="-10" width="48" height="29" />
    <rect className="tower" x="-31" y="-22" width="13" height="41" /><rect className="tower" x="18" y="-22" width="13" height="41" />
    <rect className="keep" x="-10" y="-31" width="20" height="21" />
    <rect className="door" x="-5" y="7" width="10" height="12" />
    <rect className="flag" x="1" y="-39" width="16" height="7" /><rect className="pole" x="-1" y="-41" width="2" height="14" />
  </g>;
  if (level === 1) return <g className="tx-playthings-organization-art is-fort">
    <rect className="wall" x="-21" y="-7" width="42" height="25" />
    <rect className="tower" x="-27" y="-16" width="12" height="34" /><rect className="tower" x="15" y="-16" width="12" height="34" />
    <rect className="door" x="-4" y="7" width="8" height="11" />
    <rect className="flag" x="0" y="-25" width="13" height="6" /><rect className="pole" x="-2" y="-27" width="2" height="15" />
  </g>;
  return <g className="tx-playthings-organization-art is-village">
    <VillageHouse x={-24} y={3} size={1} /><VillageHouse x={3} y={-3} size={0} /><VillageHouse x={22} y={7} size={0} />
    <rect className="well" x="-4" y="10" width="8" height="7" /><rect className="well-top" x="-6" y="8" width="12" height="3" />
    {level > 2 ? <VillageHouse x={-2} y={-19} size={0} /> : null}
  </g>;
}


export function PixelWorkspacePlace({ clusterSize = 1 }) {
  const count = Math.max(1, Math.min(5, Number(clusterSize || 1)));
  const houses = [
    [-18, 4, 1],
    [12, 2, 0],
    [-2, -17, 0],
    [30, -13, 0],
    [-34, -15, 0]
  ];
  return <g className={`tx-playthings-workspace-art cluster-${count}`}>
    {houses.slice(0, count).map(([x,y,size], index) => <WorkshopHouse key={index} x={x} y={y} size={size} />)}
    <rect className="yard" x="-10" y="13" width="20" height="5" />
    <rect className="mast" x="-1" y="-34" width="2" height="19" /><path className="dish" d="M -9 -33 Q 0 -24 9 -33" />
    {count > 1 ? <path className="wire" d="M -27 -1 C -15 8 10 8 23 -1" /> : null}
  </g>;
}

export function PlaythingsSceneArtwork({ interactionKind = 'inspect' }) {
  if (interactionKind === 'blueprint') return <g className="tx-playthings-scene-art is-blueprint"><rect className="blueprint" x="-15" y="-10" width="30" height="20" /><path className="blueprint-line" d="M -10 -5 H 5 V 3 H 11 M -10 1 H -2 V 7 H 8" /></g>;
  if (interactionKind === 'signal') return <g className="tx-playthings-scene-art is-signal-call"><circle className="signal-ring ring-a" r="8" /><circle className="signal-ring ring-b" r="15" /><circle className="signal-ring ring-c" r="22" /><path className="voice" d="M -4 -2 L 1 -6 V 6 L -4 2 Z M 3 -3 Q 8 0 3 3" /></g>;
  if (interactionKind === 'feedback') return <g className="tx-playthings-scene-art is-feedback-talk"><rect className="bubble" x="-16" y="-13" width="20" height="12" /><path className="bubble-tail" d="M -4 -1 L 0 5 L 2 -1" /><rect className="bubble other" x="5" y="-5" width="17" height="10" /></g>;
  if (interactionKind === 'interpret') return <g className="tx-playthings-scene-art is-interpret"><rect className="prop" x="-12" y="-9" width="24" height="18" /><path className="detail" d="M -8 -4 H 7 M -8 1 H 2 M -8 6 H 6" /><circle className="lens" cx="9" cy="7" r="5" /></g>;
  if (interactionKind === 'notice') return <g className="tx-playthings-scene-art is-notice"><path className="notice-mark" d="M 0 -13 L 12 10 H -12 Z" /><rect className="notice-core" x="-1" y="-6" width="2" height="9" /><rect className="notice-core" x="-1" y="6" width="2" height="2" /></g>;
  if (interactionKind === 'arrange') return <g className="tx-playthings-scene-art is-arrange"><rect className="panel" x="-17" y="-10" width="14" height="9" /><rect className="panel" x="3" y="-4" width="14" height="9" /><path className="tool" d="M -5 9 H 12" /></g>;
  if (interactionKind === 'work' || interactionKind === 'build') return <g className="tx-playthings-scene-art is-work">
    <rect className="prop" x="-13" y="2" width="26" height="5" /><rect className="prop" x="-9" y="7" width="4" height="8" /><rect className="prop" x="5" y="7" width="4" height="8" />
    <path className="tool" d="M -3 0 L 7 -11 M 4 -13 L 10 -7" />
  </g>;
  if (interactionKind === 'receive' || interactionKind === 'pass') return <g className="tx-playthings-scene-art is-handoff">
    <rect className="prop" x="-8" y="0" width="16" height="11" /><path className="detail" d="M -8 0 L 0 6 L 8 0" />
    <path className="signal" d="M -17 -7 H -10 M 10 -7 H 17" />
  </g>;
  if (interactionKind === 'observe' || interactionKind === 'read') return <g className="tx-playthings-scene-art is-observe">
    <path className="tool" d="M -3 1 L 10 -10 M 6 -12 L 13 -5 M 0 2 L -6 13 M 0 2 L 7 13" />
  </g>;
  if (interactionKind === 'decide') return <g className="tx-playthings-scene-art is-decision">
    <path className="tool" d="M 0 11 V -2 M 0 -2 L -10 -12 M 0 -2 L 10 -12" />
    <rect className="signal" x="-13" y="-15" width="6" height="4" /><rect className="signal" x="7" y="-15" width="6" height="4" />
  </g>;
  if (interactionKind === 'connect') return <g className="tx-playthings-scene-art is-connect">
    <rect className="prop" x="-14" y="-4" width="7" height="7" /><rect className="prop" x="7" y="-4" width="7" height="7" /><path className="tool" d="M -7 0 H 7" />
  </g>;
  if (interactionKind === 'preserve' || interactionKind === 'attest') return <g className="tx-playthings-scene-art is-record">
    <rect className="prop" x="-9" y="-10" width="18" height="20" /><path className="detail" d="M -5 -5 H 5 M -5 0 H 5 M -5 5 H 2" />
  </g>;
  return <g className="tx-playthings-scene-art is-generic"><rect className="prop" x="-6" y="-6" width="12" height="12" transform="rotate(45)" /></g>;
}

export function TerrainMark({ x, y, kind }) {
  if (kind === 'stone') return <g className="tx-playthings-terrain-mark is-stone" transform={`translate(${x} ${y})`}><rect x="-5" y="-2" width="10" height="4" /><rect x="-3" y="-5" width="6" height="3" /></g>;
  if (kind === 'tuft-wide') return <g className="tx-playthings-terrain-mark" transform={`translate(${x} ${y})`}><path d="M -7 3 L -4 -4 L -2 3 L 1 -6 L 3 3 L 6 -3 L 7 3" /></g>;
  return <g className="tx-playthings-terrain-mark" transform={`translate(${x} ${y})`}><path d="M -4 3 L -2 -4 L 0 3 L 3 -5 L 4 3" /></g>;
}

export function InteractionSpark({ kind = 'inspect' }) {
  if (kind === 'work' || kind === 'build') return <path className="tx-playthings-interaction-spark" d="M -15 -19 L -10 -24 M 10 -24 L 15 -19 M 0 -29 V -21" />;
  if (kind === 'receive' || kind === 'pass' || kind === 'connect') return <path className="tx-playthings-interaction-spark" d="M -18 -20 H -10 M 10 -20 H 18 M 0 -28 V -21" />;
  return <path className="tx-playthings-interaction-spark" d="M 0 -28 V -21 M -13 -24 L -8 -20 M 13 -24 L 8 -20" />;
}

function WorkshopHouse({ x, y, size }) {
  const w = size ? 22 : 16, h = size ? 16 : 12;
  return <g transform={`translate(${x} ${y})`}><rect className="workshop" x={-w/2} y={-h/2} width={w} height={h} /><path className="workshop-roof" d={`M ${-w/2-2} ${-h/2} L 0 ${-h/2-7} L ${w/2+2} ${-h/2} Z`} /><rect className="workshop-door" x="-2" y={h/2-7} width="4" height="7" /><rect className="workshop-window" x={w/2-6} y={-h/2+3} width="4" height="4" /></g>;
}

function VillageHouse({ x, y, size }) {
  const w = size ? 18 : 14;
  const h = size ? 13 : 10;
  return <g transform={`translate(${x} ${y})`}><rect className="house" x={-w / 2} y={-h / 2} width={w} height={h} /><path className="roof" d={`M ${-w / 2 - 2} ${-h / 2} L 0 ${-h / 2 - 8} L ${w / 2 + 2} ${-h / 2} Z`} /><rect className="door" x="-2" y={h / 2 - 6} width="4" height="6" /></g>;
}

function RoleSigil({ role }) {
  if (role === 'organization-place') return <path className="sigil" d="M -3 2 V -2 H -1 V 0 H 1 V -2 H 3 V 2" />;
  if (role === 'handoff-scene') return <path className="sigil" d="M -3 1 H 3 M 1 -2 L 4 1 L 1 4" />;
  if (role === 'workbench' || role === 'project-scene') return <path className="sigil" d="M -3 2 L 3 -2 M 1 -3 L 4 0" />;
  return <rect className="sigil-fill" x="-1" y="0" width="2" height="2" />;
}
