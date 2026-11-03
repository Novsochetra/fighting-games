import { fillSlot, setSlot, showSlot, slotOf } from '../dom.js';
import { outcomeOf } from '../match-result.js';
import { kitColoursOf } from '../team-kits.js';
import { teamBadge } from './team-badge.js';

export function renderScoreboard(section, data, view) {
  const teams = data.teams ?? [];
  const score = data.score ?? [0, 0];
  const kits = kitColoursOf(teams);
  const outcome = outcomeOf({ score, side: data.side, penalties: data.penalties });
  const banner = setSlot(section, 'outcome', view.say(outcome));

  banner.className = `result-banner is-${outcome}`;
  fillSlot(section, 'home', teamBadge(view, teams[0], kits[0]));
  fillSlot(section, 'away', teamBadge(view, teams[1], kits[1]));
  setSlot(section, 'score', `${view.number(score[0])} - ${view.number(score[1])}`);
  slotOf(section, 'score').setAttribute('aria-label', `${score[0]} - ${score[1]}`);
  showSlot(section, 'penalties', Boolean(data.penalties));

  if (data.penalties) {
    setSlot(section, 'penalties', view.sayWith('penalties', data.penalties));
  }
}
