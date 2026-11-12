import { toggledOps } from '../data/settings.js';
import { answerRun, pause, quit, resume, startRun } from './flow.js';

export function createActions(stage, { leaveForArcade, renderSettings }) {
  const { game, menus } = stage;

  return {
    play: () => startRun(game, stage.window.Date.now() >>> 0),
    pause: () => pause(game),
    resume: () => resume(game),
    quit: () => quit(game),
    help: () => menus.open('help'),
    back: () => menus.back(),
    arcade: leaveForArcade,

    settings() {
      renderSettings();
      menus.open('settings');
    },

    answer: (index) => answerRun(game, index),

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

    toggleOp(op) {
      game.settings.ops = toggledOps(game.settings.ops, op);
      stage.save();
      stage.showTitle(game, stage.text);
    },
  };
}
