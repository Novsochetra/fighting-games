import { PLAIN_KITS } from '../../art/kits.js';
import { matchKits } from '../../render/actors/kit-clash.js';

const BASE_SHADE = 2;

const coloursOf = (kit) => ({
  shirt: kit.shirt[BASE_SHADE],
  shorts: kit.shorts[BASE_SHADE],
  trim: kit.trim[BASE_SHADE],
});

const isPlain = (team) => team?.plain !== undefined;

// the kits two teams wear against each other, changed as the match changes them when they clash;
// the plain teams only ever meet each other, red against blue
export function kitColoursOf(teams) {
  if (teams.some(isPlain)) {
    return teams.map((team, side) => coloursOf(PLAIN_KITS[team?.plain ?? side].home));
  }

  return matchKits({ teams }).map((kit) => coloursOf(kit.outfield));
}
