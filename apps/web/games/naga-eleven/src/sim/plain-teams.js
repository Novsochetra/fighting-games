import { FORMATS } from '../data/formats.js';

const SIDES = [
  { id: 'home', name: { en: 'Home', km: 'ម្ចាស់ផ្ទះ' }, short: 'HOM', kit: 'cambodia' },
  { id: 'away', name: { en: 'Away', km: 'ភ្ញៀវ' }, short: 'AWY', kit: 'japan' },
];

const PLAIN = { speed: 50, shot: 50, pass: 50, dribble: 50, tackle: 50, keeping: 30, stamina: 50 };

const STRENGTHS = {
  keeper: { keeping: 60, speed: 42 },
  defender: { tackle: 58, dribble: 44 },
  midfielder: { pass: 58, stamina: 58 },
  forward: { shot: 58, speed: 55, tackle: 40 },
};

// 7 v 7 is played by children, whose stats stand about ten under the older sides'
const LEVELS = { 7: -10, 11: 0 };

const levelled = (stats, level) =>
  Object.fromEntries(Object.entries(stats).map(([name, value]) => [name, value + level]));

function plainPlayer(side, { slot, slotIndex, level }) {
  const number = slotIndex + 1;

  return {
    id: `${side.id}-${number}`,
    name: `${side.short} ${number}`,
    number,
    role: slot.role,
    stats: levelled({ ...PLAIN, ...STRENGTHS[slot.role] }, level),
    star: null,
    moves: [],
  };
}

// two even sides for a quick match, as the one played behind the title
export const plainTeams = (format = '11', level = LEVELS[format]) =>
  SIDES.map((side) => ({
    ...side,
    players: FORMATS[format].formation.map((slot, slotIndex) =>
      plainPlayer(side, { slot, slotIndex, level }),
    ),
  }));
