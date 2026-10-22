import { FX_COLORS } from '../../art/fx-colors.js';
import { randomBetween } from '../../lib/math.js';
import { addFloatText } from '../fx/effects.js';

// the venom eats a little at a time and never staggers, and it never takes the last of a life
function bite(game, poison) {
  const { target, damage } = poison;
  if (target.hp <= 1) {
    return;
  }
  target.hp = Math.max(1, target.hp - damage);
  target.hpBarTime = 90;
  addFloatText(game, {
    x: target.x,
    y: target.y - 34 * target.scale,
    text: `${damage}`,
    color: FX_COLORS.venom,
  });
}

function bubble(game, poison) {
  const { target } = poison;
  game.particles.push({
    kind: 'mote',
    x: target.x + randomBetween(-6, 6) * target.scale,
    y: target.y - randomBetween(4, 28) * target.scale,
    vx: randomBetween(-0.2, 0.2),
    vy: -randomBetween(0.4, 0.9),
    life: 20,
    maxLife: 20,
    color: poison.time % 16 ? FX_COLORS.venom : FX_COLORS.venomDark,
  });
}

export function updatePoison(game, poison) {
  const { target } = poison;
  if (target.removed || target.state === 'ko') {
    poison.done = true;
    return;
  }
  Object.assign(poison, { x: target.x, y: target.y });
  if (poison.time % 8 === 0) {
    bubble(game, poison);
  }
  if (poison.time % poison.every === 0) {
    bite(game, poison);
  }
  poison.done = poison.time >= poison.ticks;
}

// a sting poisons for a while; another sting only adds time
export function poisonTarget(game, target, { ticks, every, damage }) {
  if (target.state === 'ko' || target.removed) {
    return;
  }
  const venom = game.summons.find(
    (summon) => summon.kind === 'poison' && summon.target === target && !summon.done,
  );
  if (venom) {
    venom.ticks = Math.max(venom.ticks, venom.time + ticks);
    return;
  }
  game.summons.push({
    kind: 'poison',
    target,
    x: target.x,
    y: target.y,
    direction: 1,
    side: 'enemy',
    time: 0,
    ticks,
    every,
    damage,
    hitTargets: new Set(),
  });
}
