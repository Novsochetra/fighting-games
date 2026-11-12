import { PIGGY } from '../art/palette.js';
import { piggyRows } from '../art/piggy.js';
import { drawSprite } from './sprite.js';

const HEADROOM = 3;

// the canvas is a pixel wider and a hop taller than the pig
export function paintPiggy(context, { mood, lift }) {
  context.clearRect(0, 0, context.canvas.width, context.canvas.height);
  drawSprite(context, piggyRows(mood), PIGGY, { x: 1, y: HEADROOM - lift });
}
