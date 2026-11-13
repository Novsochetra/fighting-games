import { polygon } from '../../../../../../src/render/duel/shapes.js';
import { SHOT_ART } from '../../colors.js';
import { GROUND, KICK_SPOT } from '../../world.js';
import { dithered, dotLine, ellipseOutline } from './kit.js';

const SEAL = { x: KICK_SPOT.x + 5, y: GROUND - 1, radius: 46, flat: 0.21 };

const TURN = Math.PI * 2;

const FLAMES = 18;

const PETALS = 8;

const [, deepGold, gold, paleGold] = SHOT_ART.gold;

const onSeal = (angle, reach) => ({
  x: SEAL.x + Math.cos(angle) * reach * SEAL.radius,
  y: SEAL.y + Math.sin(angle) * reach * SEAL.radius * SEAL.flat,
});

const wrap = (angle) => ((angle % TURN) + TURN) % TURN;

function lightOf(angle, { lit }) {
  const written = wrap(angle + Math.PI / 2) / TURN;

  if (written > lit) {
    return 0;
  }

  return lit < 1 && lit - written < 0.04 ? 2 : 1;
}

const lightTone = (light, color) => (light === 2 ? SHOT_ART.white : color);

function sealRing(pen, { reach, near, far, glyph, dash = 0 }) {
  ellipseOutline(pen, {
    x: SEAL.x,
    y: SEAL.y,
    radiusX: reach * SEAL.radius,
    radiusY: reach * SEAL.radius * SEAL.flat,
    pick: (angle) => {
      const light = lightOf(angle, glyph);
      const gap = dash && Math.floor(wrap(angle - glyph.spin) * dash) % 2 === 1;

      if (!light || gap) {
        return null;
      }

      return lightTone(light, Math.sin(angle) > 0 ? near : far);
    },
  });
}

function flame(pen, { angle, glyph, bright }) {
  const light = lightOf(angle, glyph);

  if (!light) {
    return;
  }

  const base = onSeal(angle, 0.8);
  const bend = onSeal(angle + 0.035, 0.87);
  const tip = onSeal(angle + 0.1, 0.9);
  const bead = onSeal(angle + Math.PI / FLAMES, 0.86);
  const [tipColor, baseColor] = bright ? [SHOT_ART.white, paleGold] : [paleGold, gold];

  dotLine(pen, { from: base, to: bend, color: lightTone(light, baseColor) });
  dotLine(pen, { from: bend, to: tip, color: lightTone(light, tipColor) });
  pen.dot(Math.round(bead.x), Math.round(bead.y), lightTone(light, SHOT_ART.emerald[4]));
}

function petalShape(angle, { from, to, width }) {
  const side = (sign) =>
    Array.from({ length: 7 }, (_, step) => {
      const along = sign > 0 ? step / 6 : 1 - step / 6;
      const spread = sign * width * Math.sin(Math.PI * along ** 0.8);
      const at = onSeal(angle + spread, from + (to - from) * along);

      return [at.x, at.y];
    });

  return [...side(1), ...side(-1)];
}

function petal(pen, { angle, glyph }) {
  const light = lightOf(angle, glyph);

  if (!light) {
    return;
  }

  const front = Math.sin(angle) > 0;
  const tip = onSeal(angle, 0.72);
  const outer = SHOT_ART.emerald[front ? 3 : 2];
  const inner = lightTone(light, SHOT_ART.emerald[front ? 4 : 3]);

  polygon(pen, petalShape(angle, { from: 0.2, to: 0.7, width: 0.24 }), outer);
  polygon(pen, petalShape(angle, { from: 0.24, to: 0.58, width: 0.12 }), inner);
  pen.dot(Math.round(tip.x), Math.round(tip.y), lightTone(light, paleGold));
}

const fadingPen = (pen, fade) => ({
  ...pen,
  dot: (x, y, color) => dithered(x, y, fade) && pen.dot(x, y, color),
  rect: (box, color) => dithered(box[0], box[1], fade) && pen.rect(box, color),
});

export function drawGlyphCircle(basePen, glyph) {
  if (glyph.lit <= 0 || glyph.fade <= 0) {
    return;
  }

  const pen = glyph.fade < 1 ? fadingPen(basePen, glyph.fade) : basePen;

  for (let i = 0; i < PETALS; i += 1) {
    petal(pen, { angle: (i / PETALS) * TURN - glyph.spin * 0.7, glyph });
  }

  sealRing(pen, { reach: 1, near: paleGold, far: gold, glyph });
  sealRing(pen, {
    reach: 0.94,
    near: SHOT_ART.emerald[4],
    far: SHOT_ART.emerald[3],
    glyph,
    dash: 9,
  });
  sealRing(pen, { reach: 0.76, near: gold, far: deepGold, glyph });
  sealRing(pen, { reach: 0.16, near: paleGold, far: gold, glyph });

  for (let i = 0; i < FLAMES; i += 1) {
    const angle = (i / FLAMES) * TURN + glyph.spin;

    const bright = glyph.flare || ((i + glyph.beat) % 5 === 0 && glyph.lit >= 1);

    flame(pen, { angle, glyph, bright });
  }
}

export const SEAL_MIDDLE = { x: SEAL.x, y: SEAL.y };
