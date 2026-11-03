import { LOOK_ART } from '../../../art/duel/looks.js';
import { glints, scatter, withFade } from './fade.js';
import { GARUDA } from './garuda.js';
import { headAt } from './naga.js';
import { drawSerpentBody, drawSerpentHead, slither } from './serpent.js';
import { drawWindAbout } from './wind.js';

// the Naga keeps its gold crest; the white of Hanuman's wind is its fins
const crested = (art) => ({ ...art, accent: LOOK_ART.naga.accent });

// the Flying Naga: Sochetra leaps as Hanuman did and the Naga rises with him, borne up on the
// white wind wound about its body
function front(pen, scene) {
  const points = slither(scene, { count: 24, spacing: 0.032, sway: 10 });

  withFade(pen, scene, () => {
    drawWindAbout(pen, { points, art: scene.art, tick: scene.tick });
    drawSerpentBody(pen, {
      points,
      art: scene.art,
      thickness: 1.6,
      ball: headAt(scene),
      size: 1.8,
    });
    drawSerpentHead(pen, { points, art: crested(scene.art), ball: headAt(scene), size: 1.8 });
    glints(pen, { points, color: scene.art.accent[3], tick: scene.tick });
  });
  scatter(pen, { scene, points, colors: [scene.art.accent[3], scene.art.body[4]] });
}

// the wind blowing through the band, and the Naga's coils in it
function bandFigure(pen, cut) {
  const points = Array.from({ length: 18 }, (_, i) => ({
    x: cut.offset + (cut.side === 'defend' ? 10 : 90) + i * 9,
    y: cut.top + cut.height / 2 + Math.round(Math.sin(i * 0.6 + cut.tick / 7) * 14),
  }));

  drawSerpentBody(pen, { points, art: cut.relief, thickness: 1.4 });
  drawWindAbout(pen, {
    points,
    art: { ...cut.art, accent: cut.relief.accent },
    tick: cut.tick,
    every: 2,
    size: 1.4,
  });
}

export const FLYING_NAGA = { front, attacker: GARUDA.attacker, band: bandFigure };
