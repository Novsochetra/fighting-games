import { attachDuels, chooseDuel } from '../../src/sim/duel/index.js';
import { createRandom } from '../../src/sim/random.js';

export const PITCH = { length: 1000, width: 640 };

const ROLES = ['keeper', 'defender', 'defender', 'midfielder', 'forward'];

export const statsOf = (level) => ({
  speed: level,
  shot: level,
  pass: level,
  dribble: level,
  tackle: level,
  keeping: level,
  stamina: level,
});

export function fakePlayer({ index, team, role = 'forward', ...rest }) {
  return {
    index,
    team,
    slotIndex: index % ROLES.length,
    role,
    id: `p${index}`,
    name: `Player ${index}`,
    number: index + 1,
    star: null,
    stats: statsOf(50),
    moves: [],
    spirit: 0,
    spiritMax: 100,
    x: team === 0 ? 100 + index * 40 : 900 - index * 40,
    y: 320,
    vx: 0,
    vy: 0,
    facing: { x: team === 0 ? 1 : -1, y: 0 },
    stride: 0,
    stun: 0,
    tackle: 0,
    recover: 0,
    noPickup: 0,
    receiving: 0,
    holding: 0,
    charge: 0,
    lastKick: 0,
    dive: null,
    ...rest,
  };
}

// a match of two sides of five, in the shape the contract gives it, with the play phase on
export function fakeMatch({ seed = 1, humanTeam = 0, watched } = {}) {
  const players = [0, 1].flatMap((team) =>
    ROLES.map((role, slot) => fakePlayer({ index: team * ROLES.length + slot, team, role })),
  );
  const match = {
    tick: 100,
    phase: 'play',
    phaseTicks: 0,
    format: '7',
    pitch: { ...PITCH },
    goal: { width: 120, height: 56, depth: 30 },
    score: [0, 0],
    humanTeam,
    controlled: humanTeam === null ? null : humanTeam * ROLES.length + 4,
    players,
    ball: { x: 500, y: 320, z: 0, vx: 0, vy: 0, vz: 0, owner: null, inGoal: null, travel: 0 },
    restart: null,
    duel: null,
    events: [],
    hooks: {},
    random: createRandom(seed),
    lastScorer: null,
    kickoffTeam: 0,
  };

  return attachDuels(match, watched === undefined ? {} : { watched });
}

export const keeperOn = (match, team) => match.players[team * ROLES.length];

export const forwardOn = (match, team) => match.players[team * ROLES.length + 4];

export function giveBall(match, player) {
  Object.assign(match.ball, { owner: player.index, x: player.x + 11, y: player.y, z: 0 });
}

// team 0's forward, a star, carries the ball at team 1's star forward close in front of him
export function meeting(match, { at = 600, gap = 30, attacker = {}, defender = {} } = {}) {
  const carrier = Object.assign(forwardOn(match, 0), { star: 'sochetra', x: at, y: 320 }, attacker);
  const rival = Object.assign(
    forwardOn(match, 1),
    { star: 'rithy', x: at + gap, y: 320 },
    defender,
  );

  giveBall(match, carrier);

  return { carrier, rival };
}

export const startMeeting = (match, options) => {
  const pair = meeting(match, options);

  match.hooks.duel(match);

  return pair;
};

// ticks the duel until it is decided, making the human's picks when they are on offer
export function settleDuel(match, picks = {}) {
  for (let i = 0; i < 10 && match.duel?.stage === 'choose'; i += 1) {
    for (const [side, id] of Object.entries(picks)) {
      chooseDuel(match, side, id);
    }

    match.hooks.duelTick(match);
  }

  return match.duel;
}
