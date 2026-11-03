import { describe, expect, it } from 'vitest';

import { LOOK_ART } from '../../../../../src/art/duel/looks.js';
import { drawNagaHead } from '../../../../../src/render/duel/looks/naga-head.js';
import { createPen } from '../../../../../src/render/duel/pen.js';
import { drawHeadStamp } from '../../../../../src/render/save-cam/trails/head-stamps.js';
import { drawOnSheet } from '../../../../../src/render/save-cam/trails/sheet.js';
import { createPixelCanvas } from '../../../../support/pixel-canvas.js';

const MOVE = LOOK_ART['seven-naga'];

const HEADS = [
  { x: 60, y: 40, size: 1.2, facing: 1, angle: -0.3 },
  { x: 140, y: 38, size: 1.2, facing: 1, angle: -0.3 },
  { x: 200, y: 90, size: 0.9, facing: -1, angle: 0.12 },
  { x: 2, y: 3, size: 2, facing: 1, angle: 0 },
];

const differing = (first, second) => first.filter((value, i) => value !== second[i]).length;

// one canvas pixel an art pixel
function drawn(draw) {
  const canvas = createPixelCanvas(256, 144);
  const pen = createPen(canvas.getContext('2d'), { unit: 1 });

  pen.rect([0, 0, 256, 144], '#0b1028');
  draw(pen);

  return canvas.data;
}

const each = (draw) => (pen) => HEADS.forEach((head) => draw(pen, { ...head, art: MOVE }));

describe('a head behind the front one, stamped', () => {
  it('lands just as the head drawn where it stands, a pair and one at the view’s edge too', () => {
    const straight = drawn(each(drawNagaHead));
    const stamped = drawn((pen) =>
      drawOnSheet(
        pen,
        each((sheet, head) => drawHeadStamp(sheet, head, MOVE)),
      ),
    );

    expect(differing(stamped, straight)).toBe(0);
  });

  it('stamps the same again from what it kept', () => {
    const stamp = (pen) =>
      drawOnSheet(
        pen,
        each((sheet, head) => drawHeadStamp(sheet, head, MOVE)),
      );

    expect(differing(drawn(stamp), drawn(stamp))).toBe(0);
  });

  it('is drawn as it is on a pen that is not a sheet’s', () => {
    const drawnStraight = drawn(each(drawNagaHead));

    expect(
      differing(drawn(each((pen, head) => drawHeadStamp(pen, head, MOVE))), drawnStraight),
    ).toBe(0);
  });
});
