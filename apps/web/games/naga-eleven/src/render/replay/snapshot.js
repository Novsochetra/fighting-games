import { copyFields, plainCopy } from './copy.js';

// what a frame is drawn from, tick by tick; who the players are is kept once, in the cast
const MATCH_FIELDS = [
  'tick',
  'phase',
  'phaseTicks',
  'half',
  'minute',
  'clock',
  'halfTicks',
  'controlled',
  'lastScorer',
  'kickoffTeam',
];
const PLAYER_FIELDS = [
  'x',
  'y',
  'vx',
  'vy',
  'stride',
  'stun',
  'tackle',
  'recover',
  'noPickup',
  'receiving',
  'holding',
  'charge',
  'lastKick',
  'spirit',
  'spiritMax',
  'energy',
];
const BALL_FIELDS = [
  'x',
  'y',
  'z',
  'vx',
  'vy',
  'vz',
  'owner',
  'inGoal',
  'travel',
  'lastTouch',
  'move',
];
const CAST_FIELDS = ['index', 'team', 'slotIndex', 'role', 'id', 'number', 'star'];

export const NO_EVENTS = Object.freeze([]);

export function castOf(match) {
  return {
    format: match.format,
    pitch: plainCopy(match.pitch, 1),
    goal: plainCopy(match.goal, 1),
    humanTeam: match.humanTeam ?? null,
    teams: plainCopy(match.teams ?? [], 3),
    players: match.players.map((player) => ({
      ...copyFields({}, player, CAST_FIELDS),
      name: plainCopy(player.name, 1),
      moves: plainCopy(player.moves ?? [], 1),
      stats: plainCopy(player.stats ?? {}, 1),
    })),
  };
}

export const createSnapshot = () => ({
  score: [0, 0],
  ball: {},
  players: [],
  restart: null,
  events: NO_EVENTS,
});

function writePlayer(target, player) {
  copyFields(target, player, PLAYER_FIELDS);
  target.facingX = player.facing?.x ?? 1;
  target.facingY = player.facing?.y ?? 0;
  target.dive = player.dive ? { tick: player.dive.tick, side: player.dive.side } : null;
}

// the slot is written over in place, so a recorder keeps the same few hundred objects all match
export function writeSnapshot(slot, match, events = match.events) {
  copyFields(slot, match, MATCH_FIELDS);
  slot.score[0] = match.score[0];
  slot.score[1] = match.score[1];
  slot.restart = match.restart ? plainCopy(match.restart, 1) : null;
  copyFields(slot.ball, match.ball, BALL_FIELDS);
  slot.players.length = match.players.length;
  match.players.forEach((player, i) => {
    slot.players[i] ??= {};
    writePlayer(slot.players[i], player);
  });
  slot.events = events?.length ? events.map((event) => plainCopy(event)) : NO_EVENTS;

  return slot;
}

export const cloneSnapshot = (slot) => ({
  ...plainCopy(slot, 1),
  score: [...slot.score],
  ball: { ...slot.ball },
  players: slot.players.map((player) => ({ ...player, dive: player.dive && { ...player.dive } })),
  restart: slot.restart && { ...slot.restart },
  events: slot.events,
});
