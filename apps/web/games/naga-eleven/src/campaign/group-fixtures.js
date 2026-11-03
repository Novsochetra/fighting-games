import { createRandom, nextRandom } from '../sim/random.js';
import { hashText, mixSeeds } from './seeds.js';
import { DEFAULT_STRENGTH } from './team-strength.js';

// a match between equal teams averages 1.35 goals a side; ten points of strength add 0.8 to the
// stronger side, and each side gets six chances, so scores stay those of real football
const SCORING = { meanGoals: 1.35, perStrength: 0.08, minGoals: 0.15, maxGoals: 4.5, chances: 6 };

const pairsOf = (teams) =>
  teams.flatMap((home, i) => teams.slice(i + 1).map((away) => [home, away]));

// the other matches are spread over the hero's rounds, the pair the hero's opponent is not in first
export function fixtureRounds(group, heroTeam) {
  const pairs = pairsOf(group.teams.filter((team) => team !== heroTeam));
  const rounds = [];
  let left = pairs;

  group.opponents.forEach((opponent, index) => {
    const playedSoFar = pairs.length - left.length;
    const due = Math.ceil((pairs.length * (index + 1)) / group.opponents.length) - playedSoFar;
    const ordered = [
      ...left.filter((pair) => !pair.includes(opponent)),
      ...left.filter((pair) => pair.includes(opponent)),
    ];
    const round = ordered.slice(0, due);

    rounds.push(round);
    left = left.filter((pair) => !round.includes(pair));
  });

  return rounds;
}

function goalsFrom(random, expected) {
  const chance = Math.min(SCORING.maxGoals, Math.max(SCORING.minGoals, expected)) / SCORING.chances;
  let goals = 0;

  for (let i = 0; i < SCORING.chances; i += 1) {
    goals += nextRandom(random) < chance ? 1 : 0;
  }

  return goals;
}

export function playFixture([home, away], { strengths, seed }) {
  const random = createRandom(seed);
  const gap = (strengths[home] ?? DEFAULT_STRENGTH) - (strengths[away] ?? DEFAULT_STRENGTH);

  return {
    home,
    away,
    homeGoals: goalsFrom(random, SCORING.meanGoals + SCORING.perStrength * gap),
    awayGoals: goalsFrom(random, SCORING.meanGoals - SCORING.perStrength * gap),
  };
}

export function playRound({ group, heroTeam, cupId, record, seed }) {
  const round = fixtureRounds(group, heroTeam)[group.round] ?? [];

  return round.map(([home, away]) =>
    playFixture([home, away], {
      strengths: group.strengths,
      seed: mixSeeds(seed, hashText(cupId), record.replays, hashText(`${home}/${away}`)),
    }),
  );
}
