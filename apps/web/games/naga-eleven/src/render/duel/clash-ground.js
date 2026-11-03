import { DUEL_INK } from '../../art/duel/palette.js';
import { drawFocusLines } from './focus-lines.js';
import { hash } from './hash.js';
import { ART, INNER } from './layout.js';
import { GROUND } from './paths.js';

// the world rushes past the ball: long streaks run left, faster the nearer the impact
function streaks(pen, scene) {
  const [, , mid, light] = scene.art.body;
  const speed = scene.hit ? 2 : 4 + scene.approach * 10;

  for (let i = 0; i < 30; i += 1) {
    const y = INNER.top + 3 + Math.floor(hash(i, 21) * (GROUND - INNER.top - 8));
    const length = 10 + Math.floor(hash(i, 22) * 50);
    const x =
      ART.width - ((scene.tick * speed * (0.6 + hash(i, 23)) + hash(i, 24) * 400) % 400) + 40;

    pen.rect([x, y, length, 1], hash(i, 25) < 0.2 ? light : mid);
  }
}

function ground(pen, scene) {
  const [deep] = scene.art.body;
  const [, low] = scene.art.sky;

  pen.rect([0, GROUND, ART.width, INNER.bottom - GROUND], DUEL_INK);
  pen.rect([0, GROUND, ART.width, 1], deep);

  for (let i = 0; i < 12; i += 1) {
    const x = ART.width - ((scene.tick * 6 + i * 40) % (ART.width + 40));

    pen.rect([x, GROUND + 3 + (i % 3) * 4, 18, 1], low);
  }
}

export function drawClashGround(pen, scene) {
  const [high, low] = scene.art.sky;

  pen.rect([0, INNER.top, ART.width, GROUND - INNER.top], high);

  // a lighter band near the horizon, stepped in rows of dither rather than a smooth gradient
  for (let y = GROUND - 30; y < GROUND; y += 1) {
    const share = (y - (GROUND - 30)) / 30;

    for (let x = (y % 2) * 2; x < ART.width; x += 4) {
      if (hash(x, y) < share) {
        pen.rect([x, y, 2, 1], low);
      }
    }
  }

  pen.rect([0, GROUND - 6, ART.width, 6], low);
  streaks(pen, scene);
  focus(pen, scene);
  ground(pen, scene);
}

// as the moves close in the lines gather on where they will meet
function focus(pen, scene) {
  const strength = scene.hit ? Math.max(0, 1 - scene.sinceHit / 30) : scene.approach;

  if (strength > 0.05) {
    drawFocusLines(pen, {
      centre: scene.impact,
      inner: 34,
      color: scene.art.body[1],
      tick: scene.tick,
      strength,
    });
  }
}
