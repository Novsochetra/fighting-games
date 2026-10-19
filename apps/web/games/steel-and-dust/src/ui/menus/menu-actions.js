import {
  continueRun,
  cycleWeapon,
  quitToTitle,
  restartRun,
  resumePlay,
  startPlay,
} from '../../sim/stage/flow.js';

// the buttons that open a panel make their own sound
const QUIET_ACTIONS = new Set(['back', 'help', 'settings']);

export function createMenuActions({ game, audio, ui, fullscreen, menus, location }) {
  const actions = {
    play() {
      if (ui.isTouchOn() && fullscreen.supported && !fullscreen.isActive()) {
        fullscreen.enter();
      }
      startPlay(game);
    },
    resume: () => resumePlay(game),
    help: () => menus.open('help'),
    settings: () => menus.open('settings'),
    fullscreen: () => fullscreen.toggle(),
    restart: () => restartRun(game),
    quit: () => quitToTitle(game),
    continue: () => continueRun(game),
    back: () => menus.back(),
    weapon() {
      cycleWeapon(game);
      menus.refresh();
    },
    arcade: () => location.assign('../../'),
  };
  return function act(name) {
    const action = actions[name];
    if (!action) {
      return;
    }
    if (!QUIET_ACTIONS.has(name)) {
      audio.sfx('uiOk');
    }
    action();
  };
}
