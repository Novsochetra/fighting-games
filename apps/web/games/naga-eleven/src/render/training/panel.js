import { CARD, KEYS } from '../../art/training/cards.js';
import { drawText, measureText, textOf } from '../text.js';
import { faded, paint } from './pixels.js';

// the cards' frame: a drop shadow, a dark fill, a two-pixel edge lit along its top
export function drawPanel(context, { x, y, width, height, alpha = 0.92 }) {
  faded(context, 0.6, () => paint(context, CARD.shadow, [x + 4, y + 4, width, height]));
  paint(context, CARD.edge, [x, y, width, height]);
  faded(context, alpha, () => paint(context, CARD.fill, [x + 2, y + 2, width - 4, height - 4]));
  paint(context, CARD.light, [x + 2, y, width - 4, 2]);
  paint(context, CARD.inner, [x + 4, y + 4, width - 8, 2]);
}

export function textWidth(context, text, size) {
  return measureText(context, text, { size });
}

export function say(context, words, { lang, ...style }) {
  drawText(context, textOf(words, lang), { shadow: CARD.shadow, size: 16, ...style });
}

// a key as the touch pad draws it: a coloured pill with its name on it
export function drawKey(context, { x, y, key, label }) {
  const colors = KEYS[key];
  const width = textWidth(context, label, 16) + 20;

  paint(context, colors.shade, [x, y + 2, width, 22]);
  paint(context, colors.face, [x, y, width, 22]);
  paint(context, CARD.text, [x + 2, y, width - 4, 2]);
  faded(context, 0.35, () => paint(context, CARD.text, [x + 2, y + 2, width - 4, 2]));
  drawText(context, label, {
    x: x + 10,
    y: y + 3,
    color: colors.ink ?? CARD.text,
    shadow: colors.ink ? null : colors.shade,
    size: 16,
  });

  return width;
}

export function drawButton(context, { box, key, label, lang, ready }) {
  faded(context, ready ? 1 : 0.45, () => {
    paint(context, CARD.shadow, [box.x + 2, box.y + 2, box.width, box.height]);
    paint(context, CARD.edge, [box.x, box.y, box.width, box.height]);
    paint(context, CARD.inner, [box.x + 2, box.y + 2, box.width - 4, box.height - 4]);

    const keyWidth = drawKey(context, {
      x: box.x + 8,
      y: box.y + 7,
      key,
      label: key === 'shoot' ? 'SHOOT' : 'PASS',
    });

    say(context, label, { lang, x: box.x + 18 + keyWidth, y: box.y + 10, color: CARD.text });
  });
}

export const inside = (box, point) =>
  point.x >= box.x &&
  point.x < box.x + box.width &&
  point.y >= box.y &&
  point.y < box.y + box.height;
