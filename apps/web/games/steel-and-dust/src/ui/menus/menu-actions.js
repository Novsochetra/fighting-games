import { HEROES } from '../../data/heroes.js';
import {
  continueAs,
  cycleWeapon,
  playFromStart,
  quitToTitle,
  restartRun,
  resumeCheckpoint,
  resumePlay,
  selectMission,
  startPlay,
} from '../../sim/stage/flow.js';

// the buttons that open a panel make their own sound
const QUIET_ACTIONS = new Set([
  'back',
  'help',
  'settings',
  'layout',
  'leaderboard',
  'play',
  'continue',
  'continueSaved',
]);

// the same Shade list starts a run from the title and brings a fallen hero back as any Shade
function heroActions(game, begin) {
  const actions = {};
  for (const hero of HEROES) {
    actions[`hero-${hero.id}`] = () => {
      if (game.mode === 'over') {
        continueAs(game, hero.id);
        return;
      }
      game.settings.hero = hero.id;
      game.io.saveSettings(game.settings);
      begin();
    };
  }
  return actions;
}

// a new run starts at the first mission and a saved one where it was saved: its road is set up
// behind the menu, then the Shade is chosen
function playAction(game, menus) {
  return () => {
    selectMission(game, 0);
    menus.open('heroes');
  };
}

function continueSavedAction(game, menus) {
  return () => {
    if (game.checkpoint) {
      resumeCheckpoint(game);
      menus.open('heroes');
    }
  };
}

export function createMenuActions({ game, audio, ui, fullscreen, menus, location }) {
  const begin = () => {
    if (ui.isTouchOn() && fullscreen.supported && !fullscreen.isActive()) {
      fullscreen.enter();
    }
    startPlay(game);
  };
  const actions = {
    ...heroActions(game, begin),
    play: playAction(game, menus),
    continueSaved: continueSavedAction(game, menus),
    leaderboard: () => menus.open('leaderboard'),
    again: () => playFromStart(game),
    resume: () => resumePlay(game),
    help: () => menus.open('help'),
    settings: () => menus.open('settings'),
    layout: () => menus.open('layout'),
    fullscreen: () => fullscreen.toggle(),
    restart: () => restartRun(game),
    quit: () => quitToTitle(game),
    continue: () => menus.open('heroes'),
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
