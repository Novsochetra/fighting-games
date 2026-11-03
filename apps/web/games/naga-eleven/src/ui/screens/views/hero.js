import { heroAtLevel } from '../../../campaign/levels.js';
import { fillSlot, setSlot, slotOf } from '../dom.js';
import { heroMoves } from '../hero-moves.js';
import { moveRow, STATS, statRow } from '../parts/hero-sheet.js';
import { paintPortrait } from '../parts/portrait.js';
import { renderProgress } from '../parts/xp-meter.js';

// data: { hero: save.hero, age: the chapter's heroAge }; a side screen, so Back returns to the
// screen it opened over
export const HERO_SCREEN = {
  side: true,
  render(section, { data, view }) {
    const hero = data.hero ?? heroAtLevel(1);
    const stats = STATS.map(([stat, key]) => ({ stat, key, value: hero.stats?.[stat] ?? 0 }));

    renderProgress(section, hero, view);
    setSlot(section, 'spirit', view.sayWith('spiritMax', { spirit: hero.spiritMax }));
    fillSlot(
      section,
      'stats',
      stats.map((stat) => statRow(view, stat)),
    );
    fillSlot(
      section,
      'moves',
      heroMoves(hero).map((move) => moveRow(view, move)),
    );
    paintPortrait(slotOf(section, 'portrait'), {
      character: 'sochetra',
      age: data.age ?? 'child',
      mood: 'determined',
    });
  },
};
