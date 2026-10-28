import { FX_COLORS } from '../../art/fx-colors.js';
import { SLAB } from '../../data/slabs.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { addBurst } from '../summons/bursts.js';
import { fallThrough } from './slab-fall.js';

const THROWN = new Set(['juggle', 'ko']);
const DUST_EVERY = 12;
// a slab cracks, breaks up under whoever stands on it, and lies open as rubble from then on
const NEXT = { cracking: ['breaking', SLAB.crack], breaking: ['broken', SLAB.breakUp] };

export function createSlabs(slabs) {
  return slabs.map(({ x, y }) => ({ x, y, state: 'whole', time: 0, falling: [] }));
}

const across = (slab, fighter) => Math.abs(fighter.x - slab.x) <= SLAB.halfWidth;

// feet on the slab itself, or bounced a pixel off it this tick
const touches = (slab, fighter) => across(slab, fighter) && slab.y - fighter.y <= 1;

// on the slab with both feet when it gives way; a body in the air goes over the hole
export function standsOn(slab, fighter) {
  return (
    !fighter.airborne &&
    !fighter.removed &&
    !fighter.entering &&
    fighter.state !== 'ult' &&
    touches(slab, fighter)
  );
}

// a body coming down hard: the hero's dive, or a raider thrown or knocked out
export function comesDownHard(fighter) {
  if (!fighter.airborne || fighter.vy <= 0) {
    return false;
  }
  if (fighter.side === 'player') {
    return fighter.state === 'attack' && Boolean(fighter.move?.dive);
  }

  return THROWN.has(fighter.state);
}

export function crackSlab(game, slab) {
  if (slab.state !== 'whole') {
    return;
  }

  Object.assign(slab, { state: 'cracking', time: 0, falling: [] });
  addDust(game, { x: slab.x, y: slab.y, count: 6, color: FX_COLORS.rootDust });
  game.io.sfx('creak', false, { x: slab.x });
}

// a body that was coming down onto a whole slab last tick and has hit it now cracks it
function watchLandings(game, slab) {
  const landed = slab.falling.some((fighter) => touches(slab, fighter));

  slab.falling = game.fighters.filter((fighter) => comesDownHard(fighter));
  if (landed) {
    crackSlab(game, slab);
  }
}

function giveWay(game, slab) {
  const standing = game.fighters.filter((fighter) => standsOn(slab, fighter));

  fallThrough(game, slab, standing);

  for (let x = slab.x - SLAB.halfWidth; x <= slab.x + SLAB.halfWidth; x += DUST_EVERY) {
    addDust(game, { x, y: slab.y, count: 3, color: FX_COLORS.rootDust });
  }

  addBurst(game, { sprite: 'rockBurst', x: slab.x, y: slab.y + 6, scale: 0.7 });
  shake(game, 4, 14);
  game.io.sfx('crumble', false, { x: slab.x });
}

export function updateSlabs(game) {
  for (const slab of game.slabs) {
    if (slab.state === 'whole') {
      watchLandings(game, slab);
    }

    const next = NEXT[slab.state];

    if (!next || ++slab.time < next[1]) {
      continue;
    }

    Object.assign(slab, { state: next[0], time: 0 });
    if (slab.state === 'breaking') {
      giveWay(game, slab);
    }
  }
}
