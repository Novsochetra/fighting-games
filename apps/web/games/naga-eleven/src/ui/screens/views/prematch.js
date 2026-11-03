import { CHARACTERS } from '../../../data/characters.js';
import { fillSlot, setSlot, showSlot, slotOf } from '../dom.js';
import { moveName } from '../hero-moves.js';
import { paintPortrait } from '../parts/portrait.js';
import { teamBadge } from '../parts/team-badge.js';
import { kitColoursOf } from '../team-kits.js';
import { venueName } from '../venue-names.js';

function renderRival(section, rival, view) {
  showSlot(section, 'rival', Boolean(rival));

  if (!rival) {
    return;
  }

  setSlot(section, 'rival-name', view.text(CHARACTERS[rival.character]?.name ?? rival.name ?? ''));
  setSlot(section, 'rival-move', rival.move ? view.text(moveName(rival.move)) : '');
  paintPortrait(slotOf(section, 'rival-portrait'), {
    character: rival.character,
    age: rival.age,
    mood: rival.mood ?? 'smirk',
  });
}

// data: { cup, round, teams: [home, away], venue, rival: { character, age, mood, move } }
export const PREMATCH_SCREEN = {
  render(section, { data, view }) {
    const teams = data.teams ?? [];
    const kits = kitColoursOf(teams);
    const venue = venueName(data.venue);

    setSlot(section, 'cup', data.cup ? view.text(data.cup) : '');
    setSlot(section, 'round', view.text(data.round ?? view.say('friendly')));
    fillSlot(section, 'home', teamBadge(view, teams[0], kits[0]));
    fillSlot(section, 'away', teamBadge(view, teams[1], kits[1]));
    setSlot(section, 'venue', venue ? view.sayWith('atVenue', { venue }) : '');
    renderRival(section, data.rival, view);
  },
};
