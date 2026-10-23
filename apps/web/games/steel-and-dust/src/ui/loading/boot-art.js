import { HEROES } from '../../data/heroes.js';
import { UI_ART } from '../../data/ui-art.js';

// the hero select draws every hero from their card strips, standing on the side cards and cheering
// in the middle (ui/heroes/hero-panel.js)
export function heroCardArt(heroes = HEROES) {
  return heroes.flatMap((hero) => [hero.cards.side, hero.cards.middle]);
}

// everything the menus can show, loaded before the title comes up, so no popup opens on art that is
// still on its way
export function bootArt() {
  return [...UI_ART, ...heroCardArt()];
}
