import { FX_COLORS } from '../../art/fx-colors.js';
import { GROUND_Y } from '../../config.js';
import { randomBetween } from '../../lib/math.js';
import { shake } from '../fx/camera-fx.js';
import { addDust, addSparks } from '../fx/particles.js';
import { strikeArea } from './strike.js';

const COMBO_STAG = { damage: 7, knockback: [3.4, -2.8], knockdown: true, hitstop: 6, hitstun: 24 };

// a spirit stag that gallops straight on, trampling each raider in its path once
export function sendStag(game, { x, lane, direction, speed, scale, hit, range, delay = 0, great }) {
  game.summons.push({
    kind: 'stag',
    x,
    y: GROUND_Y + lane,
    direction,
    side: 'player',
    time: -delay,
    speed,
    scale,
    hit,
    range,
    great: Boolean(great),
    hitTargets: new Set(),
  });
}

function stagArea(stag) {
  const half = 20 * stag.scale;
  const height = 36 * stag.scale;
  return { x: stag.x - half, y: GROUND_Y - height, width: half * 2, height };
}

function spiritWisps(game, stag) {
  if (stag.time % 3) {
    return;
  }
  addDust(game, { x: stag.x - stag.direction * 12 * stag.scale, y: GROUND_Y, count: 1 });
  game.particles.push({
    kind: 'mote',
    x: stag.x - stag.direction * randomBetween(8, 22) * stag.scale,
    y: GROUND_Y - randomBetween(10, 34) * stag.scale,
    vx: -stag.direction * randomBetween(0.6, 1.4),
    vy: -randomBetween(0.2, 0.6),
    life: 18,
    maxLife: 18,
    color: stag.time % 2 ? FX_COLORS.spiritFlame : FX_COLORS.spiritDeep,
  });
}

export function updateStag(game, stag) {
  if (stag.time === 1) {
    game.io.sfx('stampede', false, { x: stag.x });
  }
  stag.x += stag.direction * stag.speed;
  stag.range -= stag.speed;
  spiritWisps(game, stag);
  const struck = strikeArea(game, stag, stagArea(stag));
  for (const target of struck) {
    shake(game, 2, 6);
    addSparks(game, {
      x: target.x,
      y: target.y - 18,
      count: 6,
      color: FX_COLORS.spiritFlame,
      speed: 3,
    });
  }
  stag.done = stag.range <= 0;
}

// a ram sends its spirit stags galloping out ahead of the Shade
export function chargeComboStags(game, fighter, count) {
  for (let i = 0; i < count; i++) {
    sendStag(game, {
      x: fighter.x - fighter.facing * 6,
      lane: i * 5,
      direction: fighter.facing,
      speed: 6,
      scale: 0.7,
      hit: COMBO_STAG,
      range: 150,
      delay: i * 7,
    });
  }
}
