import { lightKegsIn } from './kegs.js';
import { crackTowersIn } from './towers.js';
import { knockNestsIn } from './nests.js';
import { fellTreesIn } from './trees.js';

// the hero's blows, slash waves and shockwaves set off what stands on the road where they reach,
// `direction` being the way the blow travels
export function strikeRoad(game, area, direction) {
  lightKegsIn(game, area);
  fellTreesIn(game, area, direction);
  crackTowersIn(game, area, direction);
  knockNestsIn(game, area);
}
