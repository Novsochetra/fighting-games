import { HERO_THEMES } from '../../art/hero-themes.js';
import { heroById } from '../../data/heroes.js';
import { loadHeroSprites } from './hero-sprites.js';

// a Shade's strips load the first time it is asked for: the picked one, or one whose echo or
// carved soldier is still on the road after the run went on as another
export function heroSheetFor(view, id) {
  const hero = heroById(id);
  if (!view.heroSheets[hero.id]) {
    const sheet = loadHeroSprites({ ...view.loaders, hero, theme: HERO_THEMES[hero.id] });
    // the sheet fills in as its strips load, so it is tagged, not copied
    sheet.heroId = hero.id;
    view.heroSheets[hero.id] = sheet;
  }
  return view.heroSheets[hero.id];
}

// only the picked Shade's strips are kept: when the pick changes, every other Shade's are let go
export function keepPickedHero(view, id) {
  const picked = heroById(id).id;
  if (view.heroKept === picked) {
    return;
  }
  view.heroKept = picked;
  for (const other of Object.keys(view.heroSheets)) {
    if (other !== picked) {
      delete view.heroSheets[other];
    }
  }
  heroSheetFor(view, picked);
}

export function createHeroSheets(view) {
  view.heroSheets = {};
  view.heroKept = null;
}
