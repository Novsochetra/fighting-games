import { FX_COLORS } from '../../art/fx-colors.js';
import { randomBetween } from '../../lib/math.js';
import { shake } from '../fx/camera-fx.js';
import { addDust, addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { flightOver, legAt, pointOnLeg } from './flight.js';
import { strikeArea } from './strike.js';

const COMBO_LION = { damage: 7, knockback: [3, -3.2], knockdown: true, hitstop: 6, hitstun: 24 };
const COMBO_SCALE = 0.46;

// a golden guardian lion bounds along its flight of [tick, x, y] points, its paws at (x, y), after
// taking shape where the flight starts for `appear` ticks; it strikes each raider it passes once, or
// once on every leg when `everyLeg` is set
export function releaseLion(game, { flight, hit, scale, appear = 0, everyLeg = false, delay = 0 }) {
  const [, x, y] = flight[0];
  game.summons.push({
    kind: 'lion',
    x,
    y,
    direction: flight[1][1] >= x ? 1 : -1,
    side: 'player',
    time: -delay,
    appear,
    flight,
    leg: 0,
    hit,
    scale,
    everyLeg,
    hitTargets: new Set(),
  });
}

function goldDust(game, lion) {
  if (lion.time % 2) {
    return;
  }
  game.particles.push({
    kind: 'mote',
    x: lion.x - lion.direction * randomBetween(6, 26) * lion.scale,
    y: lion.y - randomBetween(6, 40) * lion.scale,
    vx: -lion.direction * randomBetween(0.3, 0.9),
    vy: -randomBetween(0.2, 0.7),
    life: 20,
    maxLife: 20,
    color: lion.time % 4 ? FX_COLORS.lionGold : FX_COLORS.lionDeep,
  });
}

function lionArea(lion) {
  const half = 30 * lion.scale;
  const height = 46 * lion.scale;
  return { x: lion.x - half, y: lion.y - height, width: half * 2, height };
}

function maul(game, lion) {
  for (const target of strikeArea(game, lion, lionArea(lion))) {
    addSparks(game, {
      x: target.x,
      y: target.y - 18,
      count: 7,
      color: FX_COLORS.lionGold,
      speed: 3.2,
    });
    shake(game, 2, 6);
  }
}

function landed(game, lion) {
  addDust(game, { x: lion.x, y: groundAt(game.terrain, lion.x), count: 5 });
  game.io.sfx('pounce', false, { x: lion.x });
}

export function updateLion(game, lion) {
  goldDust(game, lion);
  if (lion.time <= lion.appear) {
    return;
  }
  const { flight } = lion;
  const time = lion.time - lion.appear;
  const leg = legAt(flight, time);
  if (leg !== lion.leg) {
    lion.leg = leg;
    if (lion.everyLeg) {
      lion.hitTargets.clear();
    }
    landed(game, lion);
  }
  const [x, y] = pointOnLeg(flight, leg, time);
  if (Math.abs(x - lion.x) > 0.5) {
    lion.direction = x > lion.x ? 1 : -1;
  }
  Object.assign(lion, { x, y });
  maul(game, lion);
  lion.done = flightOver(flight, time);
}

// a finisher calls up a lion behind the hero that leaps over its shoulder and pounces on the raiders ahead
export function pounceComboLions(game, fighter, count) {
  const ground = groundAt(game.terrain, fighter.x);
  const ahead = (distance) => fighter.x + fighter.facing * distance;
  for (let i = 0; i < count; i++) {
    const reach = 110 + i * 30;
    const flight = [
      [0, ahead(-18), ground],
      [10, ahead(reach * 0.45), ground - 34],
      [20, ahead(reach), ground],
    ];
    releaseLion(game, { flight, hit: COMBO_LION, scale: COMBO_SCALE, delay: i * 8 });
  }
  game.io.sfx('roar', false, { x: fighter.x });
}
