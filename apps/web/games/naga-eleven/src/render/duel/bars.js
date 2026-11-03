import { DUEL_UI } from '../../art/duel/palette.js';
import { drawText } from '../text.js';
import { ART, BAR, toCanvas } from './layout.js';

// a little diamond along the bars' gold edge every so often, like a carved border
function edge(pen, y) {
  const [deep, mid, light] = DUEL_UI.barEdge;

  pen.rect([0, y, ART.width, 1], mid);

  for (let x = 8; x < ART.width; x += 16) {
    pen.rect([x - 1, y - 1, 3, 3], deep);
    pen.dot(x, y - 1, light);
    pen.dot(x, y, light);
  }
}

// the black bars of a film slide in from the top and the bottom; `amount` is how far, 0 to 1
export function drawBars(pen, amount) {
  const height = Math.round(BAR * amount);

  if (height <= 0) {
    return;
  }

  pen.rect([0, 0, ART.width, height], DUEL_UI.bar);
  pen.rect([0, ART.height - height, ART.width, height], DUEL_UI.bar);
  edge(pen, height - 1);
  edge(pen, ART.height - height);
}

export function drawCaption(context, { text, bottom = false, color = DUEL_UI.gold }) {
  const y = bottom ? toCanvas(ART.height - BAR) + 13 : 11;

  drawText(context, text, {
    x: toCanvas(ART.width / 2),
    y,
    color,
    shadow: DUEL_UI.shadow,
    align: 'center',
    size: 16,
  });
}
