// what the campaign needs from a match, gathered from its events as they are drained
export const createLedger = (humanTeam) => ({
  humanTeam,
  goals: [],
  duelsWon: 0,
  unlocked: [],
});

const isHeroGoal = (match, event) =>
  event.team === match.humanTeam && match.players[event.scorer]?.star === 'sochetra';

function recordGoal(ledger, match, event) {
  ledger.goals.push({
    team: event.team,
    scorer: match.players[event.scorer]?.id ?? null,
    move: event.move ?? null,
    minute: match.minute,
    byHero: isHeroGoal(match, event),
  });
}

// a duel the player's side came out of on top
const wonBy = (duel, team) => duel?.outcome?.winner === team;

export function recordEvents(ledger, match, events) {
  for (const event of events) {
    if (event.type === 'goal') {
      recordGoal(ledger, match, event);
    } else if (event.type === 'duelEnd' && wonBy(event.duel, ledger.humanTeam)) {
      ledger.duelsWon += 1;
    }
  }
}

export function recordUnlock(ledger, move) {
  if (!ledger.unlocked.includes(move)) {
    ledger.unlocked.push(move);
  }
}

export function resultOf(ledger, { penalties = null } = {}) {
  const goalsFor = ledger.goals.filter((goal) => goal.team === ledger.humanTeam).length;

  return {
    goalsFor,
    goalsAgainst: ledger.goals.length - goalsFor,
    penalties,
    unlocked: [...ledger.unlocked],
    duelsWon: ledger.duelsWon,
    goalsBySochetra: ledger.goals.filter((goal) => goal.byHero).length,
    goals: ledger.goals.map((goal) => ({ ...goal })),
  };
}
