import { FORMATS } from '../../data/formats.js';
import { plainCopy } from './copy.js';

const EMPTY_CAST = {
  format: '11',
  pitch: FORMATS[11].pitch,
  goal: FORMATS[11].goal,
  teams: [],
  players: [],
};

// what moves smoothly between two frames when the tape runs slow; the rest steps frame to frame
const GLIDING = ['x', 'y', 'stride'];
const BALL_GLIDING = ['x', 'y', 'z', 'travel'];
const STEPPING = ['tick', 'phase', 'phaseTicks', 'half', 'minute', 'clock', 'halfTicks'];

// one match-shaped object a replay draws through, changed in place frame by frame; it steers no
// one, so no ring, arrow or player card shows over the replay
export function createFrameMatch(cast = EMPTY_CAST) {
  return {
    replay: true,
    tick: 0,
    phase: 'play',
    phaseTicks: 0,
    half: 1,
    minute: 0,
    clock: 0,
    halfTicks: 0,
    format: cast.format,
    pitch: { ...cast.pitch },
    goal: { ...cast.goal },
    teams: plainCopy(cast.teams),
    score: [0, 0],
    humanTeam: null,
    controlled: null,
    restart: null,
    duel: null,
    events: [],
    hooks: {},
    lastScorer: null,
    kickoffTeam: 0,
    players: cast.players.map((player) => ({ ...plainCopy(player), facing: { x: 1, y: 0 } })),
    ball: { x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, owner: null, inGoal: null, travel: 0 },
  };
}

const between = (from, to, share) => (to === undefined ? from : from + (to - from) * share);

function glide(target, { from, to, share }, fields) {
  for (const field of fields) {
    target[field] = between(from[field], to?.[field], share);
  }
}

function showPlayer(player, { from, to, share }) {
  const { facingX, facingY, ...fields } = from;

  Object.assign(player, fields);
  player.facing.x = facingX;
  player.facing.y = facingY;
  glide(player, { from, to, share }, GLIDING);
}

// `share` is how far the tape is from `from` to `to`; `fresh` is true on the first draw of `from`,
// the one time its events are told, so effects fire once however slowly it plays
export function showFrame(frame, { from, to = null, share = 0, fresh = false }) {
  for (const field of STEPPING) {
    frame[field] = from[field];
  }

  frame.score[0] = from.score[0];
  frame.score[1] = from.score[1];
  frame.lastScorer = from.lastScorer;
  frame.kickoffTeam = from.kickoffTeam;
  frame.restart = from.restart && { ...from.restart };
  frame.events = fresh ? plainCopy(from.events) : [];
  Object.assign(frame.ball, from.ball);
  glide(frame.ball, { from: from.ball, to: to?.ball, share }, BALL_GLIDING);
  frame.players.forEach((player, i) => {
    showPlayer(player, { from: from.players[i], to: to?.players[i], share });
  });

  return frame;
}
