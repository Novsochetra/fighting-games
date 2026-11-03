import { drawBayonFace, eyesOf, gaze } from '../../duel/looks/bayon.js';
import { lookPalette } from '../../duel/looks/relief.js';
import { debris } from '../../duel/looks/barrier.js';
import { ring } from '../../duel/shapes.js';
import { FRAME } from '../view.js';

const FACES = [
  { x: 12, bottom: FRAME.line - 18, size: 1 },
  { x: 244, bottom: FRAME.line - 18, size: 1 },
  { x: 128, bottom: FRAME.bar + 4, size: 1 },
];

// Bayon Eyes: three faces of the Bayon stand round the goal; their eyes open as the shot comes
// and fall on the ball, and flash as he holds it, or the stone cracks if it goes in
export function bayonBack(pen, { art, flight, since, holds, ball }) {
  const open = flight > 0.35;

  if (!holds && since > 0) {
    debris(pen, {
      scene: { sinceHit: since },
      box: { x: 100, y: FRAME.bar - 28, width: 56, height: 28 },
      colors: art.body,
    });

    return;
  }

  pen.context.save();
  pen.context.globalAlpha *= Math.min(1, flight * 3 + (since > 0 ? 1 : 0));
  const boxes = FACES.map((face) =>
    drawBayonFace(pen, { ...face, open, palette: lookPalette(art) }),
  );

  pen.context.restore();

  const eyes = boxes.flatMap((box) => eyesOf(box, 1));

  if (open && since < 0 && flight > 0.5 && ball) {
    gaze(pen, { eyes, target: ball, art });
  }

  if (since >= 0 && since < 18) {
    eyes.forEach((eye) => ring(pen, { ...eye, radius: 2 + since, width: 1, color: art.eye[2] }));
  }
}
