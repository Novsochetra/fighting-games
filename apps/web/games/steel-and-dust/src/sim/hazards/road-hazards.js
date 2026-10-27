import { createCampfires, updateCampfires } from './campfires.js';
import { createHammers, updateHammers } from './hammers.js';
import { createKegs, updateKegs } from './kegs.js';
import { createQuicksand, updateQuicksand } from './quicksand.js';
import { createTrees, updateTrees } from './trees.js';

// a fresh set of the mission's road hazards for a run, from where its layout put them
export function createRoadHazards(mission) {
  return {
    kegs: createKegs(mission.kegs),
    trees: createTrees(mission.trees),
    campfires: createCampfires(mission.campfires),
    hammers: createHammers(mission.hammers),
    quicksand: createQuicksand(mission.quicksand),
  };
}

// what stands on the road and acts on the fight: kegs burning down, trees falling, fires and
// hammers
export function updateRoadHazards(game) {
  updateKegs(game);
  updateTrees(game);
  updateCampfires(game);
  updateHammers(game);
  updateQuicksand(game);
}
