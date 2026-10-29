import { FX_COLORS } from '../../art/fx-colors.js';
import { lastOf } from '../../lib/lists.js';
import { randomBetween } from '../../lib/math.js';
import { shake } from '../fx/camera-fx.js';
import { addDust, addSparks } from '../fx/particles.js';
import { groundAt } from '../stage/terrain.js';
import { legAt, pointOnLeg, progressOnLeg } from './flight.js';
import { strikeArea } from './strike.js';

const COMBO_LION = { damage: 7, knockback: [3, -3.2], knockdown: true, hitstop: 6, hitstun: 24 };
const COMBO_SCALE = 0.46;
// ticks it takes to melt back into gold dust after its last landing
const FADE_TICKS = 10;
// ticks a lion that appears takes to rise out of the gold and crouch; it holds the crouch after that
export const LION_RISE_TICKS = 18;

// a golden guardian lion bounds along its flight of [tick, x, y, hop] points, its paws at (x, y), after
// taking shape and waiting where the flight starts for `appear` ticks; it strikes each raider it passes once, or
// once on every leg when `everyLeg` is set, and lands on every point it reaches
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
    reached: 0,
    stride: 0,
    fade: 0,
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

// a lion that takes shape first rises out of a flare of gold at its feet
function riseFromGold(game, lion) {
  addSparks(game, { x: lion.x, y: lion.y - 6, count: 6, color: FX_COLORS.lionGold, speed: 2.6 });
  addDust(game, { x: lion.x, y: lion.y, count: 3 });
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

function touchDown(game, lion, time) {
  const reached = lion.flight.filter(([tick], i) => i > 0 && tick <= time).length;
  if (reached === lion.reached) {
    return;
  }
  lion.reached = reached;
  if (lion.everyLeg) {
    lion.hitTargets.clear();
  }
  landed(game, lion);
}

// where the lion is `time` ticks into its run, how far through its leap (0 to 1), and which way it bounds
export function lionPoseAt(lion, time) {
  const { flight } = lion;
  const leg = legAt(flight, time);
  const [x, y] = pointOnLeg(flight, leg, time);
  const run = flight[leg + 1][1] - flight[leg][1];
  const direction = Math.abs(run) > 0.5 ? Math.sign(run) : lion.direction;
  return { x, y, direction, stride: progressOnLeg(flight, leg, time) };
}

export function updateLion(game, lion) {
  if (lion.time === 1 && lion.appear) {
    riseFromGold(game, lion);
  }
  goldDust(game, lion);
  if (lion.time <= lion.appear) {
    return;
  }
  const time = lion.time - lion.appear;
  const end = lastOf(lion.flight)[0];
  if (time > end) {
    lion.fade = (time - end) / FADE_TICKS;
    lion.done = lion.fade >= 1;
    return;
  }
  Object.assign(lion, lionPoseAt(lion, time));
  touchDown(game, lion, time);
  maul(game, lion);
}

// a finisher calls up a lion behind the hero that leaps over its shoulder and pounces on the raiders ahead
export function pounceComboLions(game, fighter, count) {
  const ground = groundAt(game.terrain, fighter.x);
  const ahead = (distance) => fighter.x + fighter.facing * distance;
  for (let i = 0; i < count; i++) {
    const reach = 110 + i * 30;
    const flight = [
      [0, ahead(-18), ground],
      [20, ahead(reach), ground, 34],
    ];
    releaseLion(game, { flight, hit: COMBO_LION, scale: COMBO_SCALE, delay: i * 8 });
  }
  game.io.sfx('roar', false, { x: fighter.x });
}
