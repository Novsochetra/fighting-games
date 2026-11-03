import { CHARACTERS } from '../../../data/characters.js';
import { drawPortrait, PORTRAIT_SIZE } from '../../../render/portraits/index.js';

function contextOf(canvas) {
  try {
    return canvas.getContext('2d');
  } catch {
    return null;
  }
}

// drawn at the art's own size and shown bigger by the page, a whole pixel at a time; a canvas
// that cannot be drawn on (a test page) is left blank
export function paintPortrait(canvas, { character, age, mood = 'neutral' }) {
  if (!canvas) {
    return;
  }

  canvas.width = PORTRAIT_SIZE;
  canvas.height = PORTRAIT_SIZE;

  const context = contextOf(canvas);

  if (!context) {
    return;
  }

  context.imageSmoothingEnabled = false;
  context.clearRect(0, 0, PORTRAIT_SIZE, PORTRAIT_SIZE);
  drawPortrait(context, {
    character,
    age: age ?? CHARACTERS[character]?.ages[0] ?? 'adult',
    mood,
    x: 0,
    y: 0,
    scale: 1,
  });
}
