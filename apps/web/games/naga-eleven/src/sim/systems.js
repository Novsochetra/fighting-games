import { DUO_COMBOS } from '../data/combos.js';

const ALL_DUOS = DUO_COMBOS.map((duo) => duo.move);

// a match made without them (a quick match, the one behind the title, a test) plays every part of
// the game; the story turns them on one at a time (src/campaign/systems.js)
export function systemsOf(given) {
  return {
    passCombo: given?.passCombo ?? true,
    roleSkills: given?.roleSkills ?? true,
    chains: given?.chains ?? true,
    duos: [...(given?.duos ?? ALL_DUOS)],
  };
}
