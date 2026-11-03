import { CHARACTERS } from '../characters.js';

export const STAT_NAMES = ['speed', 'shot', 'pass', 'dribble', 'tackle', 'keeping', 'stamina'];

export const FORMATION_ROLES = {
  7: ['keeper', 'defender', 'defender', 'midfielder', 'midfielder', 'midfielder', 'forward'],
  11: [
    'keeper',
    'defender',
    'defender',
    'defender',
    'defender',
    'midfielder',
    'midfielder',
    'midfielder',
    'forward',
    'forward',
    'forward',
  ],
};

export const statsOf = (values) =>
  Object.fromEntries(STAT_NAMES.map((name, i) => [name, values[i]]));

// stats are listed in STAT_NAMES order, so a player fits on one line
export const member = (name, number, stats) => ({
  name,
  number,
  stats: statsOf(stats),
  star: null,
  moves: [],
});

export const starPlayer = (characterId, number, stats, moves) => ({
  id: characterId,
  name: CHARACTERS[characterId].name,
  number,
  stats: statsOf(stats),
  star: characterId,
  moves,
});

// spirit refills slowly, so a rival given a gauge bigger than his stamina's starts with a special
// nearly in hand and can spend one or two a match
export const withSpirit = (player, spiritMax) => ({ ...player, spiritMax });

// the campaign fills in Sochetra's stats and moves from the save
export const hero = () => ({
  id: 'sochetra',
  name: CHARACTERS.sochetra.name,
  number: 10,
  role: 'forward',
  star: 'sochetra',
  hero: true,
  stats: null,
  moves: [],
});

const placed = (teamId, format) => (player, i) => ({
  ...player,
  id: player.id ?? `${teamId}-${player.number}`,
  role: FORMATION_ROLES[format][i],
});

// youth and senior national sides share their country's kit, so `kit` is given only for those
export const team = ({ id, name, short, kit = id, format, players }) => ({
  id,
  name,
  short,
  kit,
  format,
  players: players.map(placed(id, format)),
});
