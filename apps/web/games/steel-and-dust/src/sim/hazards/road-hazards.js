import { createCampfires, updateCampfires } from './campfires.js';
import { createConveyors, updateConveyors } from './conveyors.js';
import { createHammers, updateHammers } from './hammers.js';
import { createKegs, updateKegs } from './kegs.js';
import { createSpikeTraps, updateSpikeTraps } from './spike-traps.js';
import { createTempleBoulders, updateTempleBoulders } from './temple-boulders.js';
import { createQuicksand, updateQuicksand } from './quicksand.js';
import { createSlabs, updateSlabs } from './slabs.js';
import { createTowers, updateTowers } from './towers.js';
import { createNests, updateNests } from './nests.js';
import { createTrees, updateTrees } from './trees.js';
import { createVents, updateVents } from './vents.js';

// a fresh set of the mission's road hazards for a run, from where its layout put them
export function createRoadHazards(mission) {
  return {
    kegs: createKegs(mission.kegs),
    trees: createTrees(mission.trees),
    campfires: createCampfires(mission.campfires),
    hammers: createHammers(mission.hammers),
    conveyors: createConveyors(mission.conveyors),
    spikeTraps: createSpikeTraps(mission.spikeTraps),
    boulders: createTempleBoulders(mission.boulders),
    quicksand: createQuicksand(mission.quicksand),
    vents: createVents(mission.vents),
    slabs: createSlabs(mission.slabs),
    towers: createTowers(mission.towers),
    nests: createNests(mission.nests),
  };
}

// what stands on the road and acts on the fight: kegs burning down, trees falling, fires and
// hammers
export function updateRoadHazards(game) {
  updateKegs(game);
  updateTrees(game);
  updateCampfires(game);
  updateHammers(game);
  updateConveyors(game);
  updateSpikeTraps(game);
  updateTempleBoulders(game);
  updateQuicksand(game);
  updateVents(game);
  updateSlabs(game);
  updateTowers(game);
  updateNests(game);
}
