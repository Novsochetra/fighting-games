import { CARD, KEYS } from '../../art/training/cards.js';
import { FLAG } from '../../art/training/ground.js';
import { AURA, FOCUS } from '../../art/training/temple.js';
import { drawBall } from './ball.js';
import { ART, oval, paint, ring } from './pixels.js';
import { drawCone } from './scenery/obstacles.js';

// the small pictures beside each how-to line, drawn on the art grid in a 12 x 12 box
const ICONS = {
  dpad: (context) => {
    paint(context, KEYS.arrows.shade, [4, 1, 4, 11]);
    paint(context, KEYS.arrows.shade, [0, 5, 12, 4]);
    paint(context, KEYS.arrows.face, [4, 0, 4, 11]);
    paint(context, KEYS.arrows.face, [0, 4, 12, 4]);
    paint(context, CARD.text, [5, 1, 2, 1]);
  },
  cone: (context) => drawCone(context, { x: 6, y: 12 }),
  sprint: (context) => {
    paint(context, KEYS.sprint.face, [5, 0, 4, 5]);
    paint(context, KEYS.sprint.face, [3, 5, 6, 2]);
    paint(context, KEYS.sprint.face, [3, 7, 4, 5]);
    paint(context, KEYS.sprint.shade, [6, 7, 1, 5]);
  },
  ball: (context) => drawBall(context, { x: 6, y: 6, radius: 4, travel: 3 }),
  target: (context) => {
    oval(context, FLAG.red, { x: 6, y: 6, radiusX: 6 });
    ring(context, FLAG.white, { x: 6, y: 6, radius: 4, width: 1 });
    oval(context, FLAG.white, { x: 6, y: 6, radiusX: 1 });
  },
  ring: (context) => {
    ring(context, FOCUS.mark, { x: 6, y: 6, radius: 5, width: 2 });
    paint(context, FOCUS.lotus, [5, 0, 3, 2]);
  },
  flame: (context) => {
    oval(context, AURA.deep, { x: 6, y: 8, radiusX: 4, radiusY: 4 });
    oval(context, AURA.mid, { x: 6, y: 7, radiusX: 3, radiusY: 4 });
    paint(context, AURA.mid, [5, 0, 2, 4]);
    oval(context, AURA.core, { x: 6, y: 9, radiusX: 1, radiusY: 2 });
  },
  beat: (context) => {
    ring(context, FOCUS.ringFar, { x: 6, y: 6, radius: 6, width: 1 });
    ring(context, FOCUS.ring, { x: 6, y: 6, radius: 3, width: 1 });
  },
};

export const HOW_TO_ICONS = {
  'cone-dribble': ['dpad', 'cone', 'sprint'],
  'target-shot': ['dpad', 'ball', 'target'],
  'spirit-focus': ['ring', 'flame', 'beat'],
};

export function drawIcon(context, { name, x, y }) {
  context.save();
  context.translate(Math.round(x), Math.round(y));
  context.scale(ART, ART);
  ICONS[name](context);
  context.restore();
}
