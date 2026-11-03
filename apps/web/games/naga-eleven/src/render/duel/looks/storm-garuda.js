import { LOOK_ART } from '../../../art/duel/looks.js';
import { ART, INNER } from '../layout.js';
import { drawBolt } from './bolt.js';
import { withFade } from './fade.js';
import { GARUDA } from './garuda.js';
import { headAt } from './naga.js';
import { drawStormCloud } from './storm.js';

// Garuda keeps his own gold beak and shoulders; the storm's violet and white are its own
const golden = (scene) => ({ ...scene, art: { ...scene.art, accent: LOOK_ART.garuda.accent } });

// Storm Garuda: the sky closes in cloud, and Garuda flies the ball in under it with lightning
// striking down round his wings
function back(pen, scene) {
  const ball = headAt(scene);
  const stormArt = { ...scene.art, body: [scene.art.accent[0], ...scene.art.accent] };

  withFade(pen, scene, () => {
    drawStormCloud(pen, {
      left: 0,
      width: ART.width,
      top: INNER.top - 6,
      art: scene.art,
      tick: scene.tick,
    });

    if (Math.floor(scene.tick / 6) % 3 !== 2) {
      drawBolt(pen, {
        from: { x: ball.x - 30, y: INNER.top + 8 },
        to: { x: ball.x - 8, y: ball.y - 10 },
        art: stormArt,
        seed: 4,
        tick: scene.tick,
      });
    }
  });
  GARUDA.back(pen, golden(scene));
}

function bandFigure(pen, cut) {
  drawStormCloud(pen, {
    left: 0,
    width: ART.width,
    top: cut.top - 6,
    art: { ...cut.art, accent: cut.relief.accent },
    tick: cut.tick,
    depth: 22,
  });
  drawBolt(pen, {
    from: { x: cut.offset + (cut.side === 'defend' ? 60 : 180), y: cut.top + 10 },
    to: { x: cut.offset + (cut.side === 'defend' ? 90 : 150), y: cut.top + cut.height },
    art: { ...cut.art, body: [cut.art.body[0], ...cut.relief.accent] },
    width: 2,
    seed: 5,
    tick: cut.tick,
  });
}

export const STORM_GARUDA = { back, attacker: GARUDA.attacker, band: bandFigure };
