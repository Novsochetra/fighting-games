// what the half-time and full-time boards show, counted from the match's own events: each count
// is [team 0, team 1]; possession is ticks of play with the ball at a side's feet
export function createMatchStats() {
  return {
    shots: [0, 0],
    saves: [0, 0],
    passes: [0, 0],
    tacklesWon: [0, 0],
    duelsWon: [0, 0],
    possession: [0, 0],
    goals: [],
  };
}

function bump(pair, team) {
  if (team === 0 || team === 1) {
    pair[team] += 1;
  }
}

const teamOf = (match, index) => match?.players?.[index ?? -1]?.team;

const nameOf = (player) => {
  const { name } = player ?? {};

  return name && typeof name === 'object' ? { ...name } : (name ?? null);
};

function scorerOf(event, match) {
  const scorer = match?.players?.[event.scorer ?? -1];

  if (!scorer) {
    return { scorer: null, name: null, number: null };
  }

  return { scorer: event.scorer, name: nameOf(scorer), number: scorer.number ?? null };
}

// a goal as the boards list it, its scorer's name copied; an own goal has no scorer
function goalOf(event, match) {
  return {
    team: event.team,
    ...scorerOf(event, match),
    minute: Math.max(1, Math.floor(match?.minute ?? 0)),
    half: match?.half ?? 1,
    move: event.move ?? null,
  };
}

const COUNTERS = {
  shot: (stats, event, match) => bump(stats.shots, teamOf(match, event.player)),
  save: (stats, event, match) => bump(stats.saves, teamOf(match, event.keeper)),
  pass: (stats, event, match) => bump(stats.passes, teamOf(match, event.player)),
  tackle: (stats, event, match) => event.won && bump(stats.tacklesWon, teamOf(match, event.player)),
  duelEnd: (stats, event) => bump(stats.duelsWon, event.duel?.outcome?.winner),
  goal: (stats, event, match) => stats.goals.push(goalOf(event, match)),
};

// once a tick, with that tick's events, before they are drained
export function countEvents(stats, events = [], match = null) {
  for (const event of events ?? []) {
    COUNTERS[event.type]?.(stats, event, match);
  }

  if (match?.phase === 'play') {
    bump(stats.possession, teamOf(match, match.ball?.owner));
  }

  return stats;
}

// possession as whole percentages that add up to a hundred; even before anyone has had the ball
export function possessionShare(stats) {
  const [home, away] = stats.possession;
  const total = home + away;

  if (total === 0) {
    return [50, 50];
  }

  const share = Math.round((home / total) * 100);

  return [share, 100 - share];
}

export const goalsOf = (stats, team) => stats.goals.filter((goal) => goal.team === team);
