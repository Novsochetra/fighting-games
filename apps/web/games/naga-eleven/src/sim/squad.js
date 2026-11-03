import { FORMATS } from '../data/formats.js';
import { createPlayer } from './player.js';
import { distance } from './vector.js';

export function createPlayers(format, teams, { skills = true } = {}) {
  const { formation } = FORMATS[format];

  return teams.flatMap((team, side) =>
    formation.map((slot, slotIndex) =>
      createPlayer(team.players[slotIndex] ?? {}, {
        team: side,
        slotIndex,
        index: side * formation.length + slotIndex,
        slot,
        kit: team.kit ?? null,
        skills,
      }),
    ),
  );
}

export const teamSizeOf = (match) => match.players.length / 2;

// a match made by hand (a duel's test) may keep no sides of its own
export const sideOf = (match, team) =>
  match.sides?.[team] ?? match.players.filter((player) => player.team === team);

export const keeperOf = (match, team) => match.sides[team][0];

export const ownerOf = (match) =>
  match.ball.owner === null ? null : match.players[match.ball.owner];

export const teammatesOf = (match, player) =>
  match.sides[player.team].filter((other) => other !== player);

export const opponentsOf = (match, player) => match.sides[1 - player.team];

export function nearestTo(players, point) {
  let nearest = null;
  let nearestGap = Infinity;

  for (const player of players) {
    const gap = distance(player, point);

    if (gap < nearestGap) {
      nearest = player;
      nearestGap = gap;
    }
  }

  return nearest;
}

export const outfieldOf = (match, team) =>
  match.sides[team].filter((player) => player.role !== 'keeper');

export const nearestOutfield = (match, team) => nearestTo(outfieldOf(match, team), match.ball);
