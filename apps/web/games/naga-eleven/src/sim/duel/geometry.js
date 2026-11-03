import { distance } from '../vector.js';

// team 0 attacks toward x = pitch.length, team 1 toward x = 0
export const attackSign = (team) => (team === 0 ? 1 : -1);

export const goalLineOf = (match, team) => (team === 0 ? match.pitch.length : 0);

export const goalCentreOf = (match, team) => ({
  x: goalLineOf(match, team),
  y: match.pitch.width / 2,
});

// how far a player is from the goal they attack, as a share of the pitch's length
export const goalShareOf = (match, player) =>
  distance(player, goalCentreOf(match, player.team)) / match.pitch.length;

export const keeperOf = (match, team) =>
  match.players.find((player) => player.team === team && player.role === 'keeper') ?? null;

export const isStar = (player) => Boolean(player?.star);

export const pairKey = (first, second) =>
  first.index < second.index ? `${first.index}-${second.index}` : `${second.index}-${first.index}`;

export function keepOnPitch(match, point, margin = 9) {
  point.x = Math.min(match.pitch.length - margin, Math.max(margin, point.x));
  point.y = Math.min(match.pitch.width - margin, Math.max(margin, point.y));
}
