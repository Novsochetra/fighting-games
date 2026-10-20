import { COLORS } from '../../art/colors.js';
import { randomBetween } from '../../lib/math.js';
import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, overlaps } from '../combat/boxes.js';
import { floorUnder, isFlat } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { breakCratesIn } from '../items/crates.js';
import { floorBelow, isWall } from '../stage/terrain.js';
import { hazardAttacker } from './hazard-attacker.js';

const SHOCK_HIT = { knockback: [2.5, -3.5], knockdown: true, hitstop: 5, hitstun: 20 };

export function spawnShockwave(game, fighter) {
  for (const direction of [-1, 1]) {
    const x = fighter.x + direction * 12 * fighter.scale;
    game.shockwaves.push({
      x,
      y: floorBelow(game.terrain, x, fighter.y),
      direction,
      side: fighter.side,
      time: 0,
      hitTargets: new Set(),
      damage: fighter.side === 'player' ? 8 : 12,
    });
  }
  shake(game, 3, 10);
  addDust(game, { x: fighter.x, y: floorUnder(game.terrain, fighter), count: 10 });
  game.io.sfx('boom');
}

function trailDust(game, wave) {
  game.particles.push({
    kind: 'dust',
    x: wave.x,
    y: wave.y - 2,
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
      applyHit(game, { attacker, target, move, x: wave.x, y: wave.y - 8 })
    ) {
      wave.hitTargets.add(target);
    }
  }
}

// a shockwave runs along the floor it started on, up and down slopes and small steps, and
// breaks on the face of anything taller
export function rideFloor(terrain, wave) {
  if (isFlat(terrain)) {
    return;
  }
  if (isWall(terrain, wave.x, wave.y)) {
    wave.broken = true;
    return;
  }
  wave.y = floorBelow(terrain, wave.x, wave.y);
}

function sweep(game, wave) {
  if (wave.time % 2 === 0) {
    trailDust(game, wave);
  }
  const area = { x: wave.x - 6, y: wave.y - 12, width: 12, height: 12 };
  strike(game, wave, area);
  if (wave.side === 'player') {
    breakCratesIn(game, area);
  }
}

export function updateShockwaves(game) {
  for (const wave of game.shockwaves) {
    wave.x += wave.direction * 3.6;
    wave.time++;
    rideFloor(game.terrain, wave);
    if (!wave.broken) {
      sweep(game, wave);
    }
  }
  game.shockwaves = game.shockwaves.filter((wave) => wave.time < 24 && !wave.broken);
}
