import { WALL_DEBRIS } from '../../art/wall-debris.js';
import { VIEW_WIDTH } from '../../config.js';
import { SUMMARY } from '../../data/mission-summary.js';
import { isLastMission } from '../../data/missions/index.js';
import { lastOf } from '../../lib/lists.js';
import { randomBetween } from '../../lib/math.js';
import { shake } from '../fx/camera-fx.js';
import { buzz } from '../fx/haptics.js';
import { addDust } from '../fx/particles.js';
import { missionOf } from './mission.js';

// the clear holds on the tick before its summary opens, its card down, while the hero runs off the
// road through its closing wall; nothing is cued on this tick, so holding it sounds nothing twice.
// The last road has no next one to run to, and its hero stays in triumph
export const WAY_OUT_AT = SUMMARY.openAt - 1;

const DEBRIS_COUNT = 22;

// a road's boss falls on its last screen, in sight of the closing wall; a clear anywhere short of
// it goes on with the hero in triumph rather than send it running down the whole road
function wallOnScreen(game) {
  return missionOf(game).wayOut.face < game.camera.x + VIEW_WIDTH;
}

// starts the hero's way out once the clear reaches it, and holds the clear till the hero is gone
export function holdForWayOut(game) {
  if (game.clearTime !== WAY_OUT_AT || isLastMission(game.missionIndex)) {
    return false;
  }

  if (!game.gateRun && wallOnScreen(game)) {
    game.gateRun = { way: 'out', phase: 'run', free: false, inDoorway: false };
  }

  return Boolean(game.gateRun) && game.gateRun.phase !== 'gone';
}

// the blow bursts the wall inward, away from the hero, in pieces of its own wood and stone
function throwDebris(game, { face, kind, floor }) {
  const colors = WALL_DEBRIS[kind];

  for (let i = 0; i < DEBRIS_COUNT; i++) {
    game.particles.push({
      kind: 'chunk',
      x: face + randomBetween(0, 14),
      y: floor - randomBetween(6, 44),
      vx: randomBetween(-0.8, 3.2),
      vy: -randomBetween(0.6, 3.4),
      life: 70,
      maxLife: 70,
      color: colors[i % colors.length],
    });
  }
}

export function smashWall(game) {
  const { wayOut, props } = missionOf(game);
  const wall = lastOf(props);
  const floor = wall.y;

  game.wallSmashed = true;
  throwDebris(game, { face: wayOut.face, kind: wall.kind, floor });
  addDust(game, { x: wayOut.face + 8, y: floor, count: 10 });
  shake(game, 3, 14);
  buzz(game, 'bigHit');
  game.io.sfx('break');
  game.io.sfx('ko');
}
