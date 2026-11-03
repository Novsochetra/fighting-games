import { LOOK_ART } from '../../../art/duel/looks.js';
import { DUEL_UI } from '../../../art/duel/palette.js';
import { drawFocusLines } from '../focus-lines.js';
import { ring } from '../shapes.js';
import { glints, scatter, withFade } from './fade.js';
import { headAt } from './naga.js';
import { drawNagaHead, jawsOffset } from './naga-head.js';
import { farther, levelled } from './naga-pose.js';
import { drawSerpentBody, slither } from './serpent.js';

// the crest stands like the naga on the causeways of Angkor: seven heads in an arc, the
// middle one furthest forward with the ball in its jaws, all looking at the goal; the outer ones
// further back and a step darker
// its faces gold, their hoods jade and rimmed in gold, as the great Naga's on the title are
export const titled = (art) => ({ ...art, accent: LOOK_ART.naga.accent, hood: art.accent });

const FAN = [-3, 3, -2, 2, -1, 1, 0].map((step) => ({
  step,
  size: [1.55, 1.15, 0.95, 0.8][Math.abs(step)],
  far: Math.abs(step) >= 2,
}));

function crest(pen, scene, { at, angle }) {
  const lean = levelled(angle);
  const jaws = jawsOffset({ size: FAN.at(-1).size, angle: lean });
  const root = { x: at.x - jaws.x - 30, y: at.y - jaws.y + 4 };

  for (const head of FAN) {
    const place = { x: root.x + 30 - Math.abs(head.step) * 9, y: root.y - 2 + head.step * 14 };
    const neck = [0.15, 0.4, 0.65].map((share) => ({
      x: root.x + (place.x - root.x) * share,
      y: root.y + (place.y - root.y) * share,
    }));
    const tilt = head.step === 0 ? lean : head.step * 0.14;
    const depth = head.far ? farther : (art) => art;

    drawSerpentBody(pen, { points: neck, art: depth(scene.art), thickness: 1.2 + head.size * 0.6 });
    drawNagaHead(pen, {
      ...place,
      size: head.size,
      angle: tilt,
      art: depth(titled(scene.art)),
      far: head.far,
    });
  }
}

function front(pen, scene) {
  const points = slither(scene, { count: 26, spacing: 0.03, sway: 6 });
  const at = headAt(scene);
  const last = points.at(-1);
  const angle = Math.atan2(at.y - last.y, at.x - last.x);

  withFade(pen, scene, () => {
    drawFocusLines(pen, {
      centre: at,
      inner: 30,
      color: scene.art.body[3],
      tick: scene.tick,
      strength: 0.5,
    });
    ring(pen, {
      ...at,
      radius: 40 + Math.sin(scene.tick / 4) * 2,
      width: 2,
      color: scene.art.body[4],
    });
    drawSerpentBody(pen, { points, art: scene.art, thickness: 2.3 });
    crest(pen, scene, { at, angle });
    glints(pen, { points, color: DUEL_UI.white, tick: scene.tick });
  });
  scatter(pen, { scene, points, colors: [scene.art.body[4], scene.art.accent[3], DUEL_UI.white] });
}

export const SEVEN_NAGA = { front };
