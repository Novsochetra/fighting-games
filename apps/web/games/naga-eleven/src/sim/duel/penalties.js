import { PENALTY_AIMS } from '../../data/duels.js';
import { computerDive, computerShot, resolveKick } from './penalty-kick.js';
import { isOver, nextTeam, tally } from './penalty-score.js';

const shotOf = (player) => player.stats?.shot ?? 50;

// the best shooters step up first, and the order goes round again in sudden death
function takersOf(players, team) {
  return players
    .filter((player) => player.team === team && player.role !== 'keeper')
    .sort((first, second) => shotOf(second) - shotOf(first) || first.index - second.index)
    .map((player) => player.index);
}

function keeperIndexOf(players, team) {
  const keeper = players.find((player) => player.team === team && player.role === 'keeper');

  return (keeper ?? players.find((player) => player.team === team)).index;
}

function pendingKick(shootout) {
  const team = nextTeam(shootout);
  const taken = tally(shootout).taken[team];
  const takers = shootout.takers[team];

  return {
    team,
    number: taken + 1,
    shooter: takers[taken % takers.length],
    keeper: shootout.keepers[1 - team],
    aim: null,
    power: null,
    dive: null,
  };
}

// `first` is the team that kicks first; with nobody watching the computer kicks for both
export function createShootout(match, { first = 0, watched = match.humanTeam !== null } = {}) {
  const { players } = match;
  const shootout = {
    random: match.random,
    players,
    humanTeam: watched ? match.humanTeam : null,
    first,
    takers: [takersOf(players, 0), takersOf(players, 1)],
    keepers: [keeperIndexOf(players, 0), keeperIndexOf(players, 1)],
    kicks: [],
    pending: null,
    over: false,
  };

  shootout.pending = pendingKick(shootout);

  return shootout;
}

export const penaltyOptions = (side) =>
  PENALTY_AIMS.map((entry) => ({ id: entry.id, aim: entry.aim, label: entry[side] }));

const isHumans = (shootout, team) => shootout.humanTeam !== null && team === shootout.humanTeam;

// the human's side: 'shoot' with { aim: -1 | 0 | 1, power: 0..1 }, or 'keep' with { dive }
export function choosePenalty(shootout, side, choice) {
  const kick = shootout.pending;

  if (!kick) {
    return false;
  }

  if (side === 'shoot' && kick.aim === null && [-1, 0, 1].includes(choice.aim)) {
    Object.assign(kick, { aim: choice.aim, power: Math.min(1, Math.max(0, choice.power ?? 0.7)) });

    return true;
  }

  if (side === 'keep' && kick.dive === null && [-1, 0, 1].includes(choice.dive)) {
    kick.dive = choice.dive;

    return true;
  }

  return false;
}

function chooseForComputer(shootout, kick) {
  if (kick.aim === null && !isHumans(shootout, kick.team)) {
    Object.assign(kick, computerShot(shootout.random));
  }

  if (kick.dive === null && !isHumans(shootout, 1 - kick.team)) {
    Object.assign(kick, computerDive(shootout.random));
  }
}

// once both have chosen the kick is taken: it returns the kick, or null while one still chooses
export function stepShootout(shootout) {
  const kick = shootout.pending;

  if (!kick) {
    return null;
  }

  chooseForComputer(shootout, kick);

  if (kick.aim === null || kick.dive === null) {
    return null;
  }

  const shooter = shootout.players[kick.shooter];
  const keeper = shootout.players[kick.keeper];
  const result = resolveKick(shootout.random, { ...kick, shooter, keeper });
  const taken = { ...kick, result };

  shootout.kicks.push(taken);
  shootout.over = isOver(shootout);
  shootout.pending = shootout.over ? null : pendingKick(shootout);

  return taken;
}

export function shootoutResult(shootout) {
  const { goals, taken } = tally(shootout);
  const winner = goals[0] > goals[1] ? 0 : 1;

  return { over: shootout.over, winner: shootout.over ? winner : null, goals, taken };
}
