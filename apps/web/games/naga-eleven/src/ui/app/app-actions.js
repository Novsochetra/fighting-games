import {
  loadSave,
  newSave,
  progressSummary,
  quickMatchTeams,
  SAVE_KEY,
} from '../../campaign/index.js';
import { CHAPTERS } from '../../data/story/index.js';
import { TEAMS } from '../../data/teams/index.js';
import { matchScreen, stillScreen } from './canvas-screens.js';
import { postmatchData } from './match-cards.js';
import { quickMatchSession } from './match-maker.js';
import { beginStory, cheerResult, storyCardDone } from './story-flow.js';

// a game reaches the arcade only by its address, never by a file of the arcade's
const ARCADE_ADDRESS = '../../';

const newSeed = () => Math.floor(Math.random() * 2 ** 32);

const savedGame = (app) => loadSave(app.storage, { seed: newSeed() });

function hasSave(storage) {
  try {
    return storage?.getItem(SAVE_KEY) !== null && storage?.getItem(SAVE_KEY) !== undefined;
  } catch {
    return false;
  }
}

export function showMenu(app) {
  const save = savedGame(app);

  app.mode = 'menu';
  app.showTitleArt();
  app.screens.show('menu', {
    hasSave: hasSave(app.storage),
    chapter: save.chapter + 1,
    level: save.hero.level,
  });
}

function startQuick(app, specs) {
  app.mode = 'quick';
  app.match = quickMatchSession(app, specs);
  app.screens.hide();
  app.play(matchScreen(app.match));
}

export function quickMatchDone(app, result) {
  const data = postmatchData({ session: app.match, result });

  app.play(stillScreen(app.match));
  app.screens.show('postmatch', data);
  cheerResult(app, data);
}

const afterCard = (app) => (app.mode === 'story' ? storyCardDone(app) : showMenu(app));

const heroAgeOf = (save) => CHAPTERS[Math.min(save.chapter, CHAPTERS.length - 1)].heroAge;

const ACTIONS = {
  start: showMenu,
  continue: (app) => app.screens.show('chapters', progressSummary(savedGame(app), CHAPTERS)),
  'new-story': (app) => beginStory(app, newSave({ seed: newSeed() })),
  'play-chapter': (app) => beginStory(app, savedGame(app)),
  'quick-match': (app) =>
    app.screens.show('quickmatch', { teams: quickMatchTeams(savedGame(app), TEAMS) }),
  'pick-teams': (app, payload) => startQuick(app, payload?.teams ?? []),
  'kick-off': afterCard,
  'after-match': afterCard,
  hero: (app) => {
    const save = savedGame(app);

    app.screens.show('hero', { hero: save.hero, age: heroAgeOf(save) });
  },
  settings: (app) => app.screens.show('settings'),
  'how-to': (app) => app.screens.show('howto', { device: app.device }),
  setting: (app) => app.applySettings(),
  resume: (app) => app.resume(),
  quit: showMenu,
  back: showMenu,
  arcade: (app) => app.window.location.assign(ARCADE_ADDRESS),
};

const QUIET = new Set(['setting', 'closed']);

export function act(app, name, payload) {
  if (!QUIET.has(name)) {
    app.sound?.(name === 'back' ? 'back' : 'confirm');
  }

  ACTIONS[name]?.(app, payload);
}
