import { FX_COLORS } from '../../art/fx-colors.js';
import { randomBetween } from '../../lib/math.js';

// a hero turned to stone walks at this share of their pace until the stone flakes off
const STONE_PACE = 0.45;

export const stoneDrag = (fighter) => (fighter.stoned ? STONE_PACE : 1);

function flake(game, skin) {
  const { target } = skin;
  game.particles.push({
    kind: 'mote',
    x: target.x + randomBetween(-6, 6) * target.scale,
    y: target.y - randomBetween(2, 30) * target.scale,
    vx: randomBetween(-0.3, 0.3),
    vy: randomBetween(0.2, 0.6),
    life: 18,
    maxLife: 18,
    color: skin.time % 12 ? FX_COLORS.stoneSkin : FX_COLORS.stoneSkinDark,
  });
}

export function updateStoneSkin(game, skin) {
  const { target } = skin;
  if (target.removed || target.state === 'ko' || skin.time >= skin.ticks) {
    target.stoned = false;
    skin.done = true;
    return;
  }
  Object.assign(skin, { x: target.x, y: target.y });
  if (skin.time % 6 === 0) {
    flake(game, skin);
  }
}

// the gold gaze turns its target slow as stone for a while; another gaze only adds time
export function stoneTarget(game, target, ticks) {
  if (target.state === 'ko' || target.removed) {
    return;
  }
  const skin = game.summons.find(
    (summon) => summon.kind === 'stoneSkin' && summon.target === target && !summon.done,
  );
  if (skin) {
    skin.ticks = Math.max(skin.ticks, skin.time + ticks);
    return;
  }
  target.stoned = true;
  game.summons.push({
    kind: 'stoneSkin',
    target,
    x: target.x,
    y: target.y,
    direction: 1,
    side: 'enemy',
    time: 0,
    ticks,
    hitTargets: new Set(),
  });
}
