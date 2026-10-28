import { FX_COLORS } from '../../art/fx-colors.js';
import { DROP } from '../../data/ambush.js';
import { onScreen } from '../fighters/arena-bounds.js';
import { shake } from '../fx/camera-fx.js';
import { addDust } from '../fx/particles.js';
import { spawnRaiderAt } from '../stage/spawn-enemy.js';
import { floorBelow } from '../stage/terrain.js';

const MARGIN = 18;
// a raider knocked about in the air never lands its stomp
const FALLING = new Set(['air', 'idle', 'walk']);

// the spot a raider will drop on: the first floor from the sky down, a deck or the road
export function markDrop(game, { kind, x }) {
  game.projectiles.push({
    kind: 'dropMark',
    raiderKind: kind,
    x,
    y: floorBelow(game.terrain, x, -Infinity),
    direction: 1,
    speed: 0,
    side: 'enemy',
    time: 0,
    raider: null,
    landed: false,
    stomp: 0,
    damage: DROP.stompDamage,
    hitTargets: new Set(),
  });
}

// leaves shaken out of the canopy over the spot, swaying a little as they fall
function shakeLeaves(game, mark) {
  if (mark.time % 3 !== 0) {
    return;
  }

  const spread = ((mark.time * 7) % 25) - 12;

  game.particles.push({
    kind: 'leaf',
    x: mark.x + spread,
    y: (mark.time * 3) % 20,
    vx: 0.7,
    vy: 1.5,
    life: 96,
    maxLife: 96,
    color: mark.time % 6 ? FX_COLORS.canopyLeaf : FX_COLORS.canopyLeafDark,
  });
}

// the raider falls in from above the screen, too high to be reached until it comes down
function release(game, mark) {
  const raider = spawnRaiderAt(game, mark.raiderKind, { x: mark.x, y: DROP.fromY });

  Object.assign(raider, { airborne: true, state: 'air', vx: 0, vy: 0 });
  mark.raider = raider;
}

function stomp(game, mark) {
  const { raider } = mark;

  Object.assign(mark, { x: raider.x, y: raider.y, landed: true, stomp: DROP.stompTicks });
  shake(game, 2, 8);
  addDust(game, { x: raider.x, y: raider.y, count: 10 });
  game.io.sfx('blunt', false, { x: raider.x });
}

// the shadow grows while the leaves come down, the raider drops onto it and stomps the spot
export function holdDropMark(game, mark) {
  if (!mark.raider) {
    mark.x = onScreen(game, mark.x, MARGIN);
    mark.y = floorBelow(game.terrain, mark.x, -Infinity);
    shakeLeaves(game, mark);
    if (mark.time >= DROP.warn) {
      release(game, mark);
    }

    return;
  }

  if (mark.landed) {
    mark.dead = --mark.stomp <= 0;
    return;
  }

  const { raider } = mark;

  if (raider.removed || !FALLING.has(raider.state)) {
    mark.dead = true;
  } else if (!raider.airborne) {
    stomp(game, mark);
  }
}
