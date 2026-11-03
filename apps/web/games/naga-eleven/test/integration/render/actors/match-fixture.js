import { FORMATS } from '../../../../src/data/formats.js';

// a match as the README's contract describes it, laid out by hand, so the drawing can be tested
// whatever the sim is doing
const TEAMS = {
  7: [
    { id: 'chrey-school', name: 'Chrey School', short: 'CHR', kit: 'chrey-school' },
    { id: 'royal-kids', name: 'Royal Kids', short: 'RYK', kit: 'royal-kids' },
  ],
  11: [
    { id: 'cambodia', name: { en: 'Cambodia', km: 'កម្ពុជា' }, short: 'CAM', kit: 'cambodia' },
    { id: 'korea-youth', name: 'Korea', short: 'KOR', kit: 'korea' },
  ],
};

const STARS = { 7: { 6: 'sochetra', 13: 'rithy' }, 11: { 9: 'sochetra', 20: 'minjun' } };

function playerAt(format, { team, slotIndex, index }) {
  const { pitch, formation } = FORMATS[format];
  const slot = formation[slotIndex];
  const along = team === 0 ? slot.along : 1 - slot.along;
  const star = STARS[format][index] ?? null;

  return {
    index,
    team,
    slotIndex,
    role: slot.role,
    id: `${team}-${slotIndex}`,
    name: star ? star[0].toUpperCase() + star.slice(1) : `Player ${index}`,
    number: slotIndex + 1,
    star,
    moves: star ? ['naga-shot', 'power-shot'] : [],
    spirit: 30,
    spiritMax: 100,
    x: along * pitch.length * 0.92 + pitch.length * 0.04,
    y: (team === 0 ? slot.across : 1 - slot.across) * pitch.width,
    vx: 0,
    vy: 0,
    facing: { x: team === 0 ? 1 : -1, y: 0 },
    stride: 0,
    stun: 0,
    tackle: 0,
    charge: 0,
    lastKick: -Infinity,
    dive: null,
  };
}

export function fixtureMatch({ format = '11', phase = 'play', tick = 600 } = {}) {
  const spec = FORMATS[format];
  const size = spec.players;
  const players = [0, 1].flatMap((team) =>
    spec.formation.map((_, slotIndex) =>
      playerAt(format, { team, slotIndex, index: team * size + slotIndex }),
    ),
  );

  return {
    tick,
    phase,
    phaseTicks: 20,
    half: 1,
    minute: 12,
    clock: 3000,
    halfTicks: spec.halfSeconds * 60,
    format,
    pitch: { ...spec.pitch },
    goal: { ...spec.goal },
    teams: TEAMS[format],
    score: [0, 0],
    humanTeam: 0,
    controlled: spec.kicker,
    players,
    ball: {
      x: spec.pitch.length / 2,
      y: spec.pitch.width / 2,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      owner: null,
      inGoal: null,
      travel: 0,
    },
    restart: null,
    duel: null,
    events: [],
    lastScorer: null,
    kickoffTeam: 0,
  };
}

// the steered forward runs at goal with the ball, a defender slides in, another lies floored
export function attackingMatch(format = '11') {
  const match = fixtureMatch({ format });
  const size = FORMATS[format].players;
  const carrier = match.players[match.controlled];
  const defender = match.players[size + 2];

  Object.assign(carrier, { x: match.pitch.length * 0.72, y: match.pitch.width * 0.55 });
  Object.assign(carrier, {
    vx: 2.4,
    vy: 0.6,
    stride: 37,
    charge: 22,
    facing: { x: 0.97, y: 0.24 },
  });
  Object.assign(match.ball, {
    x: carrier.x + 12,
    y: carrier.y + 2,
    owner: carrier.index,
    travel: 40,
  });
  Object.assign(defender, { x: carrier.x + 40, y: carrier.y - 14, tackle: 8, vx: -3, vy: 1 });
  Object.assign(defender, { facing: { x: -0.95, y: 0.3 } });
  Object.assign(match.players[size + 3], { x: carrier.x + 60, y: carrier.y + 30, stun: 20 });

  return match;
}
