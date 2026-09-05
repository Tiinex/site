import React from 'react';
import { playthingsRoleHat } from './playthings.seed.js';

export function PixelPlaything({ role = 'leaf', roleIdentity = '', branchDepth = 0, variant = 0, ghost = false, shirtColor = '#79b86f', idleState = 'normal' }) {
  const v = Math.abs(Number(variant || 0)) % 4;
  const roleHat = playthingsRoleHat(roleIdentity);
  return <g className={`tx-playthings-sprite role-${role} variant-${v} ${ghost ? 'is-ghost' : ''}`} style={{ '--plaything-shirt': shirtColor, '--plaything-role-hat': roleHat.color }}>
    <rect className="sprite-shadow" x="-8" y="8" width="16" height="3" />
    <rect className="boot" x="-7" y="8" width="5" height="4" /><rect className="boot" x="2" y="8" width="5" height="4" />
    <rect className="trouser" x="-6" y="3" width="5" height="6" /><rect className="trouser" x="1" y="3" width="5" height="6" />
    <rect className="torso-outline" x="-8" y="-4" width="16" height="9" />
    <rect className="shirt" x="-7" y="-3" width="14" height="7" />
    <rect className="shirt-light" x="-6" y="-2" width="4" height="2" />
    <rect className="belt" x="-7" y="3" width="14" height="2" />
    <rect className="arm skin" x="-10" y="-3" width="3" height="7" /><rect className="arm skin" x="7" y="-3" width="3" height="7" />
    <rect className="head-outline" x="-7" y="-12" width="14" height="9" />
    <rect className="face" x="-6" y="-11" width="12" height="7" />
    <rect className="face-light" x="-5" y="-10" width="4" height="2" />
    <VariantHair variant={v} />
    <rect className="eye" x="-4" y="-8" width="2" height="2" /><rect className="eye" x="3" y="-8" width="2" height="2" />
    <rect className="cheek" x="-5" y="-5" width="2" height="1" /><rect className="cheek" x="3" y="-5" width="2" height="1" />
    <RoleSigil role={role} />
    {roleHat.visible ? <RoleHat variant={roleHat.variant} /> : null}
    {idleState === 'long-idle' || idleState === 'resting' ? <g className="idle-wear"><rect className="idle-eye" x="-4" y="-8" width="2" height="1" /><rect className="idle-eye" x="3" y="-8" width="2" height="1" /></g> : null}
    {branchDepth > 0 ? <rect className="branch-crown" x="-4" y="-23" width="8" height="2" /> : null}
  </g>;
}

export function PixelOrganizationPlace({ depth = 0 }) {
  const level = Math.max(0, Number(depth || 0));
  if (level === 0) return <g className="tx-playthings-organization-art is-castle">
    <ellipse className="settlement-ground" cx="0" cy="23" rx="45" ry="12" />
    <path className="settlement-path" d="M -8 22 L -3 11 H 3 L 9 22 Z" />
    <rect className="wall-shadow" x="-27" y="-11" width="54" height="31" />
    <rect className="wall" x="-25" y="-13" width="50" height="31" />
    <rect className="stone-light" x="-23" y="-11" width="20" height="3" /><rect className="stone-light" x="4" y="-5" width="18" height="3" />
    <rect className="tower-shadow" x="-35" y="-26" width="16" height="46" /><rect className="tower-shadow" x="19" y="-26" width="16" height="46" />
    <rect className="tower" x="-33" y="-28" width="15" height="47" /><rect className="tower" x="18" y="-28" width="15" height="47" />
    <Battlements x={-34} y={-32} width={17} /><Battlements x={17} y={-32} width={17} />
    <rect className="keep-shadow" x="-13" y="-38" width="26" height="28" /><rect className="keep" x="-11" y="-40" width="22" height="29" />
    <Battlements x={-12} y={-44} width={24} />
    <rect className="window" x="-27" y="-20" width="4" height="7" /><rect className="window" x="23" y="-20" width="4" height="7" /><rect className="window" x="-3" y="-31" width="6" height="8" />
    <path className="door-arch" d="M -7 19 V 8 Q 0 1 7 8 V 19 Z" />
    <rect className="door" x="-4" y="9" width="8" height="10" />
    <rect className="pole" x="0" y="-55" width="2" height="16" /><path className="flag" d="M 2 -54 H 17 L 13 -49 L 17 -44 H 2 Z" />
    <Shrub x={-39} y={17} /><Shrub x={39} y={17} />
  </g>;
  if (level === 1) return <g className="tx-playthings-organization-art is-fort">
    <ellipse className="settlement-ground" cx="0" cy="20" rx="38" ry="10" />
    <rect className="wall-shadow" x="-24" y="-7" width="48" height="26" /><rect className="wall" x="-22" y="-9" width="44" height="27" />
    <rect className="tower" x="-29" y="-20" width="13" height="38" /><rect className="tower" x="16" y="-20" width="13" height="38" />
    <Battlements x={-30} y={-24} width={15} /><Battlements x={15} y={-24} width={15} />
    <rect className="window" x="-25" y="-13" width="4" height="6" /><rect className="window" x="21" y="-13" width="4" height="6" />
    <path className="door-arch" d="M -6 18 V 8 Q 0 2 6 8 V 18 Z" /><rect className="door" x="-3" y="9" width="6" height="9" />
    <rect className="pole" x="0" y="-34" width="2" height="14" /><path className="flag" d="M 2 -33 H 14 L 10 -29 L 14 -25 H 2 Z" />
  </g>;
  return <g className="tx-playthings-organization-art is-village">
    <ellipse className="settlement-ground" cx="0" cy="18" rx="42" ry="11" />
    <path className="settlement-path" d="M -5 22 L -2 7 H 3 L 8 22 Z" />
    <VillageHouse x={-25} y={1} size={1} /><VillageHouse x={3} y={-5} size={0} /><VillageHouse x={24} y={5} size={0} />
    <rect className="well" x="-4" y="10" width="8" height="7" /><rect className="well-top" x="-6" y="8" width="12" height="3" />
    {level > 2 ? <VillageHouse x={-3} y={-22} size={0} /> : null}
    <Shrub x={-38} y={14} /><Shrub x={36} y={16} />
  </g>;
}


export function PixelWorkspacePlace({ clusterSize = 1 }) {
  const count = Math.max(1, Math.min(5, Number(clusterSize || 1)));
  const houses = [[-20, 3, 1], [14, 3, 0], [-3, -19, 0], [31, -13, 0], [-36, -14, 0]];
  return <g className={`tx-playthings-workspace-art cluster-${count}`}>
    <ellipse className="workspace-ground" cx="0" cy="18" rx={34 + count * 4} ry="10" />
    <path className="workspace-path" d="M -7 23 L -2 7 H 3 L 9 23 Z" />
    {houses.slice(0, count).map(([x,y,size], index) => <WorkshopHouse key={index} x={x} y={y} size={size} />)}
    <rect className="yard" x="-11" y="10" width="22" height="5" />
    <rect className="crate" x="11" y="10" width="7" height="6" /><path className="crate-line" d="M 11 10 L 18 16 M 18 10 L 11 16" />
    <rect className="mast" x="-1" y="-38" width="2" height="20" /><path className="dish" d="M -9 -36 Q 0 -25 9 -36" />
    {count > 1 ? <path className="wire" d="M -28 -2 C -15 7 11 7 24 -2" /> : null}
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
  if (kind === 'flower') return <g className="tx-playthings-terrain-mark is-flower" transform={`translate(${x} ${y})`}><path className="stem" d="M 0 4 V -3 M 0 0 L -3 -2 M 0 1 L 3 -1" /><rect className="petal" x="-2" y="-6" width="4" height="4" /></g>;
  if (kind === 'bush') return <g className="tx-playthings-terrain-mark is-bush" transform={`translate(${x} ${y})`}><rect x="-6" y="-1" width="12" height="5" /><rect className="light" x="-3" y="-5" width="7" height="5" /></g>;
  if (kind === 'tuft-wide') return <g className="tx-playthings-terrain-mark" transform={`translate(${x} ${y})`}><path d="M -7 3 L -4 -4 L -2 3 L 1 -6 L 3 3 L 6 -3 L 7 3" /></g>;
  return <g className="tx-playthings-terrain-mark" transform={`translate(${x} ${y})`}><path d="M -4 3 L -2 -4 L 0 3 L 3 -5 L 4 3" /></g>;
}

export function InteractionSpark({ kind = 'inspect' }) {
  if (kind === 'work' || kind === 'build') return <path className="tx-playthings-interaction-spark" d="M -15 -19 L -10 -24 M 10 -24 L 15 -19 M 0 -29 V -21" />;
  if (kind === 'receive' || kind === 'pass' || kind === 'connect') return <path className="tx-playthings-interaction-spark" d="M -18 -20 H -10 M 10 -20 H 18 M 0 -28 V -21" />;
  return <path className="tx-playthings-interaction-spark" d="M 0 -28 V -21 M -13 -24 L -8 -20 M 13 -24 L 8 -20" />;
}

function VariantHair({ variant = 0 }) {
  const v = Math.abs(Number(variant || 0)) % 4;
  if (v === 0) return <><rect className="hair" x="-6" y="-12" width="12" height="3" /><rect className="hair-dark" x="-6" y="-10" width="3" height="3" /></>;
  if (v === 1) return <><rect className="hair" x="-6" y="-12" width="9" height="3" /><rect className="hair" x="-6" y="-10" width="3" height="3" /><rect className="hair-light" x="1" y="-12" width="4" height="1" /></>;
  if (v === 2) return <><rect className="hair" x="-7" y="-12" width="14" height="2" /><rect className="hair" x="-7" y="-10" width="3" height="4" /><rect className="hair" x="4" y="-10" width="3" height="4" /></>;
  return <><rect className="hair" x="-5" y="-13" width="10" height="4" /><rect className="hair-dark" x="-6" y="-11" width="3" height="4" /><rect className="hair-light" x="1" y="-12" width="3" height="1" /></>;
}

function Battlements({ x, y, width }) {
  const count = Math.max(2, Math.floor(width / 6));
  return <g className="battlements">{Array.from({ length: count }, (_, index) => <rect key={index} x={x + index * (width / count)} y={y} width="4" height="5" />)}</g>;
}

function Shrub({ x, y }) {
  return <g className="shrub" transform={`translate(${x} ${y})`}><rect x="-5" y="-2" width="10" height="5" /><rect className="shrub-light" x="-2" y="-5" width="6" height="4" /></g>;
}

function WorkshopHouse({ x, y, size }) {
  const w = size ? 24 : 18, h = size ? 17 : 13;
  return <g transform={`translate(${x} ${y})`}>
    <rect className="workshop-shadow" x={-w/2+2} y={-h/2+2} width={w} height={h} />
    <rect className="workshop" x={-w/2} y={-h/2} width={w} height={h} />
    <path className="workshop-roof-shadow" d={`M ${-w/2-3} ${-h/2+2} L 0 ${-h/2-8} L ${w/2+3} ${-h/2+2} Z`} />
    <path className="workshop-roof" d={`M ${-w/2-3} ${-h/2} L 0 ${-h/2-9} L ${w/2+3} ${-h/2} Z`} />
    <path className="workshop-roof-light" d={`M ${-w/2+1} ${-h/2-1} L 0 ${-h/2-7} L 1 ${-h/2-6} L ${-w/2+4} ${-h/2} Z`} />
    <rect className="workshop-door" x="-3" y={h/2-8} width="6" height="8" /><rect className="door-knob" x="1" y={h/2-4} width="1" height="1" />
    <rect className="workshop-window" x={w/2-8} y={-h/2+3} width="5" height="5" /><path className="window-cross" d={`M ${w/2-5.5} ${-h/2+3} V ${-h/2+8} M ${w/2-8} ${-h/2+5.5} H ${w/2-3}`} />
    {size ? <><rect className="chimney" x={w/2-7} y={-h/2-10} width="4" height="7" /><rect className="chimney-cap" x={w/2-8} y={-h/2-11} width="6" height="2" /></> : null}
  </g>;
}

function VillageHouse({ x, y, size }) {
  const w = size ? 20 : 16, h = size ? 14 : 11;
  return <g transform={`translate(${x} ${y})`}>
    <rect className="house-shadow" x={-w/2+2} y={-h/2+2} width={w} height={h} />
    <rect className="house" x={-w/2} y={-h/2} width={w} height={h} />
    <path className="roof-shadow" d={`M ${-w/2-3} ${-h/2+2} L 0 ${-h/2-9} L ${w/2+3} ${-h/2+2} Z`} />
    <path className="roof" d={`M ${-w/2-3} ${-h/2} L 0 ${-h/2-9} L ${w/2+3} ${-h/2} Z`} />
    <path className="roof-light" d={`M ${-w/2+1} ${-h/2-1} L 0 ${-h/2-7} L 2 ${-h/2-6} L ${-w/2+4} ${-h/2} Z`} />
    <rect className="door" x="-2" y={h/2-6} width="4" height="6" /><rect className="house-window" x={w/2-6} y={-h/2+3} width="4" height="4" />
  </g>;
}

function RoleHat({ variant = 0 }) {
  const v = Math.abs(Number(variant || 0)) % 5;
  if (v === 0) return <g className="role-hat hat-cap"><rect className="hat-main" x="-7" y="-14" width="12" height="5" /><rect className="hat-highlight" x="-6" y="-13" width="5" height="1" /><rect className="hat-main" x="-9" y="-10" width="15" height="2" /></g>;
  if (v === 1) return <g className="role-hat hat-brim"><rect className="hat-main" x="-6" y="-16" width="12" height="6" /><rect className="hat-highlight" x="-5" y="-15" width="5" height="1" /><rect className="hat-band" x="-6" y="-12" width="12" height="2" /><rect className="hat-main" x="-11" y="-10" width="22" height="2" /></g>;
  if (v === 2) return <g className="role-hat hat-point"><path className="hat-main" d="M -8 -10 L 1 -21 L 7 -10 Z" /><path className="hat-highlight" d="M 0 -19 L 2 -17 L 0 -14 Z" /><rect className="hat-band" x="-7" y="-12" width="14" height="2" /><rect className="hat-main" x="-9" y="-10" width="18" height="2" /></g>;
  if (v === 3) return <g className="role-hat hat-beanie"><rect className="hat-main" x="-7" y="-14" width="14" height="5" /><rect className="hat-highlight" x="-5" y="-13" width="5" height="1" /><rect className="hat-main" x="-5" y="-17" width="10" height="4" /><rect className="hat-main" x="-1" y="-20" width="3" height="3" /></g>;
  return <g className="role-hat hat-visor"><rect className="hat-main" x="-8" y="-15" width="16" height="6" /><rect className="hat-highlight" x="-6" y="-14" width="6" height="1" /><rect className="hat-band" x="-7" y="-11" width="12" height="2" /><rect className="hat-main" x="4" y="-10" width="8" height="2" /><rect className="hat-cut" x="-4" y="-12" width="8" height="2" /></g>;
}

function RoleSigil({ role }) {
  if (role === 'organization-place') return <path className="sigil" d="M -3 2 V -2 H -1 V 0 H 1 V -2 H 3 V 2" />;
  if (role === 'handoff-scene') return <path className="sigil" d="M -3 1 H 3 M 1 -2 L 4 1 L 1 4" />;
  if (role === 'workbench' || role === 'project-scene') return <path className="sigil" d="M -3 2 L 3 -2 M 1 -3 L 4 0" />;
  return <rect className="sigil-fill" x="-1" y="0" width="2" height="2" />;
}
