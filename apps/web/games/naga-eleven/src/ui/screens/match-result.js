import { CHARACTERS } from '../../data/characters.js';
import { teamList } from '../../campaign/teams.js';

const compare = (mine, theirs) => {
  if (mine === theirs) {
    return 'draw';
  }

  return mine > theirs ? 'win' : 'loss';
};

// from the player's side; a knockout drawn after the whistle is settled by its penalties
export function outcomeOf({ score, side = 0, penalties = null }) {
  const outcome = compare(score[side], score[1 - side]);

  return outcome === 'draw' && penalties ? compare(penalties.for, penalties.against) : outcome;
}

const playerName = (team, id) =>
  teamList(team?.players).find((player) => player.id === id)?.name ?? null;

// a scorer is a player id: a star's name as the cast writes it in both languages, else their name
// in the team that scored, else nobody
export function scorerName(teams, goal) {
  if (!goal.scorer) {
    return null;
  }

  return (
    CHARACTERS[goal.scorer]?.name ?? playerName(teams?.[goal.team], goal.scorer) ?? goal.scorer
  );
}

export const goalsInOrder = (goals = []) =>
  [...goals].sort((first, second) => first.minute - second.minute);
