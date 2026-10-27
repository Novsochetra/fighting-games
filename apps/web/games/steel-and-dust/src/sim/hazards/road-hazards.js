import { updateCampfires } from './campfires.js';
import { updateHammers } from './hammers.js';
import { updateKegs } from './kegs.js';
import { updateTrees } from './trees.js';

// what stands on the road and acts on the fight: kegs burning down, trees falling, fires and
// hammers
export function updateRoadHazards(game) {
  updateKegs(game);
  updateTrees(game);
  updateCampfires(game);
  updateHammers(game);
}
