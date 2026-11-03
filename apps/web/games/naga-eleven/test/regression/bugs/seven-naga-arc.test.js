import { describe, expect, it } from 'vitest';

import { LOOK_ART } from '../../../src/art/duel/looks.js';
import { createPen } from '../../../src/render/duel/pen.js';
import { camMoment } from '../../../src/render/save-cam/moment.js';
import { camScene } from '../../../src/render/save-cam/scene.js';
import { drawCamTrail } from '../../../src/render/save-cam/trails/index.js';
import { fakeMatch } from '../../support/duel-fixtures.js';
import { createPixelCanvas } from '../../support/pixel-canvas.js';

// The Seven-Headed Naga's six other heads stood level with the one holding the ball, small and
// packed together: a flat dark band through the flight (save cam ticks 22 to 36) where the title
// and the README have them in an arc over it on their necks. Each head's burning eye shows where
// it stands, so the eyes other than the front head's must stand well over it, out to both sides
const SKY = '#0b1028';

const EYE = LOOK_ART['seven-naga'].eye[1];

const hexAt = (canvas, x, y) => {
  const at = (y * canvas.width + x) * 4;

  return `#${[...canvas.data.subarray(at, at + 3)].map((value) => value.toString(16).padStart(2, '0')).join('')}`;
};

function drawnAt(ticks) {
  const canvas = createPixelCanvas(256, 144);
  const pen = createPen(canvas.getContext('2d'), { unit: 1 });
  const moment = camMoment(
    { shooter: 4, keeper: 5, move: 'seven-headed-naga', aim: { side: 0.5, height: 0.6 }, dive: 1 },
    5,
  );
  const scene = camScene({ moment, ticks, length: 96, match: fakeMatch({ seed: 2 }) }, 300 + ticks);

  pen.rect([0, 0, 256, 144], SKY);
  drawCamTrail(pen, { points: scene.trail, look: 'seven-naga', art: scene.art, tick: scene.tick });

  return { canvas, ball: scene.trail.at(-1) };
}

const eyesOn = (canvas) =>
  Array.from({ length: canvas.width * canvas.height }, (_, i) => ({
    x: i % canvas.width,
    y: Math.floor(i / canvas.width),
  })).filter(({ x, y }) => hexAt(canvas, x, y) === EYE);

// the front head's eye, the one nearest the ball in its jaws, and the eyes of the six behind it;
// `unit` is about the front head's size
function farEyes({ canvas, ball }) {
  const unit = Math.min(4, Math.max(0.78, ball.radius / 3.1));
  const all = eyesOn(canvas);
  const distance = (eye, to) => Math.hypot(eye.x - to.x, eye.y - to.y);
  const nearest = all.reduce((best, eye) =>
    distance(eye, ball) < distance(best, ball) ? eye : best,
  );
  const own = all.filter((eye) => distance(eye, nearest) <= 4 * unit + 2);
  const front = {
    x: own.reduce((sum, eye) => sum + eye.x, 0) / own.length,
    y: own.reduce((sum, eye) => sum + eye.y, 0) / own.length,
  };

  return { front, eyes: all.filter((eye) => !own.includes(eye)), unit };
}

describe('the Seven-Headed Naga’s six other heads stand in an arc over the one in front', () => {
  it.each([16, 22, 26, 30, 34, 36])('at tick %s', (ticks) => {
    const { front, eyes, unit } = farEyes(drawnAt(ticks));
    const middleY = eyes.reduce((sum, eye) => sum + eye.y, 0) / eyes.length;
    const xs = eyes.map((eye) => eye.x);

    expect(eyes.length).toBeGreaterThanOrEqual(4);
    expect(middleY).toBeLessThan(front.y - 8 * unit);
    expect(Math.min(...xs)).toBeLessThan(front.x - 2 * unit);
    expect(Math.max(...xs)).toBeGreaterThan(front.x + 6 * unit);
    expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(24 * unit);
  });
});
