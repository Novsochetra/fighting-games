import { normalizeMoves } from '../moves/define-move.js';
import { TECHNIQUE_LINKS } from './technique-links.js';

const NO_TEMPO = { startup: 1, recovery: 1, damage: 1, hitstop: 0, reach: 0 };
const FLURRY_DAMAGE = 0.6;

function scaled(value, factor) {
  return Math.max(1, Math.round(value * factor));
}

// a single strike turned into a quick string of hits, each weaker; multi-hit moves stay as they are
function flurried(move, hits) {
  if (!hits || move.multiHit) {
    return move;
  }
  const active = Math.max(move.active, hits * 3);
  return {
    ...move,
    active,
    multiHit: Math.ceil(active / hits),
    damage: scaled(move.damage, FLURRY_DAMAGE),
  };
}

function patched(move, patch = {}) {
  const { flurry, ...fields } = patch;
  return flurried({ ...move, ...fields }, flurry);
}

function withTempo(move, tempo) {
  const [x, y, width, height] = move.hitbox;
  return {
    ...move,
    startup: scaled(move.startup, tempo.startup),
    recovery: scaled(move.recovery, tempo.recovery),
    damage: scaled(move.damage, tempo.damage),
    hitstop: Math.max(2, move.hitstop + tempo.hitstop),
    hitbox: [x, y, width + tempo.reach, height],
    cancelWindow: undefined,
  };
}

// the Shade's own techniques join the moveset as they are, branching off heavies with no light
function addTechniques(styled, techniques = {}) {
  for (const [id, technique] of Object.entries(techniques)) {
    styled[id] = { ...technique, technique: true };
  }
  for (const [from, button, to] of TECHNIQUE_LINKS) {
    const move = styled[from];
    if (styled[to] && move && !move.next[button]) {
      move.next = { ...move.next, [button]: to };
    }
  }
}

// a style can mark every move made with one weapon, its own techniques included
function withWeaponPatch(styled, patch) {
  if (!patch) {
    return styled;
  }
  return Object.fromEntries(
    Object.entries(styled).map(([id, move]) => [id, { ...move, ...patch }]),
  );
}

// a Shade's style reworks a weapon's moves: its tempo scales every move, its patches add signatures
export function applyStyle(moves, style, weaponId) {
  const tempo = { ...NO_TEMPO, ...style.tempo };
  const styled = {};
  for (const [id, move] of Object.entries(moves)) {
    styled[id] = withTempo(patched(move, style.moves[id]), tempo);
  }
  addTechniques(styled, style.techniques);
  return normalizeMoves(withWeaponPatch(styled, style.weapons?.[weaponId]));
}
