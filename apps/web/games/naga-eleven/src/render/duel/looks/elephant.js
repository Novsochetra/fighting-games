import { drawParts } from '../parts.js';
import { GROUND } from '../paths.js';
import { clippedPen } from '../clip.js';
import { INNER, ART } from '../layout.js';
import { debris, dust, holds, riseOf } from './barrier.js';
import { joint, limbParts, oval, placer, poly } from './place.js';

const limb = (point, through, widths, color) => limbParts(point, { through, widths, color });

const lit = (point, through, widths, color) =>
  limbParts(point, { through, widths, color, ink: false });

// the elephant in its own units: x toward the way it faces, y down from its hind feet; the far
// legs are a shade darker than the near ones
function hide(point, ramp) {
  return [
    ...limb(point, '-15,-27 -20,-16', [2.5], ramp[1]),
    ...limb(point, '-12,0 -10,-24', [10], ramp[1]),
    ...limb(point, '6,-40 18,-38 21,-27', [8, 7], ramp[1]),
    oval(point, { at: [0, -36], radius: [22, 14], turn: -0.8, color: ramp[2] }),
    ...limb(point, '-3,0 -2,-25', [11], ramp[2]),
    joint(point, { at: [-3, -1], radius: 5.5, color: ramp[2] }),
    ...limb(point, '9,-44 22,-44 26,-33', [9, 8], ramp[2]),
    joint(point, { at: [26, -33], radius: 4, color: ramp[2] }),
  ];
}

function head(point, ramp) {
  return [
    joint(point, { at: [16, -60], radius: 12.5, color: ramp[2] }),
    ...limb(point, '24,-60 31,-67 32,-78 28,-87 21,-89', [10, 8, 6, 4], ramp[2]),
    poly(point, '21,-53 33,-56 39,-64 31,-59 22,-50', ramp[4]),
    oval(point, { at: [7, -56], radius: [9, 13], turn: 0.3, color: ramp[1] }),
    oval(point, { at: [6, -57], radius: [6, 9.5], turn: 0.3, color: ramp[2], ink: false }),
    oval(point, { at: [5, -59], radius: [3, 5], turn: 0.3, color: ramp[3], ink: false }),
  ];
}

// a crimson caparison over his back, bordered and studded in gold, and a gold cap on his brow
function caparison(point, art) {
  const [deep, dark, mid, bright] = art.accent;
  const gold = art.eye[1];

  return [
    poly(point, '-15,-38 -4,-53 9,-57 15,-44 3,-24 -14,-26', deep),
    poly(point, '-13,-38 -4,-51 8,-55 13,-44 2,-27 -12,-28', dark, false),
    poly(point, '-11,-38 -4,-48 7,-52 10,-44 1,-30 -10,-31', mid, false),
    poly(point, '-14,-28 3,-26 2,-21 -13,-23', gold),
    poly(point, '-6,-44 -3,-48 0,-44 -3,-40', bright, false),
    poly(point, '2,-42 5,-46 8,-42 5,-38', bright, false),
    poly(point, '-3,-35 0,-39 3,-35 0,-31', gold, false),
    poly(point, '11,-68 22,-72 26,-64 16,-61', deep),
    poly(point, '12,-68 21,-71 24,-65 16,-62', gold, false),
  ];
}

// the light from the top left along his crown, back and trunk
function shine(point, ramp) {
  return [
    oval(point, { at: [-5, -45], radius: [10, 3], turn: -0.8, color: ramp[3], ink: false }),
    oval(point, { at: [12, -66], radius: [6, 3], turn: -0.4, color: ramp[3], ink: false }),
    ...lit(point, '29,-67 30,-77 27,-85', [2, 1.5], ramp[3]),
    ...lit(point, '-5,-2 -4,-22', [2], ramp[3]),
  ];
}

export function elephantParts({ x, y, facing, size, art }) {
  const point = placer({ x, y, facing, size });
  const [eyeX, eyeY] = point(20, -62);

  return [
    ...hide(point, art.body),
    ...head(point, art.body),
    ...caparison(point, art),
    ...shine(point, art.body),
    { kind: 'disc', x: eyeX, y: eyeY, radius: 1.2, color: art.body[0], ink: false },
    { kind: 'disc', x: eyeX - 0.6, y: eyeY - 0.6, radius: 0.5, color: art.eye[1], ink: false },
  ];
}

// a war elephant rears up out of the ground behind the defender, trunk raised; broken, it falls
// back into dust
function behind(pen, scene) {
  const art = scene.guardArt;
  const x = scene.impact.x + 34;
  const sink = Math.round((1 - riseOf(scene)) * 70);

  if (!holds(scene)) {
    debris(pen, {
      scene,
      box: { x: x - 30, y: GROUND - 80, width: 50, height: 80 },
      colors: art.body,
    });

    return;
  }

  const above = clippedPen(pen, {
    x: 0,
    y: INNER.top,
    width: ART.width,
    height: GROUND - INNER.top,
  });

  drawParts(above, elephantParts({ x, y: GROUND + sink, facing: -1, size: 1.1, art }));
  dust(pen, { scene, x: x - 26, width: 44, color: art.body[3] });
}

function bandFigure(pen, cut) {
  const x = cut.offset + (cut.side === 'defend' ? 120 : 210);

  drawParts(
    pen,
    elephantParts({ x, y: cut.top + cut.height + 20, facing: -1, size: 1.2, art: cut.relief }),
  );
}

export const ELEPHANT = { behind, band: bandFigure };
