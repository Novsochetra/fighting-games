import { renderGoals } from '../parts/goal-list.js';
import { renderGroup } from '../parts/group-table.js';
import { renderGrowth } from '../parts/growth.js';
import { renderScoreboard } from '../parts/scoreboard.js';

// data: { teams, score, side, penalties, goals, xp: { before, after, gained }, woken, group };
// Back does nothing here, so a press meant for the match cannot skip what it earned
export const POSTMATCH_SCREEN = {
  render(section, { data, view }) {
    renderScoreboard(section, data, view);
    renderGoals(section, data, view);
    renderGrowth(section, data, view);
    renderGroup(section, data.group, view);
  },
  back: () => true,
};
