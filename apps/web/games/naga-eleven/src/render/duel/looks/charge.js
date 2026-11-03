import { hash } from '../hash.js';
import { ellipse, polygon } from '../shapes.js';
import { withFade } from './fade.js';
import { runnerAt } from './runner.js';

// a chevron of red light thrown out ahead of the charge
function chevron(pen, { x, y, size, color }) {
  polygon(
    pen,
    [
      [x, y - size],
      [x + size * 0.8, y],
      [x, y + size],
      [x - 4, y + size],
      [x + size * 0.8 - 4, y],
      [x - 4, y - size],
    ],
    color,
  );
}

// petals stream back off the charge: the flower knights of old Korea it is named for
function petals(pen, scene, at) {
  for (let i = 0; i < 14; i += 1) {
    const drift = (scene.tick * (2 + hash(i, 111) * 2) + hash(i, 112) * 80) % 80;
    const y = at.y - 34 + hash(i, 113) * 36 + Math.sin(scene.tick / 5 + i) * 2;

    ellipse(pen, {
      x: at.x - drift,
      y,
      radiusX: 2,
      radiusY: 1,
      color: scene.art.accent[2 + (i % 2)],
    });
  }
}

// Hwarang Charge: head down, a shoulder first through the tackle
function figures(pen, scene) {
  const at = runnerAt(scene);

  if (at.pose === 'fallen') {
    return;
  }

  withFade(pen, { ...scene, hit: scene.hit && !scene.attackWins }, () => {
    ellipse(pen, { x: at.x + 2, y: at.y - 24, radiusX: 18, radiusY: 26, color: scene.art.body[1] });
    petals(pen, scene, at);

    for (let i = 0; i < 3; i += 1) {
      const pulse = (scene.tick + i * 4) % 12;

      chevron(pen, {
        x: at.x + 16 + i * 10 + pulse,
        y: at.y - 24,
        size: 10 - i * 2,
        color: scene.art.body[3 + (i === 0 ? 1 : 0)],
      });
    }
  });
}

export const CHARGE = { attacker: runnerAt, figures };
