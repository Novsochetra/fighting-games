import { COLORS } from '../../../art/colors.js';
import { isHeavyMove } from '../../../data/moves/heavy-moves.js';
import { canAffordHeavy, spendHeavy } from '../../combat/ult-bar.js';
import { startCharge, startMove } from '../../fighters/actions.js';
import { movesetOf } from '../../fighters/loadout.js';
import { addFloatText } from '../../fx/effects.js';
import { showHint } from '../../hints.js';

// a held press of heavy does not repeat the words every tick
const REFUSE_GAP = 24;

// heavy needs bar: a press with too little does nothing but say so, and the bar blinks
export function refuseHeavy(game, player) {
  const quiet = game.tickCount - game.heavyRefusedAt < REFUSE_GAP;
  game.heavyRefusedAt = game.tickCount;
  if (quiet) {
    return;
  }
  game.io.sfx('heavyEmpty', false, { x: player.x });
  addFloatText(game, { x: player.x, y: player.y - 48, text: 'No power', color: COLORS.lilac });
  showHint(game, 'heavyBar');
}

// every heavy move spends the bar; one let go out of a charge always comes out, its charge having
// started only with bar enough to pay
export function startHeroMove(game, player, id) {
  const move = movesetOf(game, player)[id];
  if (isHeavyMove(move)) {
    if (player.state !== 'charge' && !canAffordHeavy(game)) {
      refuseHeavy(game, player);
      return false;
    }
    spendHeavy(game);
  }
  return startMove(game, player, id);
}

export function tryCharge(game, player) {
  if (!canAffordHeavy(game)) {
    refuseHeavy(game, player);
    return false;
  }
  startCharge(player);
  return true;
}
