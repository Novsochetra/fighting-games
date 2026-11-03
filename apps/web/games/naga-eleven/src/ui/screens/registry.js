import { CHAPTERS_SCREEN } from './views/chapters.js';
import { HERO_SCREEN } from './views/hero.js';
import { HOWTO_SCREEN } from './views/howto.js';
import { MENU_SCREEN } from './views/menu.js';
import { PAUSE_SCREEN } from './views/pause.js';
import { POSTMATCH_SCREEN } from './views/postmatch.js';
import { PREMATCH_SCREEN } from './views/prematch.js';
import { QUICKMATCH_SCREEN } from './views/quickmatch.js';
import { SETTINGS_SCREEN } from './views/settings.js';
import { TITLE_SCREEN } from './views/title.js';

// each screen is its section, #screen-<name> in index.html; `render` fills it from the data
// `show` was given, `act` and `adjust` answer its own buttons and rows, `back` its own Back
export const SCREENS = Object.freeze({
  title: TITLE_SCREEN,
  menu: MENU_SCREEN,
  chapters: CHAPTERS_SCREEN,
  hero: HERO_SCREEN,
  prematch: PREMATCH_SCREEN,
  postmatch: POSTMATCH_SCREEN,
  quickmatch: QUICKMATCH_SCREEN,
  settings: SETTINGS_SCREEN,
  pause: PAUSE_SCREEN,
  howto: HOWTO_SCREEN,
});

export const SCREEN_NAMES = Object.keys(SCREENS);
