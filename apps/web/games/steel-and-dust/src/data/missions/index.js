import { layoutMission } from './layout.js';
import { DUST_ROAD } from './specs/01-dust-road.js';
import { SCRAPYARD } from './specs/02-scrapyard.js';
import { RED_CANYON } from './specs/03-red-canyon.js';
import { OASIS_BAZAAR } from './specs/04-oasis-bazaar.js';
import { THE_NEST } from './specs/05-the-nest.js';
import { SALT_FLATS } from './specs/06-salt-flats.js';
import { SANDSTORM_PASS } from './specs/07-sandstorm-pass.js';
import { IRON_WORKS } from './specs/08-iron-works.js';
import { MIRAGE_TEMPLE } from './specs/09-mirage-temple.js';
import { WARDEN_FORTRESS } from './specs/10-warden-fortress.js';

export const MISSIONS = [
  DUST_ROAD,
  SCRAPYARD,
  RED_CANYON,
  OASIS_BAZAAR,
  THE_NEST,
  SALT_FLATS,
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
