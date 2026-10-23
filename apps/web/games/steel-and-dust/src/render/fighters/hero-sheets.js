import { HERO_THEMES } from '../../art/hero-themes.js';
import { HEROES, heroById } from '../../data/heroes.js';
import { loadHeroSprites } from './hero-sprites.js';

export function heroSheetFor(view, id) {
  return view.heroSheets[heroById(id).id];
}

// every Shade's strips load at the start, so the Shade picked on the title or after a fall is
// already in when it is first drawn
export function createHeroSheets(view) {
  view.heroSheets = {};
  for (const hero of HEROES) {
    const theme = HERO_THEMES[hero.id];
    // the sheet fills in as its strips load, so it is tagged, not copied
    const sheet = loadHeroSprites({ ...view.loaders, hero, theme });
    sheet.heroId = hero.id;
    view.heroSheets[hero.id] = sheet;
  }
}
