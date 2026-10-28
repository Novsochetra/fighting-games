import { updateBurn } from './burn.js';
import { updateBurst } from './bursts.js';
import { updateCarving } from './carvings.js';
import { updateEcho } from './echoes.js';
import { updateFirefly } from './fireflies.js';
import { updateHangingCut } from './hanging-cuts.js';
import { updateIce } from './ice.js';
import { updateLion } from './lions.js';
import { updatePhoenix } from './phoenix.js';
import { updatePillar } from './pillars.js';
import { updatePoison } from './poison.js';
import { updateSoldier } from './soldiers.js';
import { updateSplash } from './splashes.js';
import { updateStag } from './stags.js';
import { updateStoneSkin } from './stone-skin.js';
import { updateThorn } from './thorns.js';

const UPDATE_BY_KIND = {
  thorn: updateThorn,
  firefly: updateFirefly,
  stag: updateStag,
  ice: updateIce,
  burst: updateBurst,
  pillar: updatePillar,
  burn: updateBurn,
  poison: updatePoison,
  stoneSkin: updateStoneSkin,
  phoenix: updatePhoenix,
  lion: updateLion,
  soldier: updateSoldier,
  echo: updateEcho,
  hangingCut: updateHangingCut,
  carving: updateCarving,
  splash: updateSplash,
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
