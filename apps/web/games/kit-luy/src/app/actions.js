import { toggledOps } from '../data/settings.js';
import { clothCount } from '../sim/pieces.js';
import { clearPieces, dealPiece, givePieces, openStall, pause, resume, takePiece } from './flow.js';

// The order the pieces went down in is kept here, as the keys act between frames: Backspace must
// take back the piece just dealt even before the page has drawn it.
function counterActions(stage) {
  const { game } = stage;
  const counted = () => clothCount(game.run.cloth);

  function settle() {
    if (counted() === 0) {
      stage.lastDealt = [];
    }
  }

  function take(value) {
    const before = counted();

    takePiece(game, value);

    if (counted() < before) {
      stage.lastDealt.splice(stage.lastDealt.lastIndexOf(value), 1);
    }
  }

  return {
    take,
    takeLast: () => stage.lastDealt.length > 0 && take(stage.lastDealt[stage.lastDealt.length - 1]),

    deal(value) {
      const before = counted();

      dealPiece(game, value);

      if (counted() > before) {
        stage.lastDealt.push(value);
      }
    },

    clear() {
      clearPieces(game);
      settle();
    },

    give() {
      givePieces(game);
      settle();
    },
  };
}

export function createActions(stage, { leaveForArcade, renderSettings }) {
  const { game, menus } = stage;
  const open = () => openStall(game, stage.window.Date.now() >>> 0);

  return {
    ...counterActions(stage),
    again: open,
    quit: open,
    pause: () => pause(game),
    resume: () => resume(game),
    help: () => menus.open('help'),
    back: () => menus.back(),
    arcade: leaveForArcade,

    settings() {
      renderSettings();
      menus.open('settings');
    },

    escape() {
      if (menus.back()) {
        return;
      }

      if (game.screen === 'pause') {
        resume(game);
      } else {
        pause(game);
      }
    },

    // the mix is the run's from its first customer, so on the title the stall opens afresh
    toggleOp(op) {
      game.settings.ops = toggledOps(game.settings.ops, op);
      stage.save();
      renderSettings();

      if (game.screen === 'title') {
        open();
      }
    },
  };
}
