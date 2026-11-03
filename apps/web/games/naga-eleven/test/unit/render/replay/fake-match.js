// a small match of the README's shape, laid out by hand, so the recorder is tested whatever the
// sim is doing
function fakePlayer(index) {
  return {
    index,
    team: index < 2 ? 0 : 1,
    slotIndex: index % 2,
    role: index % 2 === 0 ? 'keeper' : 'forward',
    id: `player-${index}`,
    name: { en: `Player ${index}`, km: 'កីឡាករ' },
    number: index + 1,
    star: index === 1 ? 'sochetra' : null,
    stats: { speed: 50, shot: 50 },
    moves: index === 1 ? ['naga-shot'] : [],
    spirit: 10,
    spiritMax: 100,
    x: 100 + index * 10,
    y: 200,
    vx: 0,
    vy: 0,
    facing: { x: 1, y: 0 },
    stride: 0,
    stun: 0,
    tackle: 0,
    recover: 0,
    noPickup: 0,
    receiving: 0,
    holding: 0,
    charge: 0,
    lastKick: -Infinity,
    dive: null,
  };
}

export function fakeMatch({ players = 4 } = {}) {
  return {
    tick: 0,
    phase: 'play',
    phaseTicks: 0,
    half: 1,
    minute: 0,
    clock: 600,
    halfTicks: 600,
    format: '11',
    pitch: { length: 960, width: 420 },
    goal: { width: 120, height: 56, depth: 30 },
    teams: [
      { id: 'cambodia', name: { en: 'Cambodia', km: 'កម្ពុជា' }, short: 'CAM', kit: 'cambodia' },
      { id: 'japan-youth', name: 'Japan', short: 'JPN', kit: 'japan' },
    ],
    score: [0, 0],
    humanTeam: 0,
    controlled: 1,
    restart: null,
    duel: null,
    events: [],
    hooks: {},
    lastScorer: null,
    kickoffTeam: 0,
    players: Array.from({ length: players }, (_, i) => fakePlayer(i)),
    ball: { x: 480, y: 210, z: 0, vx: 0, vy: 0, vz: 0, owner: null, inGoal: null, travel: 0 },
  };
}

// one tick of the fake match: the clock runs, the ball rolls right and player 1 runs after it
export function advance(match, { events = [], ballStep = 2 } = {}) {
  match.tick += 1;
  match.phaseTicks += 1;
  match.ball.x += ballStep;
  match.ball.vx = ballStep;
  match.ball.travel += ballStep;
  match.players[1].x += 1;
  match.players[1].vx = 1;
  match.players[1].stride += 1;
  match.events = events;
}

export function playFake(match, ticks, eventsAt = {}) {
  for (let i = 0; i < ticks; i += 1) {
    advance(match, { events: eventsAt[match.tick + 1] ?? [] });
  }
}
