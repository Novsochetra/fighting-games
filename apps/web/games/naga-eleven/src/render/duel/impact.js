import { DUEL_UI } from '../../art/duel/palette.js';
import { hash } from './hash.js';
import { disc, polygon, ring } from './shapes.js';

const SPIKES = 12;

// a star of light where the moves meet, its spikes long and thin, shrinking away
function starburst(pen, { x, y, size, color }) {
  for (let i = 0; i < SPIKES; i += 1) {
    const angle = (i / SPIKES) * Math.PI * 2 + 0.2;
    const reach = size * (i % 2 === 0 ? 1 : 0.55);
    const side = angle + Math.PI / 2;

    polygon(
      pen,
      [
        [x + Math.cos(side) * 2, y + Math.sin(side) * 2],
        [x + Math.cos(angle) * reach, y + Math.sin(angle) * reach],
        [x - Math.cos(side) * 2, y - Math.sin(side) * 2],
      ],
      color,
    );
  }
}

// sparks thrown out from the impact, falling as they go
function sparks(pen, { x, y, since, colors }) {
  for (let i = 0; i < 18; i += 1) {
    const angle = hash(i, 41) * Math.PI * 2;
    const speed = 1.2 + hash(i, 42) * 2.4;
    const sx = x + Math.cos(angle) * speed * since;
    const sy = y + Math.sin(angle) * speed * since + 0.05 * since * since;

    if (since < 26 + hash(i, 43) * 10) {
      pen.rect([sx, sy, 2, 2], colors[i % colors.length]);
    }
  }
}

export function drawImpact(pen, scene) {
  const since = scene.sinceHit;

  if (since < 0) {
    return;
  }

  const { x, y } = scene.impact;
  const colors = [DUEL_UI.white, scene.art.body[4], scene.art.accent[2]];

  if (since < 14) {
    const size = 46 - since * 3;

    disc(pen, { x, y, radius: Math.max(2, 14 - since), color: DUEL_UI.white });
    starburst(pen, { x, y, size, color: scene.art.body[4] });
    starburst(pen, { x, y, size: size * 0.7, color: DUEL_UI.white });
  }

  if (since < 20) {
    ring(pen, { x, y, radius: 8 + since * 3, width: 2, color: scene.art.accent[3] });
  }

  sparks(pen, { x, y, since, colors });
}
