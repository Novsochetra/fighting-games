import { PENALTIES } from '../../data/duels.js';

export function tally(shootout) {
  const goals = [0, 0];
  const taken = [0, 0];

  for (const kick of shootout.kicks) {
    taken[kick.team] += 1;
    goals[kick.team] += kick.result === 'scored' ? 1 : 0;
  }

  return { goals, taken };
}

// the side with fewer kicks taken goes next, the first side when they have taken as many
export function nextTeam(shootout) {
  const { taken } = tally(shootout);

  if (taken[0] === taken[1]) {
    return shootout.first;
  }

  return taken[0] < taken[1] ? 0 : 1;
}

// in the first five a side is out once the other leads by more than it has kicks left; after
// them, once both have kicked as often and one has scored more
export function isOver(shootout) {
  const { goals, taken } = tally(shootout);
  const { kicks } = PENALTIES;

  if (taken[0] >= kicks && taken[1] >= kicks) {
    return taken[0] === taken[1] && goals[0] !== goals[1];
  }

  const left = taken.map((count) => Math.max(0, kicks - count));

  return goals[0] > goals[1] + left[1] || goals[1] > goals[0] + left[0];
}
