import { DUEL_UI } from '../../../art/duel/palette.js';
import { hash } from '../hash.js';
import { disc } from '../shapes.js';

const FADE_TICKS = 16;

// once the moves have met a summoned shape fades, scattering its light
export function withFade(pen, scene, draw) {
  const left = scene.hit ? 1 - scene.sinceHit / FADE_TICKS : 1;

  if (left <= 0) {
    return;
  }

  pen.context.save();
  pen.context.globalAlpha *= left;
  draw();
  pen.context.restore();
}

export function scatter(pen, { scene, points, colors }) {
  const since = scene.sinceHit;

  if (since < 0 || since > 30) {
    return;
  }

  points.forEach((at, i) => {
    const angle = hash(i, 81) * Math.PI * 2;
    const reach = since * (0.6 + hash(i, 82) * 1.2);
    const size = since < 20 ? 2 : 1;

    disc(pen, {
      x: at.x + Math.cos(angle) * reach,
      y: at.y + Math.sin(angle) * reach - since * 0.3,
      radius: size,
      color: colors[i % colors.length] ?? DUEL_UI.white,
    });
  });
}

// glints of light winking on and off along a shape
export function glints(pen, { points, color, tick }) {
  points.forEach((at, i) => {
    if (hash(i, Math.floor(tick / 3), 83) < 0.18) {
      pen.rect([at.x - 2, at.y, 5, 1], color);
      pen.rect([at.x, at.y - 2, 1, 5], color);
    }
  });
}
