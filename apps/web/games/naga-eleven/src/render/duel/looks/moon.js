import { DUEL_UI } from '../../../art/duel/palette.js';
import { hash } from '../hash.js';
import { ART, INNER } from '../layout.js';
import { trailPoint } from '../scene.js';
import { disc, ring } from '../shapes.js';
import { withFade } from './fade.js';

const MOON = { x: 112, y: 50, radius: 26 };

// night falls: stars come out and a crescent rises over the pitch, cut from the dark by a
// second, offset disc
function sky(pen, scene) {
  for (let i = 0; i < 40; i += 1) {
    if (hash(i, Math.floor(scene.tick / 6), 95) < 0.85) {
      pen.dot(
        hash(i, 96) * ART.width,
        INNER.top + hash(i, 97) * 70,
        i % 5 === 0 ? DUEL_UI.white : scene.art.body[3],
      );
    }
  }

  const rise = Math.min(1, scene.t / 30);
  const y = MOON.y + (1 - rise) * 40;
  const [, dark, mid, light, core] = scene.art.body;

  disc(pen, { x: MOON.x, y, radius: MOON.radius + 4, color: dark });
  disc(pen, { x: MOON.x, y, radius: MOON.radius, color: light });
  disc(pen, { x: MOON.x - 4, y: y - 4, radius: MOON.radius - 6, color: core });
  disc(pen, { x: MOON.x + 10, y: y - 6, radius: MOON.radius - 2, color: mid });
  disc(pen, { x: MOON.x + 12, y: y - 7, radius: MOON.radius - 3, color: scene.art.sky[0] });
}

// the shot makes no sound: only rings spreading quietly where it passed
function ripples(pen, scene) {
  for (let i = 1; i <= 5; i += 1) {
    const at = trailPoint(scene, i * 0.1);
    const radius = i * 3 + (scene.tick % 12) / 3;

    ring(pen, { ...at, radius, width: 1, color: i < 3 ? scene.art.body[4] : scene.art.body[2] });
  }
}

function back(pen, scene) {
  withFade(pen, scene, () => {
    sky(pen, scene);
    ripples(pen, scene);
  });
}

export const MOON_LOOK = { back };
