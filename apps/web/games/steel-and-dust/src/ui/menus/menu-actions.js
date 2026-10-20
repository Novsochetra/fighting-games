import { HEROES } from '../../data/heroes.js';
import { MISSIONS } from '../../data/missions/index.js';
import {
  continueAs,
  cycleWeapon,
  playFromStart,
  quitToTitle,
  restartRun,
  resumePlay,
  selectMission,
  startPlay,
} from '../../sim/stage/flow.js';

// the buttons that open a panel make their own sound
const QUIET_ACTIONS = new Set(['back', 'help', 'settings', 'play', 'missions', 'continue']);
const isQuiet = (name) => QUIET_ACTIONS.has(name) || name.startsWith('mission-');

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

// picking a mission sets the road up behind the menu, then the Shade is chosen; Play always
// starts at the first mission
function missionActions(game, menus) {
  const pick = (index) => () => {
    selectMission(game, index);
    menus.open('heroes');
  };
  const actions = { play: pick(0), missions: () => menus.open('missions') };
  for (const mission of MISSIONS) {
    actions[`mission-${mission.index}`] = pick(mission.index);
  }
  return actions;
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
    ...missionActions(game, menus),
    again: () => playFromStart(game),
    resume: () => resumePlay(game),
    help: () => menus.open('help'),
    settings: () => menus.open('settings'),
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
    if (!isQuiet(name)) {
      audio.sfx('uiOk');
    }
    action();
  };
}
