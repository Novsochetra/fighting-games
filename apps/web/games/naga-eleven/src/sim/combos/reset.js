import { clearChains } from './chains.js';
import { endCombo } from './pass-combo.js';

// a restart, a goal or half time ends every run of play: the combo, a pass on its way, a duo's
// ball and the chains
export function resetPlay(match) {
  endCombo(match, 'restart');
  clearChains(match);
  match.comboPass = null;
  match.duoPass = null;
}
