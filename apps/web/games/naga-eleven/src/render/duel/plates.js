import { DUEL_INK, DUEL_UI } from '../../art/duel/palette.js';
import { textOf, drawText, measureText } from '../text.js';
import { toCanvas } from './layout.js';

// a frame of gold, lit on its top and left edges
export function goldFrame(pen, { x, y, width, height }) {
  const [deep, shade, base, light] = DUEL_UI.panelEdge;

  pen.rect([x - 2, y - 2, width + 4, height + 4], DUEL_INK);
  pen.rect([x - 1, y - 1, width + 2, height + 2], shade);
  pen.rect([x - 1, y - 1, width + 2, 1], light);
  pen.rect([x - 1, y - 1, 1, height + 2], base);
  pen.rect([x - 1, y + height, width + 2, 1], deep);
}

export function panel(pen, { x, y, width, height }) {
  const [deep, dark, mid] = DUEL_UI.panel;

  goldFrame(pen, { x, y, width, height });
  pen.rect([x, y, width, height], dark);
  pen.rect([x, y, width, 2], mid);
  pen.rect([x, y + height - 2, width, 2], deep);
}

// the name under a portrait, shrunk to the small face when it would run past its plate
export function namePlate(pen, { x, y, width, name, lang }) {
  const text = textOf(name, lang);
  const size = measureText(pen.context, text, { size: 16 }) > toCanvas(width) - 8 ? 8 : 16;

  panel(pen, { x, y, width, height: 9 });
  drawText(pen.context, text, {
    x: pen.origin.x + toCanvas(x + width / 2),
    y: pen.origin.y + toCanvas(y) + (size === 16 ? 6 : 10),
    color: DUEL_UI.text,
    shadow: DUEL_UI.shadow,
    align: 'center',
    size,
  });
}

export function spiritGauge(pen, { x, y, width, spirit, spiritMax }) {
  const share = spiritMax > 0 ? Math.min(1, spirit / spiritMax) : 0;
  const filled = Math.round((width - 2) * share);
  const [deep, shade, base, light] = DUEL_UI.spirit;

  pen.rect([x, y, width, 5], DUEL_INK);
  pen.rect([x + 1, y + 1, width - 2, 3], DUEL_UI.gaugeBack);
  pen.rect([x + 1, y + 1, filled, 3], shade);
  pen.rect([x + 1, y + 1, filled, 1], light);
  pen.rect([x + 1, y + 3, filled, 1], deep);

  for (
    let notch = x + 1 + Math.round((width - 2) / 10);
    notch < x + filled;
    notch += (width - 2) / 10
  ) {
    pen.rect([Math.round(notch), y + 1, 1, 3], base);
  }
}
