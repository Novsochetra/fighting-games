import { FX_COLORS } from '../../art/fx-colors.js';
import { FX_SPRITES, fxLength } from '../../data/fx-sprites.js';
import { shake } from '../fx/camera-fx.js';
import { addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { igniteTarget } from './burn.js';
import { strikeArea } from './strike.js';

// the flame strikes as it roars to full height, two frames after the cracks open
const STRIKE_TICK = FX_SPRITES.pillar.ticks * 2;
const COMBO_PILLAR = { damage: 6, knockback: [0.8, -4.6], launch: true, hitstop: 5, hitstun: 22 };
const COMBO_BURN = 90;

// a pillar of flame bursting out of the ground; it strikes once and leaves what it hits burning
export function raisePillar(game, { x, scale, hit, burn = COMBO_BURN, delay = 0 }) {
  game.summons.push({
    kind: 'pillar',
    x,
    y: groundAt(game.terrain, x),
    direction: 1,
    side: 'player',
    time: -delay,
    scale,
    hit,
    burn,
    hitTargets: new Set(),
  });
}

function pillarArea(pillar) {
  const half = 12 * pillar.scale;
  const height = 46 * pillar.scale;
  return { x: pillar.x - half, y: pillar.y - height, width: half * 2, height };
}

export function updatePillar(game, pillar) {
  if (pillar.time === 1) {
    game.io.sfx('flames', false, { x: pillar.x });
  }
  if (pillar.time === STRIKE_TICK) {
    for (const target of strikeArea(game, pillar, pillarArea(pillar))) {
      igniteTarget(game, target, pillar.burn);
    }
    const y = pillar.y - 30 * pillar.scale;
    addSparks(game, { x: pillar.x, y, count: 6, color: FX_COLORS.emberGold, speed: 2.6 });
    shake(game, 1, 4);
  }
  pillar.done = pillar.time >= fxLength('pillar');
}

// a finisher's pillars erupt one after another along the ground ahead, or on both sides in a ring
export function raiseComboPillars(game, fighter, { count, ring = false, ahead = 30 }) {
  const sides = ring ? [fighter.facing, -fighter.facing] : [fighter.facing];
  for (const side of sides) {
    for (let i = 0; i < count; i++) {
      raisePillar(game, {
        x: fighter.x + side * (ahead + i * 24),
        scale: 0.6,
        hit: COMBO_PILLAR,
        delay: i * 4,
      });
    }
  }
}
