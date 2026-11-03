import { BAYON_FACE, EYE_ROW, EYES, OPEN_EYES } from '../../../art/duel/bayon-face.js';
import { drawGrid, gridSize } from '../grid.js';
import { band, ring } from '../shapes.js';
import { debris, holds, riseOf } from './barrier.js';
import { lookPalette, reliefPalette } from './relief.js';

const FACE = gridSize(BAYON_FACE);

const withEyes = (open) =>
  open ? BAYON_FACE.map((row, i) => (i === EYE_ROW ? OPEN_EYES : row)) : BAYON_FACE;

// where a face stands: its middle across, its foot, and how many art pixels make one of its own
export const faceBox = ({ x, bottom, size }) => ({
  left: Math.round(x - (FACE.width * size) / 2),
  top: Math.round(bottom - FACE.height * size),
  width: FACE.width * size,
  height: FACE.height * size,
});

export const eyesOf = (face, size) =>
  EYES.map((eye) => ({ x: face.left + (eye.x + 0.5) * size, y: face.top + (eye.y + 0.5) * size }));

// a Bayon face in sandstone, its eyes shut in thought or open and burning gold
export function drawBayonFace(pen, { x, bottom, size, open, palette }) {
  const face = faceBox({ x, bottom, size });

  drawGrid(pen, { rows: withEyes(open), palette, x: face.left, y: face.top, size });

  return face;
}

// the gaze of the open eyes falls on the ball in two beams of gold
export function gaze(pen, { eyes, target, art }) {
  for (const eye of eyes) {
    band(pen, { from: eye, to: target, width: 3, color: art.eye[0] });
    band(pen, { from: eye, to: target, width: 1, color: art.eye[1] });
    pen.rect([eye.x - 1, eye.y - 1, 3, 3], art.eye[2]);
  }
}

// three faces rise over the goal; as the shot comes their eyes open and read it, and holding it
// they flash, or broken they crack and fall
function guard(pen, scene) {
  const art = scene.guardArt;
  const palette = lookPalette(art);
  const open = scene.approach > 0.4 || scene.hit;
  const rise = riseOf(scene);
  const faces = [
    { x: 166, bottom: 60, size: 1 },
    { x: 246, bottom: 60, size: 1 },
    { x: 206, bottom: 70, size: 2 },
  ];

  if (!holds(scene)) {
    debris(pen, { scene, box: { x: 186, y: 16, width: 42, height: 54 }, colors: art.body });

    return;
  }

  pen.context.save();
  pen.context.globalAlpha *= rise;
  const boxes = faces.map((face) => drawBayonFace(pen, { ...face, open, palette }));

  pen.context.restore();

  if (open && !scene.hit && scene.approach > 0.55) {
    gaze(pen, { eyes: eyesOf(boxes[2], 2), target: scene.ball, art });
  }

  if (scene.hit && scene.sinceHit < 18) {
    eyesOf(boxes[2], 2).forEach((eye) =>
      ring(pen, { ...eye, radius: 3 + scene.sinceHit, width: 1, color: art.eye[2] }),
    );
  }
}

// the face carved into the band behind the name, its eyes opening as the name lands
function bandFigure(pen, cut) {
  drawBayonFace(pen, {
    x: cut.offset + (cut.side === 'defend' ? 86 : 170),
    bottom: cut.top + cut.height + 2,
    size: 3,
    open: cut.ticks > 12,
    palette: reliefPalette(cut.art),
  });
}

export const BAYON = { guard, band: bandFigure };
