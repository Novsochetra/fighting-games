import { pantherFront, bellyFront } from './beasts.js';
import { bayonBack } from './bayon.js';
import { angkorFront, mountainBack } from './stone.js';

// each keeper's skill seen from in front: what rises behind him (`back`) and before him (`front`)
const GUARDS = {
  bayon: { back: bayonBack },
  wall: { front: angkorFront },
  mountain: { back: mountainBack },
  panther: { front: pantherFront },
  belly: { front: bellyFront },
};

export const GUARD_LOOKS = Object.keys(GUARDS);

export const guardOf = (look) => GUARDS[look] ?? {};
