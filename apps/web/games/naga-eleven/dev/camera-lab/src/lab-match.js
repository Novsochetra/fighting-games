import { attachDuels } from '../../../src/sim/duel/index.js';
import { createRandom } from '../../../src/sim/random.js';

const PITCH = { length: 1000, width: 640 };

const ROLES = ['keeper', 'defender', 'defender', 'midfielder', 'forward'];

const STATS = {
  speed: 50,
  shot: 50,
  pass: 50,
  dribble: 50,
  tackle: 50,
  keeping: 50,
  stamina: 50,
};

function labPlayer(index, team) {
  return {
    index,
    team,
    slotIndex: index % ROLES.length,
    role: ROLES[index % ROLES.length],
    id: `p${index}`,
    name: `Player ${index}`,
    number: index + 1,
    star: null,
    stats: { ...STATS },
    moves: [],
    spirit: 200,
    spiritMax: 200,
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
  };
}

// two sides of five, Sochetra up front for the home side, the computer picking for both, as the
// duel tests build one: a duel needs no more of a match than this
export function labMatch(seed = 3) {
  const players = [0, 1].flatMap((team) =>
    ROLES.map((_, slot) => labPlayer(team * ROLES.length + slot, team)),
  );
  const match = {
    tick: 100,
    phase: 'play',
    phaseTicks: 0,
    format: '7',
    pitch: { ...PITCH },
    goal: { width: 120, height: 56, depth: 30 },
    score: [0, 0],
    humanTeam: null,
    controlled: null,
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

  return attachDuels(match);
}

export const keeperOf = (match, team) => match.players[team * ROLES.length];

export const forwardOf = (match, team) => match.players[team * ROLES.length + 4];

export function giveBall(match, player) {
  Object.assign(match.ball, { owner: player.index, x: player.x + 11, y: player.y, z: 0 });
}
