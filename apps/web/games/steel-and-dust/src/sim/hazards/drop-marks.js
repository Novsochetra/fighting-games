import { PAINTED_THEMES } from '../../art/painted-themes/index.js';
import { DROP } from '../../data/ambush.js';
import { startMove } from '../fighters/actions.js';
import { onScreen } from '../fighters/arena-bounds.js';
import { shake } from '../fx/camera-fx.js';
import { burstLeaves, kickLeaves, puffSoil, shedLeaf, startleFireflies } from '../fx/canopy-fx.js';
import { missionOf } from '../stage/mission.js';
import { spawnRaiderAt } from '../stage/spawn-enemy.js';
import { floorBelow } from '../stage/terrain.js';

const MARGIN = 18;
// a raider knocked about in the air never lands its slam
const FALLING = new Set(['air', 'idle', 'walk']);
// the leaves rustle as the raider settles on the branch, and again as it gets ready to jump
const RUSTLES = [1, DROP.warn - 26];

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
    hitTargets: new Set(),
  });
}

// the road's own leaves, its soil, and its fireflies if it has them
const roadOf = (game) => PAINTED_THEMES[missionOf(game).theme];

function rustle(game, mark) {
  const { ambient } = roadOf(game);

  if (ambient.leaves && mark.time % DROP.leafEvery === 0) {
    shedLeaf(game, { x: mark.x, colors: ambient.leaves });
  }

  if (mark.time === 1 && ambient.fireflies) {
    startleFireflies(game, { x: mark.x, colors: ambient.fireflies });
  }

  if (RUSTLES.includes(mark.time)) {
    game.io.sfx('rustle', false, { x: mark.x });
  }
}

// the branch gives way and the raider drops out of the leaves, weapon raised
function release(game, mark) {
  const raider = spawnRaiderAt(game, mark.raiderKind, { x: mark.x, y: DROP.fromY });
  const { ambient } = roadOf(game);

  Object.assign(raider, { airborne: true, state: 'air', vx: 0, vy: 0, dropping: true });
  mark.raider = raider;
  if (ambient.leaves) {
    burstLeaves(game, { x: mark.x, colors: ambient.leaves });
  }

  if (ambient.fireflies) {
    startleFireflies(game, { x: mark.x, colors: ambient.fireflies });
  }

  game.io.sfx('branchSnap', false, { x: mark.x });
}

// it lands striking, on the spot round both its sides
function land(game, mark) {
  const { raider } = mark;
  const { ambient, ground } = roadOf(game);

  Object.assign(mark, { x: raider.x, y: raider.y, dead: true });
  raider.dropping = false;
  startMove(game, raider, 'dropSlam');
  puffSoil(game, { x: raider.x, y: raider.y, soil: ground.sand });
  if (ambient.leaves) {
    kickLeaves(game, { x: raider.x, y: raider.y, colors: ambient.leaves });
  }

  shake(game, 2, 8);
  game.io.sfx('blunt', false, { x: raider.x });
}

// the trees rustle over the spot while its shadow grows, then the raider drops onto it
export function holdDropMark(game, mark) {
  if (!mark.raider) {
    mark.x = onScreen(game, mark.x, MARGIN);
    mark.y = floorBelow(game.terrain, mark.x, -Infinity);
    rustle(game, mark);
    if (mark.time >= DROP.warn) {
      release(game, mark);
    }

    return;
  }

  const { raider } = mark;

  if (raider.removed || !FALLING.has(raider.state)) {
    raider.dropping = false;
    mark.dead = true;
  } else if (!raider.airborne) {
    land(game, mark);
  }
}
