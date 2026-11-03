import { FORMATS } from '../../../../src/data/formats.js';

// a match as the sim lays one out (README, "A match"), standing still at a moment the test picks,
// so a venue can be drawn under it without playing the match there
function playerAt(format, team, slotIndex) {
  const { pitch, formation } = format;
  const slot = formation[slotIndex];
  const along = team === 0 ? slot.along : 1 - slot.along;
  const across = team === 0 ? slot.across : 1 - slot.across;

  return {
    index: team * format.players + slotIndex,
    team,
    slotIndex,
    role: slot.role,
    x: (along * pitch.length) / 2 + (team === 0 ? 0 : pitch.length / 2),
    y: across * pitch.width,
    vx: 0,
    vy: 0,
    facing: { x: team === 0 ? 1 : -1, y: 0 },
  };
}

export function venueMatch({
  format = '11',
  phase = 'play',
  tick = 0,
  ball = null,
  score = [0, 0],
}) {
  const spec = FORMATS[format];
  const players = [0, 1].flatMap((team) =>
    spec.formation.map((_, slotIndex) => playerAt(spec, team, slotIndex)),
  );
  const centre = { x: spec.pitch.length / 2, y: spec.pitch.width / 2 };

  return {
    tick,
    phase,
    phaseTicks: 0,
    half: 1,
    format,
    pitch: spec.pitch,
    goal: spec.goal,
    teams: [
      { id: 'cambodia', kit: 'cambodia', short: 'CAM' },
      { id: 'japan', kit: 'japan', short: 'JPN' },
    ],
    score: [...score],
    humanTeam: 0,
    controlled: spec.kicker,
    players,
    ball: { ...centre, z: 0, vx: 0, vy: 0, vz: 0, owner: null, inGoal: null, travel: 0, ...ball },
    events: [],
  };
}
