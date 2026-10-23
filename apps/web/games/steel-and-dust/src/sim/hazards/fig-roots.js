import { FX_COLORS } from '../../art/fx-colors.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { groundAt, isWall } from '../stage/terrain.js';

const ROOT_DAMAGE = 12;
// the first root bursts just past his fists, in his own units (body-point.js)
const FIRST_GAP = 30;
const ROOT_HALF = 9;
// the root strip strikes from frame 2 to frame 5 (4 ticks a frame)
export const ROOT_STRIKES = [8, 24];

// the stretch of road the root line covers, from his feet to the far side of its last root
export function rootLineReach(fighter, { count, gap }) {
  return FIRST_GAP * fighter.scale + (count - 1) * gap + ROOT_HALF;
}

function plantRoot(game, boss, { x, delay, marked }) {
  game.projectiles.push({
    kind: 'figRoot',
    x,
    y: groundAt(game.terrain, x),
    direction: boss.facing,
    speed: 0,
    side: boss.side,
    time: -delay,
    marked,
    damage: ROOT_DAMAGE,
    hitTargets: new Set(),
  });
}

function rootLine(game, boss, { count, gap, every }, direction) {
  let floor = groundAt(game.terrain, boss.x);
  for (let i = 0; i < count; i++) {
    const x = boss.x + direction * (FIRST_GAP * boss.scale + i * gap);
    if (isWall(game.terrain, x, floor)) {
      return;
    }
    floor = groundAt(game.terrain, x);
    plantRoot(game, boss, { x, delay: 2 + i * every, marked: false });
  }
}

// his fists drive into the ground and fig roots burst up one after another along the floor away
// from him, until a rise too tall stops them; then one bursts under where the hero stood, its
// spot cracking and glowing first
export function burstRoots(game, boss, move) {
  const roots = move.roots;
  const directions = roots.bothWays ? [boss.facing, -boss.facing] : [boss.facing];
  for (const direction of directions) {
    rootLine(game, boss, roots, direction);
  }
  plantRoot(game, boss, { x: game.player.x, delay: roots.underHero, marked: true });
  shake(game, 3, 12);
  game.io.sfx('roots', false, { x: boss.x });
}

export function growRoot(game, root) {
  if (root.time === 0) {
    addDust(game, { x: root.x, y: root.y, count: 5, color: FX_COLORS.rootDust });
    game.io.sfx('break', false, { x: root.x, vol: 0.45 });
  }
}
