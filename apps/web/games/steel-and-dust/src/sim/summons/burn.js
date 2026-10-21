import { FX_COLORS } from '../../art/fx-colors.js';
import { randomBetween } from '../../lib/math.js';
import { knockOut } from '../combat/knock-out.js';
import { addFloatText } from '../fx/effects.js';

const SCORCH_EVERY = 24;
const SCORCH_DAMAGE = 2;

// the fire eats a little at a time and never staggers, so a burning raider keeps fighting
function scorch(game, burn) {
  const { target } = burn;
  target.hp = Math.max(0, target.hp - SCORCH_DAMAGE);
  target.hpBarTime = 90;
  target.flashTime = 2;
  addFloatText(game, {
    x: target.x,
    y: target.y - 34 * target.scale,
    text: `${SCORCH_DAMAGE}`,
    color: FX_COLORS.emberGold,
  });
  if (target.hp <= 0) {
    knockOut(game, target, burn.direction);
    burn.done = true;
  }
}

function smoulder(game, burn) {
  const { target } = burn;
  game.particles.push({
    kind: 'mote',
    x: target.x + randomBetween(-8, 8) * target.scale,
    y: target.y - randomBetween(6, 30) * target.scale,
    vx: randomBetween(-0.3, 0.3),
    vy: -randomBetween(0.6, 1.2),
    life: 18,
    maxLife: 18,
    color: burn.time % 12 ? FX_COLORS.emberGold : FX_COLORS.flameDark,
  });
}

export function updateBurn(game, burn) {
  const { target } = burn;
  if (target.removed || target.state === 'ko') {
    burn.done = true;
    return;
  }
  Object.assign(burn, { x: target.x, y: target.y, scale: target.scale });
  if (burn.time % 6 === 0) {
    smoulder(game, burn);
  }
  if (burn.time % SCORCH_EVERY === 0) {
    scorch(game, burn);
  }
  burn.done = burn.done || burn.time >= burn.duration;
}

// a raider set alight burns for a while; catching fire again only adds time
export function igniteTarget(game, target, duration) {
  if (target.state === 'ko' || target.removed) {
    return;
  }
  const lit = game.summons.find(
    (summon) => summon.kind === 'burn' && summon.target === target && !summon.done,
  );
  if (lit) {
    lit.duration = Math.max(lit.duration, lit.time + duration);
    return;
  }
  game.summons.push({
    kind: 'burn',
    target,
    x: target.x,
    y: target.y,
    direction: 1,
    side: 'player',
    time: 0,
    duration,
    scale: target.scale,
    hitTargets: new Set(),
  });
  game.io.sfx('ignite', false, { x: target.x });
}
