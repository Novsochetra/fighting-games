import { WORLD_VIEW } from '../config.js';
import { boundsFor, clampAlong, clampDepth } from './camera/bounds.js';
import { cutOnJump } from './camera/cut.js';
import { aimAt, aimAtView, stepAim } from './camera/dead-zone.js';
import { aheadOf, keepInView, SOFT } from './camera/keep-in-view.js';
import { createLead, stepLead } from './camera/lead.js';
import { FOCUS_ROW, lensFor, rowAt, scaleAt } from './camera/lens.js';
import { noteMoments, sweepToCentre } from './camera/moments.js';
import { easeMotion, motionOf, notePace, settleMotion } from './camera/motion.js';
import { startPan, stepPan } from './camera/pan.js';
import { addShake, createShake, stepShake } from './camera/shake.js';
import { smoothStep } from './camera/smooth.js';
import { frameSteered } from './camera/steered.js';
import { subjectOf } from './camera/subject.js';

export { PIXELS_PER_UNIT } from './camera/lens.js';

// how many ticks the springs take to settle on what they aim at: slow, as a broadcast camera
// eases into a pan; slower in depth, so the view tilts gently
const SMOOTH = { along: 26, depth: 36 };

export function createCamera(match) {
  const lens = lensFor(match.pitch);
  const camera = {
    lens,
    bounds: boundsFor(lens, match),
    along: { value: match.pitch.length / 2, velocity: 0, pace: 0 },
    depth: { value: match.pitch.width / 2, velocity: 0, pace: 0 },
    aim: { x: match.pitch.length / 2, y: match.pitch.width / 2 },
    seen: null,
    lead: createLead(),
    shake: createShake(),
    pan: null,
    phase: match.phase,
    score: [...match.score],
    scorer: null,
    scorerRow: null,
  };

  if (match.phase === 'kickoff') {
    sweepToCentre(camera, match, 0);
  }

  return camera;
}

function aimFor(camera, match, { point, lead, framed }) {
  if (framed) {
    aimAt(camera, point);

    return;
  }

  stepAim(camera, { x: point.x + lead, y: point.y });
  frameSteered(camera, match);
}

function follow(camera, match) {
  const subject = subjectOf(camera, match);
  const { point, smooth } = subject;

  if (cutOnJump(camera, point)) {
    return true;
  }

  const before = motionOf(camera);

  aimFor(camera, match, subject);

  smoothStep(camera.depth, camera.aim.y, smooth ?? SMOOTH.depth);
  smoothStep(camera.along, camera.aim.x, smooth ?? SMOOTH.along);

  const sprung = motionOf(camera);

  keepInView(camera, aheadOf(point), SOFT);
  easeMotion(camera, { before, ball: point });
  settleMotion(camera, { before, sprung });

  return false;
}

function holdInBounds(camera) {
  const depth = clampDepth(camera.bounds, camera.depth.value);
  const along = clampAlong(camera.bounds, camera.lens, { x: camera.along.value, y: depth });

  camera.depth.velocity = depth === camera.depth.value ? camera.depth.velocity : 0;
  camera.along.velocity = along === camera.along.value ? camera.along.velocity : 0;
  camera.depth.value = depth;
  camera.along.value = along;
}

// returns whether it cut to a new shot
function moveCamera(camera, match) {
  if (!camera.pan) {
    return follow(camera, match);
  }

  stepPan(camera, match);
  aimAtView(camera);
  camera.seen = null;

  return false;
}

export function updateCamera(camera, match) {
  const from = motionOf(camera);

  noteMoments(camera, match);
  stepLead(camera.lead, match);

  const isCut = moveCamera(camera, match);

  holdInBounds(camera);
  notePace(camera, isCut ? motionOf(camera) : from);
  stepShake(camera.shake, match.tick);
}

// what lays down a layer the venue drew once: a world x seen at a scale lands at
// `left + (worldX - x) * scale`, and a row counted from the horizon (rowAt) at `row + top`
export const viewOf = (camera) => ({
  lens: camera.lens,
  x: camera.along.value,
  left: WORLD_VIEW.width / 2 + camera.shake.x,
  top: FOCUS_ROW - rowAt(camera.lens, camera.depth.value) + camera.shake.y,
});

export function project(camera, x, y, lift = 0) {
  const scale = scaleAt(camera.lens, y);
  const view = viewOf(camera);

  return {
    x: view.left + (x - view.x) * scale,
    y: view.top + rowAt(camera.lens, y, lift),
    scale,
  };
}

export const shakeCamera = (camera, power) => addShake(camera.shake, power);

export function panCamera(camera, { x, y, ticks }) {
  const depth = clampDepth(camera.bounds, y);

  startPan(camera, { x: clampAlong(camera.bounds, camera.lens, { x, y: depth }), y: depth, ticks });
}
