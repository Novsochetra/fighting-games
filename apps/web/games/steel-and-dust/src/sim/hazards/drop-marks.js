import { PAINTED_THEMES } from '../../art/painted-themes/index.js';
import { DROP } from '../../data/ambush.js';
import { startMove } from '../fighters/actions.js';
import { onScreen } from '../fighters/arena-bounds.js';
import { shake } from '../fx/camera-fx.js';
import { kickLeaves, puffSoil } from '../fx/canopy-fx.js';
import { missionOf } from '../stage/mission.js';
import { spawnRaiderAt } from '../stage/spawn-enemy.js';
import { floorBelow } from '../stage/terrain.js';
import { dropStyle } from './drop-styles.js';
import { perchX } from './drop-perches.js';

const MARGIN = 18;
// a raider knocked about in the air never lands its slam
const FALLING = new Set(['air', 'idle', 'walk']);

// the spot a raider will drop on: the first floor from the sky down, a deck or the road; under
// the perch it waits on, if the road gives it one
export function markDrop(game, { kind, x, perch = null }) {
  game.projectiles.push({
    kind: 'dropMark',
    raiderKind: kind,
    x,
    y: floorBelow(game.terrain, x, -Infinity),
    direction: 1,
    speed: 0,
    side: 'enemy',
    time: 0,
    perch,
    raider: null,
    hitTargets: new Set(),
  });
}

// the raider lets go: out of the canopy above the screen, out of a crown, or off a ledge with a
// leap; behind a parapet it springs up onto the wall's top first
function release(game, mark) {
  const { perch } = mark;
  const y = perch ? (perch.wall ?? perch.y) : DROP.fromY;
  const raider = spawnRaiderAt(game, mark.raiderKind, { x: mark.x, y });
  const vy = perch?.kind === 'ledge' ? DROP.leapVy : 0;

  Object.assign(raider, { airborne: true, state: 'air', vx: 0, vy, dropping: true });
  mark.raider = raider;
  dropStyle(mark).leave(game, mark);
}

// it lands striking, on the spot round both its sides
function land(game, mark) {
  const { raider } = mark;
  const { ambient, ground } = PAINTED_THEMES[missionOf(game).theme];

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

// a perch scrolls by with its layer, and the spot under it with it
function followPerch(game, mark) {
  mark.x = mark.perch ? perchX(game, mark.perch) : onScreen(game, mark.x, MARGIN);
  mark.y = floorBelow(game.terrain, mark.x, -Infinity);
}

// the raider waits overhead while its shadow grows, then drops onto the spot
export function holdDropMark(game, mark) {
  if (!mark.raider) {
    followPerch(game, mark);
    dropStyle(mark).wait(game, mark);
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
