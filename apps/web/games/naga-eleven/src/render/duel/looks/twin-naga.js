import { LOOK_ART } from '../../../art/duel/looks.js';
import { drawFigure } from '../figure.js';
import { scatter, withFade } from './fade.js';
import { headAt } from './naga.js';
import { drawSerpentBody, drawSerpentHead, slither } from './serpent.js';

// the second naga is Rithy's: sapphire where Sochetra's is jade, crested in the same gold
const partnerArt = (art) => ({ ...art, body: art.accent, accent: LOOK_ART.naga.accent });

const heroArt = (art) => ({ ...art, accent: LOOK_ART.naga.accent });

// two serpents braided round each other, their jaws closing on the ball from above and below
function front(pen, scene) {
  const at = headAt(scene);
  const pair = [
    { art: partnerArt(scene.art), phase: Math.PI, ball: { x: at.x - 4, y: at.y + 12 } },
    { art: heroArt(scene.art), phase: 0, ball: { x: at.x - 4, y: at.y - 11 } },
  ].map((one) => ({
    ...one,
    points: slither(scene, { count: 22, spacing: 0.034, sway: 12, phase: one.phase }),
  }));

  withFade(pen, scene, () => {
    pair.forEach((one) => drawSerpentBody(pen, { ...one, thickness: 1.4, size: 1.45 }));
    pair.forEach((one) => drawSerpentHead(pen, { ...one, size: 1.45 }));
  });
  scatter(pen, {
    scene,
    points: pair.flatMap((one) => one.points),
    colors: [scene.art.body[4], scene.art.accent[3]],
  });
}

// Rithy strikes it with him, a step behind
function figures(pen, scene, attacker) {
  drawFigure(pen, { ...attacker, x: attacker.x - 12, y: attacker.y - 3, rim: scene.art.accent[3] });
}

export const TWIN_NAGA = { front, figures };
