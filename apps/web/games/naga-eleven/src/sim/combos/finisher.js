import { PASS_COMBO } from '../../data/combos.js';
import { moveOf } from '../../data/moves.js';
import { skillStyleOf } from '../skills/assign.js';
import { comboLiftOf } from './pass-combo.js';

// the holder of a combo of x3 or more strikes his side's finisher, free: the passing paid for it
export function finisherOf(match, player) {
  const { level } = comboLiftOf(match, player);

  if (match.systems?.passCombo === false || level < PASS_COMBO.finisherFrom) {
    return null;
  }

  const finishers = PASS_COMBO.finishers[skillStyleOf(match.teams?.[player.team]?.kit)];
  const tier = level >= PASS_COMBO.most ? PASS_COMBO.most : PASS_COMBO.finisherFrom;

  return { move: moveOf(finishers[tier]), level };
}
