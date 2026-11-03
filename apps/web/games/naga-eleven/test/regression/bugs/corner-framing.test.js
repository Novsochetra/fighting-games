import { describe, expect, it } from 'vitest';
import { FORMATS } from '../../../src/data/formats.js';
import { createCamera, project, updateCamera } from '../../../src/render/camera.js';
import { HUD_COVER } from '../../../src/render/camera/room.js';
import { WORLD_VIEW } from '../../../src/config.js';
import { createMatch } from '../../../src/sim/create-match.js';
import { drainEvents } from '../../../src/sim/events.js';
import { tick } from '../../../src/sim/tick.js';

// An 11 v 11 corner framed the flag: by the near flag the box and the goal ran off the top or under
// the minimap, by the far one the goal mouth and the players waiting there were cut off at the
// bottom. Until it is taken the camera now frames the corner between the flag and the penalty
// spot: the flag, the spot and the goal all in the clear part of the view.
const MARGIN = 24;

function step(match, camera) {
  tick(match);
  updateCamera(camera, match);
  drainEvents(match);
}

// where the flag and the penalty spot are drawn on a tick of the restart
function framingOf(match, camera) {
  const { restart, pitch } = match;
  const spot = FORMATS[match.format].penaltySpot;
  const isFarEnd = restart.x > pitch.length / 2;
  const penaltyX = isFarEnd ? pitch.length - spot : spot;

  return {
    kind: restart.kind,
    flag: project(camera, restart.x, restart.y),
    penalty: project(camera, penaltyX, pitch.width / 2),
    crossbar: project(camera, isFarEnd ? pitch.length : 0, pitch.width / 2, match.goal.height),
  };
}

// the ball put out over the goal line by the defending side, by the near or the far flag
function cornerTaken(format, side) {
  const match = createMatch({ seed: 6, format, halfSeconds: 60 });
  const camera = createCamera(match);
  const { length, width } = match.pitch;

  while (match.tick < 400 || match.phase !== 'play') {
    step(match, camera);
  }

  const defender = match.players.find((player) => player.team === 1 && player.role === 'defender');

  Object.assign(match.ball, { owner: null, kick: null, vx: 0, vy: 0, vz: 0, z: 0 });
  Object.assign(match.ball, { x: length + 6, y: side === 'near' ? width - 60 : 60 });
  match.ball.lastTouch = defender.index;

  let seen = null;

  for (let i = 0; i < 1200 && !(seen && match.phase === 'play'); i += 1) {
    step(match, camera);
    seen = match.phase === 'restart' ? framingOf(match, camera) : seen;
  }

  return seen;
}

const isClear = (point) =>
  point.x >= MARGIN &&
  point.x <= WORLD_VIEW.width - MARGIN &&
  point.y >= HUD_COVER + MARGIN &&
  point.y <= WORLD_VIEW.height - MARGIN;

describe.each(['7', '11'])('a %s a side corner', (format) => {
  it.each(['near', 'far'])('by the %s flag is framed with the box as it is taken', (side) => {
    const { kind, flag, penalty, crossbar } = cornerTaken(format, side);

    expect(kind).toBe('corner');
    expect([flag, penalty, crossbar].map(isClear)).toEqual([true, true, true]);
  });
});
