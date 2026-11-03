import { DUEL_UI } from '../../../art/duel/palette.js';
import { hash } from '../hash.js';
import { ART, INNER } from '../layout.js';
import { disc, ring } from '../shapes.js';
import { withFade } from './fade.js';
import { headAt } from './naga.js';

// the moon going dark: its disc, a black one sliding over it, the gold corona flaring round the
// last of its light; `cover` runs 0 to 1
export function drawEclipse(pen, { x, y, radius, cover, art, sky, tick }) {
  const [, dark, mid, light, core] = art.body;
  const shift = Math.round((1 - cover) * radius * 1.6);

  if (cover > 0.6) {
    const flare = (cover - 0.6) / 0.4;

    for (let i = 0; i < 16; i += 1) {
      const angle = (i / 16) * Math.PI * 2 + tick * 0.01;
      const reach = radius + 2 + flare * (4 + hash(i, Math.floor(tick / 4), 191) * 8);

      pen.rect(
        [x + Math.cos(angle) * reach, y + Math.sin(angle) * reach, 2, 2],
        art.accent[2 + (i % 2)],
      );
    }

    ring(pen, { x, y, radius: radius + 3, width: 2, color: art.accent[1] });
    ring(pen, { x, y, radius: radius + 1.5, width: 1.5, color: art.accent[3] });
  }

  disc(pen, { x, y, radius: radius + 2, color: dark });
  disc(pen, { x, y, radius, color: light });
  disc(pen, { x: x - 3, y: y - 3, radius: radius - 5, color: core });
  disc(pen, { x: x + shift, y: y - shift * 0.3, radius: radius + 0.5, color: sky });
  disc(pen, { x: x + shift + 3, y: y - shift * 0.3 + 3, radius: radius - 6, color: mid });
  disc(pen, { x: x + shift + 1, y: y - shift * 0.3 + 1, radius: radius - 3, color: sky });
}

function stars(pen, scene) {
  for (let i = 0; i < 46; i += 1) {
    if (hash(i, Math.floor(scene.tick / 5), 192) < 0.8) {
      pen.dot(
        hash(i, 193) * ART.width,
        INNER.top + hash(i, 194) * 72,
        i % 6 === 0 ? DUEL_UI.white : scene.art.body[3],
      );
    }
  }
}

// Eclipse Moon: Haruto's Silent Moon rises, the dark slides over it as the ball flies, and only
// its corona lights the way in; the ball draws a thin dark crescent after it
function back(pen, scene) {
  const cover = Math.min(1, scene.approach * 1.2 + (scene.hit ? 1 : 0));
  const ball = headAt(scene);

  withFade(pen, scene, () => {
    stars(pen, scene);
    drawEclipse(pen, {
      x: 112,
      y: 52,
      radius: 24,
      cover,
      art: scene.art,
      sky: scene.art.sky[0],
      tick: scene.tick,
    });

    for (let i = 1; i <= 4; i += 1) {
      const at = scene.trailPoint(i * 0.08);

      ring(pen, {
        ...at,
        radius: 3 + i * 2,
        width: 1,
        color: i < 3 ? scene.art.accent[2] : scene.art.body[2],
      });
    }

    disc(pen, { ...ball, radius: 8, color: scene.art.accent[3] });
    disc(pen, { x: ball.x - 2, y: ball.y, radius: 7.5, color: scene.art.sky[0] });
  });
}

function bandFigure(pen, cut) {
  drawEclipse(pen, {
    x: cut.offset + (cut.side === 'defend' ? 100 : 180),
    y: cut.top + cut.height / 2,
    radius: 26,
    cover: Math.min(1, cut.ticks / 24),
    art: { ...cut.art, body: cut.relief.body },
    sky: cut.art.body[0],
    tick: cut.tick,
  });
}

export const ECLIPSE = { back, band: bandFigure };
