import { FX_COLORS } from '../../art/fx-colors.js';
import { randomBetween } from '../../lib/math.js';
import { shake } from '../fx/camera-fx.js';
import { addSparks } from '../fx/particles.js';
import { igniteTarget } from './burn.js';
import { flightOver, legAt, pointOnLeg } from './flight.js';
import { strikeArea } from './strike.js';

// the firebird flies its flight of [tick, x, y] points leg by leg, and each leg is a new pass
export function releasePhoenix(game, { flight, hit, burn, scale }) {
  const [, x, y] = flight[0];
  game.summons.push({
    kind: 'phoenix',
    x,
    y,
    direction: 1,
    side: 'player',
    time: 0,
    flight,
    leg: 0,
    hit,
    burn,
    scale,
    hitTargets: new Set(),
  });
}

function fireTrail(game, phoenix) {
  game.particles.push({
    kind: 'mote',
    x: phoenix.x - phoenix.direction * randomBetween(10, 30) * phoenix.scale,
    y: phoenix.y + randomBetween(-8, 10) * phoenix.scale,
    vx: -phoenix.direction * randomBetween(0.4, 1),
    vy: -randomBetween(0.2, 0.8),
    life: 22,
    maxLife: 22,
    color: phoenix.time % 2 ? FX_COLORS.emberGold : FX_COLORS.flameDark,
  });
}

function phoenixArea(phoenix) {
  const half = 22 * phoenix.scale;
  return {
    x: phoenix.x - half,
    y: phoenix.y - 14 * phoenix.scale,
    width: half * 2,
    height: 34 * phoenix.scale,
  };
}

function sear(game, phoenix) {
  for (const target of strikeArea(game, phoenix, phoenixArea(phoenix))) {
    igniteTarget(game, target, phoenix.burn);
    addSparks(game, {
      x: target.x,
      y: target.y - 18,
      count: 6,
      color: FX_COLORS.emberGold,
      speed: 3,
    });
    shake(game, 2, 6);
  }
}

export function updatePhoenix(game, phoenix) {
  const { flight } = phoenix;
  const leg = legAt(flight, phoenix.time);
  if (leg !== phoenix.leg) {
    phoenix.leg = leg;
    phoenix.hitTargets.clear();
  }
  const [x, y] = pointOnLeg(flight, leg, phoenix.time);
  if (Math.abs(x - phoenix.x) > 0.5) {
    phoenix.direction = x > phoenix.x ? 1 : -1;
  }
  Object.assign(phoenix, { x, y });
  fireTrail(game, phoenix);
  sear(game, phoenix);
  phoenix.done = flightOver(flight, phoenix.time);
}
