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
  'skins',
  'leaderboard',
  'post',
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

// the board opens on the tab the run that just ended is on; posting opens with the name last used
function onlineActions({ game, menus, online, share }) {
  return {
    leaderboard() {
      menus.panels.leaderboard.chooseTab();
      menus.open('leaderboard');
    },
    post() {
      menus.panels.post.reset();
      menus.open('post');
    },
    sendScore: () => online.post(game.lastRun, menus.panels.post.state.name),
    share: () => share(game.lastRun, online.rankOf(game.lastRun)),
  };
}

// the buttons that open a panel over the menu, or close the one on top
function panelActions(menus) {
  return {
    credits: () => menus.open('credits'),
    help: () => menus.open('help'),
    settings: () => menus.open('settings'),
    skins: () => menus.open('skins'),
    continue: () => menus.open('heroes'),
    back: () => menus.back(),
  };
}

export function createMenuActions(services) {
  const { game, audio, ui, fullscreen, menus, leaveForArcade } = services;
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
    ...onlineActions(services),
    ...panelActions(menus),
    again: () => playFromStart(game),
    resume: () => resumePlay(game),
    fullscreen: () => fullscreen.toggle(),
    restart: () => restartRun(game),
    quit: () => quitToTitle(game),
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
