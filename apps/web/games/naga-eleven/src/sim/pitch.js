import { FORMATS } from '../data/formats.js';
import { clamp } from './vector.js';

export const midX = ({ pitch }) => pitch.length / 2;

export const midY = ({ pitch }) => pitch.width / 2;

// team 0 attacks the goal at x = pitch.length, team 1 the one at x = 0, in both halves
export const attackSign = (team) => (team === 0 ? 1 : -1);

export const goalLineOf = ({ pitch }, team) => (team === 0 ? pitch.length : 0);

export const ownGoalLineOf = (match, team) => goalLineOf(match, 1 - team);

export const goalOf = (match, team) => ({ x: goalLineOf(match, team), y: midY(match) });

export const ownGoalOf = (match, team) => goalOf(match, 1 - team);

export const isInMouth = (match, y, margin = 0) =>
  Math.abs(y - midY(match)) < match.goal.width / 2 - margin;

// how far up the pitch an x is for a team: 0 on its own goal line, 1 on the one it attacks
export const progressOf = ({ pitch }, team, x) =>
  team === 0 ? x / pitch.length : 1 - x / pitch.length;

export const xAtProgress = ({ pitch }, team, progress) =>
  team === 0 ? progress * pitch.length : (1 - progress) * pitch.length;

// a share of the width from the team's own left touchline, as it faces the goal it attacks
export const acrossOf = ({ pitch }, team, y) =>
  team === 0 ? y / pitch.width : 1 - y / pitch.width;

export const yAtAcross = ({ pitch }, team, across) =>
  (team === 0 ? across : 1 - across) * pitch.width;

export const areasOf = (match) => FORMATS[match.format];

const inAreaOf = (match, team, point, area) =>
  Math.abs(point.x - ownGoalLineOf(match, team)) < area.depth &&
  Math.abs(point.y - midY(match)) < area.width / 2;

export const inBoxOf = (match, team, point) => inAreaOf(match, team, point, areasOf(match).box);

export const inGoalAreaOf = (match, team, point) =>
  inAreaOf(match, team, point, areasOf(match).goalArea);

export const insidePitch = ({ pitch }, point, margin = 0) => ({
  x: clamp(point.x, margin, pitch.length - margin),
  y: clamp(point.y, margin, pitch.width - margin),
});
