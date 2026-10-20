import { COLORS } from '../../art/colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { trailColorOf } from '../fighters/hero-colors.js';
import { showHint } from '../hints.js';
import { breakCratesIn } from '../items/crates.js';
import { groundAt } from '../stage/terrain.js';
import { flyBomb } from './enemy-shots.js';
import { hitArea } from './shot-hits.js';
import { leaveTrail } from './shot-trails.js';
import { SHOT_RULES } from './shot-rules.js';

const DEFAULT_SPEED = 4.6;

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
    color: trailColorOf(game, fighter.weapon.id),
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

// a thrown or fired shot breaks on a rise in the road; fire pots and fire find their own floor
export function hitsGround(terrain, shot) {
  return shot.kind !== 'bomb' && shot.kind !== 'fire' && shot.y >= groundAt(terrain, shot.x);
}

function moveShot(game, shot) {
  shot.x += shot.direction * (shot.speed ?? DEFAULT_SPEED);
  shot.time++;
  if (shot.kind === 'bomb') {
    flyBomb(game, shot);
  }
  if (hitsGround(game.terrain, shot)) {
    shot.dead = true;
  }
  const rules = SHOT_RULES[shot.kind];
  if (rules.rehitEvery && shot.time % rules.rehitEvery === 0) {
    shot.hitTargets.clear();
  }
}

function stillFlying(game, shot) {
  const cameraX = game.camera.x;
  return (
    !shot.dead &&
    shot.time < SHOT_RULES[shot.kind].range &&
    shot.x > cameraX - 40 &&
    shot.x < cameraX + VIEW_WIDTH + 40
  );
}

export function updateProjectiles(game) {
  for (const shot of game.projectiles.slice()) {
    moveShot(game, shot);
    leaveTrail(game, shot);
    const rules = SHOT_RULES[shot.kind];
    const area = rules.area(shot);
    if ((shot.kind === 'knife' || shot.kind === 'bolt') && shot.side === 'enemy') {
      showHint(game, 'sling');
    }
    if (rules.hit) {
      hitArea(game, { shot, area, hit: rules.hit });
    }
    if (shot.side === 'player') {
      breakCratesIn(game, area);
    }
  }
  game.projectiles = game.projectiles.filter((shot) => stillFlying(game, shot));
}
