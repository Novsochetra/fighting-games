import { COLORS } from '../../art/colors.js';
import { GROUND_Y } from '../../config.js';
import { randomBetween } from '../../lib/math.js';
import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { breakCratesIn } from '../items/crates.js';
import { hazardAttacker } from './hazard-attacker.js';

const SHOCK_HIT = { knockback: [2.5, -3.5], knockdown: true, hitstop: 5, hitstun: 20 };

export function spawnShockwave(game, fighter) {
  for (const direction of [-1, 1]) {
    game.shockwaves.push({
      x: fighter.x + direction * 12 * fighter.scale,
      direction,
      side: fighter.side,
      time: 0,
      hitTargets: new Set(),
      damage: fighter.side === 'player' ? 8 : 12,
    });
  }
  shake(game, 3, 10);
  addDust(game, { x: fighter.x, y: GROUND_Y, count: 10 });
  game.io.sfx('boom');
}

function trailDust(game, wave) {
  game.particles.push({
    kind: 'dust',
    x: wave.x,
    y: GROUND_Y - 2,
    vx: -wave.direction * 0.3,
    vy: -randomBetween(0.3, 0.9),
    life: 18,
    maxLife: 18,
    size: 2,
    color: COLORS.dustTan,
  });
}

function strike(game, wave, area) {
  const attacker = hazardAttacker(wave, wave.side === 'player' ? 'axe' : 'hammer');
  const move = { damage: wave.damage, ...SHOCK_HIT };
  for (const target of game.fighters) {
    if (target.side === wave.side || target.airborne || wave.hitTargets.has(target)) {
      continue;
    }
    const body = hurtBox(target);
    if (
      body &&
      overlaps(area, body) &&
      applyHit(game, { attacker, target, move, x: wave.x, y: GROUND_Y - 8 })
    ) {
      wave.hitTargets.add(target);
    }
  }
}

export function updateShockwaves(game) {
  for (const wave of game.shockwaves) {
    wave.x += wave.direction * 3.6;
    wave.time++;
    if (wave.time % 2 === 0) {
      trailDust(game, wave);
    }
    const area = { x: wave.x - 6, y: GROUND_Y - 12, width: 12, height: 12 };
    strike(game, wave, area);
    if (wave.side === 'player') {
      breakCratesIn(game, area);
    }
  }
  game.shockwaves = game.shockwaves.filter((wave) => wave.time < 24);
}
