import { GROUND } from '../paths.js';
import { scatter, withFade } from './fade.js';
import { headAt } from './naga.js';
import { drawWave } from './water.js';

// a wave of the open sea rises behind the ball and rides it in
function back(pen, scene) {
  const ball = headAt(scene);
  const height = 12 + Math.min(1, scene.approach * 1.6) * 36;

  withFade(pen, scene, () => {
    drawWave(pen, {
      x: ball.x - 4,
      ground: GROUND,
      height,
      length: 56,
      art: scene.art,
      tick: scene.tick,
    });
  });
  scatter(pen, {
    scene,
    points: [ball, { x: ball.x - 12, y: ball.y - 6 }],
    colors: [scene.art.body[4]],
  });
}

function bandFigure(pen, cut) {
  for (let i = 0; i < 3; i += 1) {
    drawWave(pen, {
      x: cut.offset + 70 + i * 86,
      ground: cut.top + cut.height,
      height: 34,
      length: 66,
      art: cut.relief,
      tick: cut.tick,
    });
  }
}

export const WAVE = { back, band: bandFigure };
