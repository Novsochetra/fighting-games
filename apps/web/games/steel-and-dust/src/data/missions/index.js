import { layoutMission } from './layout.js';
import { PINE_RIDGE } from './specs/01-pine-ridge.js';
import { OLD_GROVE } from './specs/02-old-grove.js';
import { BAMBOO_PASS } from './specs/03-bamboo-pass.js';
import { RAIDER_CAMP } from './specs/04-raider-camp.js';
import { EMBER_WOODS } from './specs/05-ember-woods.js';
import { FIREFLY_HOLLOW } from './specs/06-firefly-hollow.js';
import { SANDSTORM_PASS } from './specs/07-sandstorm-pass.js';
import { IRON_WORKS } from './specs/08-iron-works.js';
import { MIRAGE_TEMPLE } from './specs/09-mirage-temple.js';
import { WARDEN_FORTRESS } from './specs/10-warden-fortress.js';

export const MISSIONS = [
  PINE_RIDGE,
  OLD_GROVE,
  BAMBOO_PASS,
  RAIDER_CAMP,
  EMBER_WOODS,
  FIREFLY_HOLLOW,
  SANDSTORM_PASS,
  IRON_WORKS,
  MIRAGE_TEMPLE,
  WARDEN_FORTRESS,
].map(layoutMission);

export function missionAt(index) {
  return MISSIONS[index] ?? MISSIONS[0];
}

export function isLastMission(index) {
  return index === MISSIONS.length - 1;
}
