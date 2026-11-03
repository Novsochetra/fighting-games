import { easeOut, lerp } from '../hash.js';
import { drawParts } from '../parts.js';
import { GROUND, KEEPER } from '../paths.js';
import { holds } from './barrier.js';
import { limbParts, oval, placer, poly } from './place.js';

const limb = (point, through, widths, color) => limbParts(point, { through, widths, color });

const lit = (point, through, widths, color) =>
  limbParts(point, { through, widths, color, ink: false });

// a black panther at full stretch, in its own units from its chest: x forward, y down
function bodyParts(point, ramp) {
  return [
    ...limb(point, '-15,-2 -25,-7 -33,-5 -37,1', [3, 2.4, 1.8], ramp[1]),
    ...limb(point, '-10,3 -17,10 -27,12', [4, 3], ramp[0]),
    ...limb(point, '9,2 17,9 26,10', [3.6, 2.8], ramp[0]),
    oval(point, { at: [-1, 0], radius: [16, 6], turn: -0.05, color: ramp[1] }),
    oval(point, { at: [8, -1], radius: [7, 6.5], color: ramp[1] }),
    oval(point, { at: [-11, 0], radius: [7, 6], color: ramp[1] }),
    ...limb(point, '-12,3 -20,7 -29,6', [4.4, 3.2], ramp[1]),
    ...limb(point, '10,3 20,5 28,3', [4, 3], ramp[1]),
  ];
}

function headParts(point, art) {
  const ramp = art.body;

  return [
    poly(point, '13,-9 14,-13 17,-10', ramp[1]),
    poly(point, '17,-10 19,-13 20,-9', ramp[1]),
    oval(point, { at: [17, -5], radius: [5.5, 4.5], color: ramp[1] }),
    poly(point, '20,-7 26,-4 25,-2 20,-1', ramp[1]),
    poly(point, '21,-2 25,-2 23,0', art.eye[2], false),
    ...[3, 6, 9].map((down) =>
      poly(point, `28,${down - 2} 31,${down - 1} 28,${down}`, art.eye[2], false),
    ),
  ];
}

// the moonlight along its back, and its eyes of green fire
function lightParts(point, art) {
  const [eyeX, eyeY] = point(19, -6.5);

  return [
    ...lit(point, '-16,-5 -4,-6 8,-7 15,-9', [1.4, 1.4, 1.2], art.body[3]),
    ...lit(point, '-27,-7 -33,-5', [1], art.body[2]),
    { kind: 'disc', x: eyeX, y: eyeY, radius: 1.4, color: art.eye[1], ink: false },
    { kind: 'disc', x: eyeX, y: eyeY, radius: 0.6, color: art.eye[2], ink: false },
  ];
}

export function pantherParts({ x, y, facing = -1, size = 1, angle = 0, art }) {
  const point = placer({ x, y, facing, size, angle });

  return [
    ...bodyParts(point, art.body.slice(1)),
    ...headParts(point, { ...art, body: art.body.slice(1) }),
    ...lightParts(point, { ...art, body: art.body.slice(1).concat(art.eye[2]) }),
  ];
}

// Panther Dive: a panther of shadow springs from the keeper with him, paws out for the ball; a
// shot past it, it lands short in the grass and is gone
function guard(pen, scene) {
  const share = easeOut((scene.approach - 0.45) / 0.55);

  if (share <= 0) {
    return;
  }

  const target = holds(scene) ? scene.impact : { x: scene.impact.x - 18, y: GROUND - 10 };
  const fade = scene.hit ? Math.max(0, 1 - scene.sinceHit / 20) : 1;

  pen.context.save();
  pen.context.globalAlpha *= Math.min(1, share * 2) * fade;
  drawParts(
    pen,
    pantherParts({
      x: lerp(KEEPER.x + 10, target.x + 30, share),
      y: lerp(GROUND - 20, target.y + 4, share),
      angle: lerp(0, -0.35, share),
      art: scene.guardArt,
    }),
  );
  pen.context.restore();
}

function bandFigure(pen, cut) {
  const x = cut.offset + (cut.side === 'defend' ? 100 : 170);

  drawParts(
    pen,
    pantherParts({ x, y: cut.top + cut.height / 2 + 6, size: 2.3, angle: -0.15, art: cut.relief }),
  );
}

export const PANTHER = { guard, band: bandFigure };
