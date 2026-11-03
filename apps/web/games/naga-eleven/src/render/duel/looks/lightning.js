import { DUEL_UI } from '../../../art/duel/palette.js';
import { hash } from '../hash.js';
import { INNER } from '../layout.js';
import { KICKER } from '../paths.js';
import { scatter, withFade } from './fade.js';
import { drawBolt } from './bolt.js';
import { headAt } from './naga.js';

const THROW_TICKS = 22;

// Chrey Lightning: a white bolt falls from Dara's hands, far back, to Sochetra's boot, and the
// ball flies on crackling with it
function back(pen, scene) {
  const ball = headAt(scene);

  withFade(pen, scene, () => {
    if (scene.t < THROW_TICKS) {
      drawBolt(pen, {
        from: { x: -4, y: INNER.top + 4 },
        to: { x: KICKER.x + 8, y: KICKER.y - 4 },
        art: scene.art,
        width: 3,
        seed: 1,
        tick: scene.tick,
        forks: 3,
      });
    }

    drawBolt(pen, {
      from: scene.trailPoint(0.32),
      to: ball,
      art: scene.art,
      width: 2,
      seed: 2,
      tick: scene.tick,
    });
    sparks(pen, scene, ball);
  });
  scatter(pen, {
    scene,
    points: [ball, scene.trailPoint(0.2)],
    colors: [scene.art.body[4], scene.art.accent[2]],
  });
}

function sparks(pen, scene, ball) {
  for (let i = 0; i < 8; i += 1) {
    if (hash(i, Math.floor(scene.tick / 2), 171) < 0.5) {
      const angle = hash(i, 172) * Math.PI * 2;

      pen.rect(
        [ball.x + Math.cos(angle) * 8, ball.y + Math.sin(angle) * 8, 2, 2],
        i % 2 ? scene.art.accent[2] : DUEL_UI.white,
      );
    }
  }
}

// a bolt down the band, from the far side to the striker
function bandFigure(pen, cut) {
  const near = cut.side === 'defend' ? 200 : 60;
  const far = cut.side === 'defend' ? 20 : 240;

  drawBolt(pen, {
    from: { x: cut.offset + far, y: cut.top - 2 },
    to: { x: cut.offset + near, y: cut.top + cut.height + 2 },
    art: {
      ...cut.art,
      body: [cut.art.body[0], ...cut.relief.body.slice(1, 3), cut.art.body[2], cut.art.body[3]],
    },
    width: 3,
    seed: 3,
    tick: cut.tick,
    forks: 3,
  });
}

export const LIGHTNING = { back, band: bandFigure };
