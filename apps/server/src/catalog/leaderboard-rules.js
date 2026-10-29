// A game with an online leaderboard names in its game.json what a run of it can be, so the server
// checks each score it is sent without knowing the game: its heroes, how many missions and
// difficulties it has, and the most points a second of play can earn.
const HERO_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_MISSIONS = 99;
const MAX_DIFFICULTIES = 9;

const isWholeBetween = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const isPositive = (value) => Number.isFinite(value) && value > 0;
const isHeroId = (value) => typeof value === 'string' && value.length <= 40 && HERO_ID.test(value);

function checkHeroes(heroes) {
  const isIdList = Array.isArray(heroes) && heroes.length > 0 && heroes.every(isHeroId);

  return isIdList && new Set(heroes).size === heroes.length
    ? []
    : ['"leaderboard.heroes" must be a list of different hero ids'];
}

function checkCounts(rules) {
  const problems = [];

  if (!isWholeBetween(rules.missions, 1, MAX_MISSIONS)) {
    problems.push(`"leaderboard.missions" must be a whole number from 1 to ${MAX_MISSIONS}`);
  }

  if (!isWholeBetween(rules.difficulties, 1, MAX_DIFFICULTIES)) {
    problems.push(
      `"leaderboard.difficulties" must be a whole number from 1 to ${MAX_DIFFICULTIES}`,
    );
  }

  if (!isPositive(rules.maxPointsPerSecond)) {
    problems.push('"leaderboard.maxPointsPerSecond" must be a number above 0');
  }

  return problems;
}

export function checkLeaderboard(entry) {
  const rules = entry.leaderboard;

  if (rules === undefined) {
    return [];
  }

  if (typeof rules !== 'object' || rules === null || Array.isArray(rules)) {
    return ['"leaderboard" must be an object'];
  }

  return [...checkHeroes(rules.heroes), ...checkCounts(rules)];
}
