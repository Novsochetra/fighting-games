// what the server is sent for a run that ended: its time in whole seconds, as the server counts them
export function scoreBody(run, initials, ticket) {
  return {
    initials: initials.join(''),
    score: run.score,
    mission: run.mission,
    hero: run.hero,
    difficulty: run.difficulty,
    seconds: Math.floor(run.time / 60),
    cleared: run.cleared,
    ticket,
  };
}

export function rankText(rank) {
  return `#${rank.week} this week · #${rank.allTime} all time`;
}
