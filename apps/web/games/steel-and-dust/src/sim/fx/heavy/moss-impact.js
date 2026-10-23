import { floorBelow } from '../../stage/terrain.js';
import { fxBetween, fxRandom } from '../fx-random.js';
import { addBramble, addLeaf, addSpore, addThorn, throwSpray } from './moss-spawn.js';

// a target this far above the floor is in the air, too high for brambles to reach
const BRAMBLE_REACH = 14;
const BRAMBLE_SPOTS = [-6, 1, 7];

// thorns burst out round the blow, mostly on through the target, one now and then back at the Shade
function burstThorns(game, { x, y, facing, count }) {
  for (let i = 0; i < count; i++) {
    const share = (i + fxRandom(game)) / count;
    const angle = (share - 0.5) * Math.PI * 1.6;
    const heading = facing > 0 ? angle : Math.PI - angle;
    addThorn(game, { x, y, angle: heading, speed: fxBetween(game, 3.8, 5) });
  }
}

// brambles answer a heavy blow from the ground under the target, as the grove's own thorns do
function raiseBrambles(game, { target, facing }) {
  const floor = floorBelow(game.terrain, target.x, target.y);
  if (floor - target.y > BRAMBLE_REACH) {
    return;
  }
  BRAMBLE_SPOTS.forEach((spot, i) => {
    const height = Math.round(fxBetween(game, 9, 13)) - (i === 1 ? 0 : 3);
    addBramble(game, {
      x: target.x + spot * facing,
      y: floor,
      height,
      lean: Math.sign(spot) * facing,
    });
  });
}

// each blow that lands: thorns, a leaf and spores out of it, and on a single heavy blow, brambles
export function mossImpact(game, hit) {
  const facing = hit.attacker.facing;
  const many = (hit.move.multiHit ?? 1) > 1;
  const at = { x: hit.x, y: hit.y };
  burstThorns(game, { ...at, facing, count: many ? 2 : 5 });
  const spray = { at, facing, angle: -0.6, spread: 0.8, speed: 2.6, life: 24 };
  throwSpray(game, addLeaf, { ...spray, count: many ? 1 : 3 });
  throwSpray(game, addSpore, {
    ...spray,
    spread: Math.PI,
    speed: 1.6,
    count: many ? 1 : 3,
    life: 18,
  });
  if (!many) {
    raiseBrambles(game, { target: hit.target, facing });
  }
}
