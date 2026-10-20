import { FX_COLORS } from '../../art/fx-colors.js';
import { addSparks } from '../fx/particles.js';
import { addBurst } from './bursts.js';
import { strikeTarget } from './strike.js';

function thaw(ice) {
  ice.done = true;
  ice.target.frozen = false;
  ice.target.hitstop = 0;
}

function throwShards(game, { x, y }) {
  addSparks(game, { x, y, count: 10, color: FX_COLORS.iceShard, speed: 3.6 });
  for (let i = 0; i < 6; i++) {
    game.particles.push({
      kind: 'chunk',
      x,
      y,
      vx: (i - 2.5) * 0.7,
      vy: -2.4 - (i % 3),
      life: 26,
      maxLife: 26,
      color: i % 2 ? FX_COLORS.iceBody : FX_COLORS.iceDeep,
    });
  }
}

// the ice bursts and the raider inside takes the shatter hit
export function shatterIce(game, ice) {
  const { target } = ice;
  thaw(ice);
  const center = { x: target.x, y: target.y - 18 * target.scale };
  addBurst(game, { sprite: 'shatter', ...center, scale: target.scale });
  throwShards(game, center);
  game.io.sfx('shatter', false, { x: target.x });
  strikeTarget(game, ice, { target, move: ice.shatter });
}

// a hit that breaks ice shatters it at once, sending the shards and the raider the hit's way
export function shatterIceOn(game, target, direction) {
  const ice = game.summons.find(
    (summon) => summon.kind === 'ice' && summon.target === target && !summon.done,
  );
  if (ice) {
    ice.direction = direction;
    shatterIce(game, ice);
  }
}

// a frozen raider stays in hitstop: no thinking, no physics, only the shake of a fresh hit
export function updateIce(game, ice) {
  const { target } = ice;
  if (target.removed || target.state === 'ko') {
    thaw(ice);
    return;
  }
  Object.assign(ice, { x: target.x, y: target.y });
  target.hitstop = Math.max(target.hitstop, 2);
  if (target.hitShake > 0) {
    target.hitShake--;
  }
  if (ice.time >= ice.duration) {
    shatterIce(game, ice);
  }
}
