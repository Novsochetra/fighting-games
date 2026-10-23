import { fxBetween } from '../fx-random.js';
import { coilOf, handOf, smearPointOf } from './ember-anchors.js';
import {
  EMBER_PARTICLE_MOVERS,
  addFlare,
  heading,
  swirlIn,
  throwCinders,
  throwFlames,
} from './ember-particles.js';

// which way each heavy's fire bursts as it strikes (degrees: 0 ahead, -90 up) and how much of it
const BURSTS = {
  UK: { angle: -80, flames: 6 },
  AK: { angle: 45, flames: 5 },
  ADK: { angle: -150, flames: 5 },
  K3: { angle: -5, flames: 7 },
  C1: { angle: -5, flames: 7 },
  C2: { angle: -20, flames: 7 },
};
const BURST = { angle: -20, flames: 4 };
// a swirling ember needs a few ticks to close in; early in the wind-up two come at once
const SWIRL_MIN = 3;
const SWIRL_MAX = 9;
const SWIRL_PAIRED = 6;
// a strike freezes in hitstop as it lands, so its burst starts already flung this many ticks wide
const HITSTOP_LEAD = 3;

function lickUp(game, at, { facing, size, life }) {
  const angle = heading(facing, -92);
  throwFlames(game, at, { count: 1, angle, spread: 0.25, speed: 0.6, size, life });
}

function swirlTo(game, fighter, { at, life }) {
  const carry = { x: fighter.vx, y: fighter.vy };
  const radius = fxBetween(game, 14, 22);
  swirlIn(game, at, { radius, life, spin: fighter.facing * 0.1, carry });
}

export const EMBER_HEAVY_KIT = {
  sounds: { charge: 'heavyEmberCharge', release: 'heavyEmberRelease' },
  // the hands catch fire; a charged heavy has burned all through its charge and flares bigger
  windup(game, fighter, move) {
    const at = handOf(fighter);
    const { facing } = fighter;
    addFlare(game, { ...at, size: move.chargeLevel ? 8 : 4, life: 4, facing });
    lickUp(game, at, { facing, size: 6, life: 9 });
  },
  // embers spiral in from all round to where the hands coil, and flames lick up off the hands
  gather(game, fighter, move, time) {
    const left = move.startup - time;
    const coil = coilOf(fighter, move);
    if (left >= SWIRL_MIN) {
      swirlTo(game, fighter, { at: coil, life: Math.min(SWIRL_MAX, left) });
    }
    if (left >= SWIRL_PAIRED) {
      swirlTo(game, fighter, { at: coil, life: Math.min(SWIRL_MAX, left) });
    }
    if (time % 3 === 1) {
      const size = 4 + (time / move.startup) * 3;
      lickUp(game, handOf(fighter), { facing: fighter.facing, size, life: 7 });
    }
  },
  // the gathered fire bursts off the hands the way the blow goes
  release(game, fighter, move) {
    const at = handOf(fighter);
    const burst = BURSTS[move.id] ?? BURST;
    const angle = heading(fighter.facing, burst.angle);
    addFlare(game, { ...at, size: 9, life: 6, facing: fighter.facing });
    const aim = { angle, lead: HITSTOP_LEAD };
    throwFlames(game, at, {
      ...aim,
      count: burst.flames,
      spread: 0.7,
      speed: 2.6,
      size: 8,
      life: 12,
    });
    throwCinders(game, at, { ...aim, count: 5, spread: 0.5, speed: 3.6, life: 15 });
  },
  // the smear sheds cinders that drift back and up behind it, and flames that burn out
  trail(game, fighter, _move, time) {
    const at = smearPointOf(game, fighter, time);
    const { facing } = fighter;
    const behind = heading(facing, -150);
    throwCinders(game, at, { count: 1, angle: behind, spread: 0.6, speed: 1.6, life: 15 });
    if (time % 2 === 0) {
      const angle = heading(facing, 180);
      throwFlames(game, at, { count: 1, angle, spread: 0.5, speed: 0.7, size: 5, life: 8 });
    }
  },
  // a blow that lands erupts in a fan of flame and throws cinders on through the raider; the burn
  // it sets (summons/burn.js) does the lingering, and the game's own flash sits over the middle
  impact(game, hit) {
    const { facing } = hit.attacker;
    const many = Boolean(hit.move.multiHit);
    const count = many ? 2 : 5;
    const up = { angle: heading(facing, -80), lead: HITSTOP_LEAD };
    throwFlames(game, hit, { ...up, count, spread: 1.1, speed: 2, size: many ? 5 : 7, life: 10 });
    const on = { angle: heading(facing, -20), lead: HITSTOP_LEAD };
    throwCinders(game, hit, { ...on, count, spread: 0.7, speed: 3.8, life: 15 });
  },
  particles: EMBER_PARTICLE_MOVERS,
};
