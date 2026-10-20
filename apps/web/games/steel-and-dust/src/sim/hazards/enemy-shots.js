import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { clamp } from '../../lib/math.js';
import { floorUnder } from '../fighters/terrain-motion.js';
import { shake } from '../fx/camera-fx.js';
import { addRing } from '../fx/effects.js';
import { addDust, addSparks } from '../fx/particles.js';
import { floorBelow } from '../stage/terrain.js';
import { hitArea } from './shot-hits.js';

const BOMB_GRAVITY = 0.16;
const BOMB_LIFT = -3.4;
const BOMB_BLAST = { knockback: [3, -3.6], knockdown: true, hitstop: 7, hitstun: 22 };

const SHOTS = {
  bolt: { speed: 5.4, damage: 10, height: 26, color: COLORS.steel, sound: 'swingSpear' },
  sand: { speed: 2.3, damage: 8, height: 20, color: FX_COLORS.mirage, sound: 'warp' },
  venom: { speed: 3.4, damage: 7, height: 30, color: FX_COLORS.venom, sound: 'warp' },
  bomb: { speed: 0, damage: 12, height: 34, color: COLORS.orange, sound: 'swingSpear' },
};

// a fire pot is aimed to come down where the hero stands now
function bombSpeed(game, fighter, startY) {
  const drop = floorUnder(game.terrain, game.player) - startY;
  const flight =
    (-BOMB_LIFT + Math.sqrt(BOMB_LIFT * BOMB_LIFT + 2 * BOMB_GRAVITY * drop)) / BOMB_GRAVITY;
  return clamp(Math.abs(game.player.x - fighter.x) / flight, 0.8, 3.2);
}

export function fireEnemyShot(game, fighter, kind) {
  const spec = SHOTS[kind];
  const y = fighter.y - spec.height * fighter.scale;
  game.projectiles.push({
    kind,
    x: fighter.x + fighter.facing * 12,
    y,
    vy: BOMB_LIFT,
    direction: fighter.facing,
    side: fighter.side,
    time: 0,
    damage: spec.damage,
    speed: kind === 'bomb' ? bombSpeed(game, fighter, y) : spec.speed,
    hitTargets: new Set(),
    color: spec.color,
  });
  game.io.sfx(spec.sound, false, { vol: 0.6, x: fighter.x, dir: fighter.facing });
}

function explode(game, bomb, floor) {
  bomb.dead = true;
  bomb.y = floor;
  const area = { x: bomb.x - 22, y: floor - 30, width: 44, height: 30 };
  hitArea(game, { shot: bomb, area, hit: BOMB_BLAST });
  addSparks(game, { x: bomb.x, y: floor - 8, count: 18, color: COLORS.tangerine, speed: 3.4 });
  addDust(game, { x: bomb.x, y: floor, count: 8, color: COLORS.smoke });
  addRing(game, { x: bomb.x, y: floor - 10, color: COLORS.orange, big: true });
  shake(game, 2, 8);
  game.io.sfx('boom', false, { vol: 0.7, x: bomb.x });
  game.projectiles.push({
    kind: 'fire',
    x: bomb.x,
    y: floor,
    direction: 1,
    side: bomb.side,
    time: 0,
    damage: 3,
    speed: 0,
    hitTargets: new Set(),
    color: COLORS.tangerine,
  });
}

// measured from where the pot was, so it breaks on a platform it falls onto but not one it rises
// through
export function flyBomb(game, bomb) {
  const floor = floorBelow(game.terrain, bomb.x, bomb.y);
  bomb.y += bomb.vy;
  bomb.vy += BOMB_GRAVITY;
  if (bomb.y >= floor - 2) {
    explode(game, bomb, floor);
  }
}
