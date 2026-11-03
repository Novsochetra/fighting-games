import { TEAMS } from '../../data/teams/index.js';
import { matchKits } from '../actors/kit-clash.js';

const kitsKept = new WeakMap();

function kitsOf(match) {
  if (!kitsKept.has(match)) {
    kitsKept.set(match, matchKits(match));
  }

  return kitsKept.get(match);
}

// a squad's players are named `<team>-<number>` (src/data/teams/squad.js)
const squadOf = (player) => /^(.+)-\d+$/.exec(player.id ?? '')?.[1] ?? null;

const teamOf = (player, match) =>
  match?.teams?.[player.team]?.id ?? squadOf(player) ?? `side-${player.team ?? 0}`;

// in a match, what his side has on in it, an away shirt or a keeper's spare included; without one,
// his side's home kit
function kitOf(player, match) {
  const keeper = player.role === 'keeper';

  if (match) {
    const kits = kitsOf(match)[player.team] ?? kitsOf(match)[0];

    return { kit: kits.id, wear: keeper ? kits.keeperChoice : kits.choice };
  }

  const squad = squadOf(player);

  return {
    kit: TEAMS[squad]?.kit ?? `plain-${player.team ?? 0}`,
    wear: keeper ? 'keeper' : 'home',
  };
}

export function footballerOf(player, match = null) {
  return {
    team: teamOf(player, match),
    ...kitOf(player, match),
    place: player.slotIndex ?? player.index ?? 0,
  };
}

// a quick match has no hero's age, and 7-a-side is the children's game
export function footballerAge(heroAge, match = null) {
  if (heroAge) {
    return heroAge;
  }

  return match?.format === '7' ? 'child' : 'young';
}
