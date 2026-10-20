import { HERO_THEMES } from '../../art/hero-themes.js';
import { DEFAULT_HERO, heroById } from '../../data/heroes.js';
import { loadHeroSprites } from './hero-sprites.js';

function loadHero(view, id) {
  const hero = heroById(id);
  return loadHeroSprites({
    ...view.loaders,
    directory: hero.directory,
    theme: HERO_THEMES[hero.id],
  });
}

// each Shade's strips load the first time that Shade is picked
export function heroSheetFor(view, id) {
  const key = heroById(id).id;
  view.heroSheets[key] ||= loadHero(view, key);
  return view.heroSheets[key];
}

export function createHeroSheets(view) {
  view.heroSheets = {};
  heroSheetFor(view, DEFAULT_HERO);
}
