import { fillSlot } from '../dom.js';
import { teamBadge } from '../parts/team-badge.js';
import { firstPicks, quickOptions, stepPick, teamById } from '../quick-picks.js';
import { kitColoursOf } from '../team-kits.js';

const pickedTeams = ({ options, picks }) => [
  teamById(options, picks.home),
  teamById(options, picks.away),
];

// data: { teams: quickMatchTeams(save, TEAMS) }; left and right on a row step through its teams,
// and Kick off says which two were picked (a plain team's spec is the plain one, for createMatch)
export const QUICKMATCH_SCREEN = {
  start(data) {
    const options = quickOptions(data.teams ?? []);

    return { options, picks: firstPicks(options) };
  },
  render(section, { state, view }) {
    const teams = pickedTeams(state);
    const kits = kitColoursOf(teams);

    fillSlot(section, 'home', teamBadge(view, teams[0], kits[0], { format: true }));
    fillSlot(section, 'away', teamBadge(view, teams[1], kits[1], { format: true }));
  },
  adjust(side, by, app) {
    const { state } = app.current;

    state.picks = stepPick(state.options, state.picks, { side, by });
    app.rerender();
  },
  act(action, _button, app) {
    if (action !== 'pick-teams') {
      return false;
    }

    const { state } = app.current;

    app.emit('pick-teams', { ...state.picks, teams: pickedTeams(state) });

    return true;
  },
};
