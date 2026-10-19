import { COLORS } from '../../art/colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { randomBetween } from '../../lib/math.js';
import { applyHit } from '../combat/apply-hit.js';
import { hurtBox, knifeBox, overlaps } from '../combat/boxes.js';
import { showHint } from '../hints.js';
import { breakCratesIn } from '../items/crates.js';
import { hazardAttacker } from './hazard-attacker.js';

const DEFAULT_SPEED = 4.6;
const KNIFE_HIT = { knockback: [1.6, 0], hitstop: 4, hitstun: 16 };
const WAVE_HIT = { knockback: [3, -3.6], knockdown: true, hitstop: 6, hitstun: 20 };

export function spawnSlashWave(game, fighter, move) {
  game.projectiles.push({
    kind: 'wave',
    x: fighter.x + fighter.facing * 18,
    y: fighter.y - 22,
    direction: fighter.facing,
    side: fighter.side,
    time: 0,
    damage: move.waveDamage,
    speed: move.waveSpeed,
    hitTargets: new Set(),
    color: WEAPONS[fighter.weapon.id].trailColor,
  });
}

export function tossKnife(game, fighter) {
  game.projectiles.push({
    kind: 'knife',
    x: fighter.x + fighter.facing * 10,
    y: fighter.y - 24 * fighter.scale,
    direction: fighter.facing,
    side: fighter.side,
    time: 0,
    damage: 6,
    speed: 3.1,
    hitTargets: new Set(),
    color: COLORS.steel,
  });
  game.io.sfx('swingSpear', false, { vol: 0.6, x: fighter.x, dir: fighter.facing });
}

function leaveTrail(game, shot) {
  if (shot.kind !== 'knife' && shot.time % 2 === 0) {
    game.particles.push({
      kind: 'spark',
      x: shot.x - shot.direction * 6,
      y: shot.y + randomBetween(-12, 12),
      vx: -shot.direction * randomBetween(0.5, 1.5),
      vy: 0,
      life: 10,
      maxLife: 14,
      color: shot.color,
    });
  }
  if (shot.kind === 'knife' && shot.time % 3 === 0) {
    game.particles.push({
      kind: 'streak',
      x: shot.x - shot.direction * 4,
      y: shot.y,
      vx: -shot.direction * 0.6,
      vy: 0,
      life: 8,
      maxLife: 8,
      length: 4,
    });
  }
}

function shotArea(shot) {
  if (shot.kind === 'knife') {
    return knifeBox(shot);
  }
  return { x: shot.x - 8, y: shot.y - 18, width: 16, height: 36 };
}

function strike(game, shot, area) {
  const knife = shot.kind === 'knife';
  const attacker = hazardAttacker(shot, shot.side === 'player' ? 'sword' : 'knife');
  const move = { damage: shot.damage, ...(knife ? KNIFE_HIT : WAVE_HIT) };
  for (const target of game.fighters) {
    if (target.side === shot.side || shot.hitTargets.has(target)) {
      continue;
    }
    const body = hurtBox(target);
    if (
      body &&
      overlaps(area, body) &&
      applyHit(game, { attacker, target, move, x: shot.x, y: shot.y })
    ) {
      shot.hitTargets.add(target);
      shot.dead = shot.dead || knife;
    }
  }
}

function stillFlying(game, shot) {
  const range = shot.kind === 'knife' ? 150 : 70;
  const cameraX = game.camera.x;
  return (
    !shot.dead && shot.time < range && shot.x > cameraX - 40 && shot.x < cameraX + VIEW_WIDTH + 40
  );
}

export function updateProjectiles(game) {
  for (const shot of game.projectiles) {
    shot.x += shot.direction * (shot.speed || DEFAULT_SPEED);
    shot.time++;
    leaveTrail(game, shot);
    const area = shotArea(shot);
    if (shot.kind === 'knife' && shot.side === 'enemy') {
      showHint(game, 'sling');
    }
    strike(game, shot, area);
    if (shot.side === 'player') {
      breakCratesIn(game, area);
    }
  }
  game.projectiles = game.projectiles.filter((shot) => stillFlying(game, shot));
}
