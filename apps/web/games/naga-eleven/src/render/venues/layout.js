import { FORMATS } from '../../data/formats.js';
import { textOf } from '../text.js';

// the two sides, as the fans' banners name them: a board's letters are Latin
const sidesOf = (teams = []) =>
  teams.map((team) => ({ name: textOf(team.name, 'en').toUpperCase(), kit: team.kit ?? team.id }));

// what a venue is laid out from: the match's own pitch and goal, the format's markings and the
// sides that play there
export function layoutOf(match) {
  const { pitch, goal } = match;
  const areas = FORMATS[match.format] ?? FORMATS[pitch.width < 800 ? '7' : '11'];
  const middle = { x: pitch.length / 2, y: pitch.width / 2 };

  return { pitch, goal, areas, middle, sides: sidesOf(match.teams) };
}

export const keyOf = ({ pitch, goal, sides = [] }) =>
  `${pitch.length}x${pitch.width}:${goal.width}x${goal.height}x${goal.depth}:${sides
    .map((side) => `${side.name}/${side.kit}`)
    .join('|')}`;
