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
  'skins',
  'leaderboard',
  'credits',
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

// the actions that only open a panel over the menu, and the panel each opens
const PANEL_ACTIONS = {
  leaderboard: 'leaderboard',
  credits: 'credits',
  help: 'help',
  settings: 'settings',
  layout: 'layout',
  skins: 'skins',
  continue: 'heroes',
};

function panelActions(menus) {
  return Object.fromEntries(
    Object.entries(PANEL_ACTIONS).map(([action, panel]) => [action, () => menus.open(panel)]),
  );
}

export function createMenuActions({ game, audio, ui, fullscreen, menus, leaveForArcade }) {
  const begin = () => {
    if (ui.isTouchOn() && fullscreen.supported && !fullscreen.isActive()) {
      fullscreen.enter();
    }
    startPlay(game);
  };
  const actions = {
    ...heroActions(game, begin),
    ...panelActions(menus),
    play: playAction(game, menus),
    continueSaved: continueSavedAction(game, menus),
    again: () => playFromStart(game),
    resume: () => resumePlay(game),
    fullscreen: () => fullscreen.toggle(),
    restart: () => restartRun(game),
    quit: () => quitToTitle(game),
    back: () => menus.back(),
    weapon() {
      cycleWeapon(game);
      menus.refresh();
    },
    arcade: leaveForArcade,
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
