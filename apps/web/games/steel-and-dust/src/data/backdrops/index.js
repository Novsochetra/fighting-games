import { BAMBOO_PASS } from './bamboo-pass.js';
import { EMBER_WOODS } from './ember-woods.js';
import { FIREFLY_HOLLOW } from './firefly-hollow.js';
import { IRON_WORKS } from './iron-works.js';
import { OLD_GROVE } from './old-grove.js';
import { PINE_RIDGE } from './pine-ridge.js';
import { RAIDER_CAMP } from './raider-camp.js';
import { SANDSTORM_PASS } from './sandstorm-pass.js';
import { WARDEN_FORTRESS } from './warden-fortress.js';

// the painted forests: the layers in assets/backdrops/<folder>/, how fast each one scrolls with
// the camera, and what moves in the air around them; an emitter's x is a spot in its near layer.
// `ground.png` is the road's cross-section, laid along the terrain with row `groundTop` on its
// surface
export const PAINTED_BACKDROPS = {
  pineRidge: PINE_RIDGE,
  oldGrove: OLD_GROVE,
  bambooPass: BAMBOO_PASS,
  raiderCamp: RAIDER_CAMP,
  emberWoods: EMBER_WOODS,
  fireflyHollow: FIREFLY_HOLLOW,
  sandstormPass: SANDSTORM_PASS,
  ironWorks: IRON_WORKS,
  wardenFortress: WARDEN_FORTRESS,
};

export function isPaintedTheme(themeId) {
  return Object.hasOwn(PAINTED_BACKDROPS, themeId);
}
