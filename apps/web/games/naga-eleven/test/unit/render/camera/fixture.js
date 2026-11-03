import { WORLD_VIEW } from '../../../../src/config.js';
import { FORMATS } from '../../../../src/data/formats.js';
import { updateCamera } from '../../../../src/render/camera.js';

// the parts of a match the camera reads (README, "A match"): a player of each side by the centre
// spot and the ball loose on it
export function matchOf(format = '11', { phase = 'play', ball = {} } = {}) {
  const { pitch, goal } = FORMATS[format];

  return {
    tick: 0,
    phase,
    phaseTicks: 0,
    half: 1,
    format,
    pitch,
    goal,
    score: [0, 0],
    humanTeam: null,
    controlled: null,
    events: [],
    players: [
      { index: 0, team: 0, x: pitch.length / 2, y: pitch.width / 2, vx: 0, vy: 0 },
      { index: 1, team: 1, x: pitch.length / 2 + 40, y: pitch.width / 2, vx: 0, vy: 0 },
    ],
    ball: {
      x: pitch.length / 2,
      y: pitch.width / 2,
      z: 0,
      vx: 0,
      vy: 0,
      owner: null,
      inGoal: null,
      ...ball,
    },
  };
}

export function run(camera, match, ticks, { step = () => {}, check = () => {} } = {}) {
  for (let i = 0; i < ticks; i += 1) {
    match.tick += 1;
    match.phaseTicks += 1;
    step(match, i);
    updateCamera(camera, match);
    check(match, i);
  }
}

export const lookOf = (camera) => ({ x: camera.along.value, y: camera.depth.value });

export const inView = (point) =>
  point.x >= 0 && point.x < WORLD_VIEW.width && point.y >= 0 && point.y < WORLD_VIEW.height;
