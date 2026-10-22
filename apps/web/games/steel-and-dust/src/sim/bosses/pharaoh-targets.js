import { breakJarsIn } from '../hazards/canopic-jars.js';
import { popMiragesIn } from './mirage.js';

// the hero's blows and shots break the Pharaoh's jars and pop his copies, as they break crates
export function strikePharaohSpells(game, attacker, area) {
  breakJarsIn(game, area);
  popMiragesIn(game, attacker, area);
}
