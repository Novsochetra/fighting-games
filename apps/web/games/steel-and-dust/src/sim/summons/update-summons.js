import { updateBurn } from './burn.js';
import { updateBurst } from './bursts.js';
import { updateFirefly } from './fireflies.js';
import { updateIce } from './ice.js';
import { updateLance } from './lance.js';
import { updatePhoenix } from './phoenix.js';
import { updatePillar } from './pillars.js';
import { updateStag } from './stags.js';
import { updateThorn } from './thorns.js';

const UPDATE_BY_KIND = {
  thorn: updateThorn,
  firefly: updateFirefly,
  stag: updateStag,
  ice: updateIce,
  burst: updateBurst,
  pillar: updatePillar,
  burn: updateBurn,
  phoenix: updatePhoenix,
  lance: updateLance,
};

// a summon with a delay starts at a negative time and waits for zero
export function updateSummons(game) {
  for (const summon of game.summons.slice()) {
    summon.time++;
    if (summon.time > 0 && !summon.done) {
      UPDATE_BY_KIND[summon.kind](game, summon);
    }
  }
  game.summons = game.summons.filter((summon) => !summon.done);
}
