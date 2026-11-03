import { GROUND } from '../paths.js';
import { scatter, withFade } from './fade.js';
import { headAt } from './naga.js';
import { drawTide, drawWave } from './water.js';

// the Tonle Sap Tide: the lake's tide runs in, rises behind the ball into a wave and breaks
// over it at the keeper
function back(pen, scene) {
  const ball = headAt(scene);
  const height = 16 + Math.min(1, scene.approach * 1.4) * 44;

  withFade(pen, scene, () => {
    drawTide(pen, { left: 0, right: ball.x, ground: GROUND, art: scene.art, tick: scene.tick });
    drawWave(pen, {
      x: ball.x - 6,
      ground: GROUND,
      height,
      length: 70,
      art: scene.art,
      tick: scene.tick,
    });
  });
  scatter(pen, {
    scene,
    points: [ball, { x: ball.x - 10, y: ball.y - 10 }, { x: ball.x - 20, y: GROUND - 20 }],
    colors: [scene.art.body[4], scene.art.accent[3]],
  });
}

// the tide rising into waves along the foot of the band
function bandFigure(pen, cut) {
  const ground = cut.top + cut.height;

  for (let i = 0; i < 4; i += 1) {
    drawWave(pen, {
      x: cut.offset + 46 + i * 66 + Math.round(Math.sin(cut.tick / 9 + i) * 3),
      ground,
      height: 30 + (i % 2) * 8,
      length: 56,
      art: cut.relief,
      tick: cut.tick,
    });
  }
}

export const TONLE_SAP = { back, band: bandFigure };
