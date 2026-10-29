// A game with an online leaderboard names in its game.json what a run of it can be, so the server
// checks each score it is sent without knowing the game, and the arcade can show the board: its
// heroes and what each is called, how many missions it has, its difficulties' names, and the most
// points a second of play can earn.
const HERO_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_MISSIONS = 99;
const MAX_DIFFICULTIES = 9;
const MAX_NAME_LENGTH = 40;

const isWholeBetween = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
const isPositive = (value) => Number.isFinite(value) && value > 0;
const isName = (value) =>
  typeof value === 'string' && value.trim() !== '' && value.length <= MAX_NAME_LENGTH;
const isHero = (hero) =>
  typeof hero?.id === 'string' &&
  hero.id.length <= 40 &&
  HERO_ID.test(hero.id) &&
  isName(hero.name);

function checkHeroes(heroes) {
  const isHeroList = Array.isArray(heroes) && heroes.length > 0 && heroes.every(isHero);

  return isHeroList && new Set(heroes.map((hero) => hero.id)).size === heroes.length
    ? []
    : ['"leaderboard.heroes" must be a list of heroes, each with its own "id" and a "name"'];
}

function checkDifficulties(difficulties) {
  const isNameList =
    Array.isArray(difficulties) &&
    isWholeBetween(difficulties.length, 1, MAX_DIFFICULTIES) &&
    difficulties.every(isName);

  return isNameList
    ? []
    : [`"leaderboard.difficulties" must name 1 to ${MAX_DIFFICULTIES} difficulties, easiest first`];
}

function checkCounts(rules) {
  const problems = [];

  if (!isWholeBetween(rules.missions, 1, MAX_MISSIONS)) {
    problems.push(`"leaderboard.missions" must be a whole number from 1 to ${MAX_MISSIONS}`);
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

  return [
    ...checkHeroes(rules.heroes),
    ...checkDifficulties(rules.difficulties),
    ...checkCounts(rules),
  ];
}

// the arcade shows a board with the heroes' and difficulties' names; the scoring pace is the
// server's check alone, and no help to a cheat
export function shownLeaderboard({ heroes, missions, difficulties }) {
  return { heroes, missions, difficulties };
}
