import { COLORS } from '../../art/colors.js';
import { GLYPHS } from './glyphs.js';

export function textWidth(text, scale) {
  return text.length * 4 * scale - scale;
}

function drawGlyph(context, { glyph, index, x, y, scale }) {
  for (let row = 0; row < 5; row++) {
    const bits = glyph[row];
    for (let column = 0; bits && column < 3; column++) {
      if (bits & (4 >> column)) {
        context.fillRect(x + (index * 4 + column) * scale, y + row * scale, scale, scale);
      }
    }
  }
}

function drawGlyphs(context, { text, x, y, color, scale }) {
  context.fillStyle = color;
  for (let index = 0; index < text.length; index++) {
    const glyph = GLYPHS[text[index]] || GLYPHS['?'];
    drawGlyph(context, { glyph, index, x, y, scale });
  }
}

function alignedX(x, width, align) {
  if (align === 'center') {
    return x - Math.floor(width / 2);
  }
  return align === 'right' ? x - width : x;
}

// the 3x5 bitmap font; shadow null draws no shadow, undefined draws the default dark one
export function drawText(painter, value, { x, y, color, scale = 1, align, shadow }) {
  const text = String(value).toUpperCase();
  const left = Math.round(alignedX(x, textWidth(text, scale), align));
  const top = Math.round(y);
  if (shadow !== null) {
    drawGlyphs(painter.context, {
      text,
      x: left + scale,
      y: top + scale,
      color: shadow || COLORS.outline,
      scale,
    });
  }
  drawGlyphs(painter.context, { text, x: left, y: top, color, scale });
}
