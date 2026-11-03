import { moveOf } from '../../data/moves.js';
import { startChain } from '../combos/chains.js';
import { notePass, spendCombo } from '../combos/pass-combo.js';
import { beatMan } from '../skills/dribble.js';
import { gainSpirit } from '../spirit.js';

const SHOTS = ['goal', 'saved', 'parried', 'wide', 'blocked'];

// what a duel's outcome does to the run of play: a man beaten keeps the combo going (and a dribble
// special starts a chain), a pass out of it is a step, a shot spends it, and the defender who won
// the ball fills his gauge
const AFTER = {
  broke: (match, { attacker, move }) => {
    beatMan(match, attacker);

    if (move) {
      startChain(match, attacker, moveOf(move));
    }
  },
  passed: (match, { attacker }) => notePass(match, attacker, { held: 0 }),
  stolen: (match, { defender }) => gainSpirit(match, defender, 'tackle'),
  cut: (match, { defender }) => gainSpirit(match, defender, 'intercept'),
  blocked: (match, { defender }) => gainSpirit(match, defender, 'block'),
};

export function afterOutcome(match, actors, outcome) {
  if (SHOTS.includes(outcome.result)) {
    spendCombo(match, actors.attacker);
  }

  AFTER[outcome.result]?.(match, actors);
}
