import { drawText, measureText, wrapText } from '../text.js';
import { textStyleOf } from './layout.js';

// the whole line is wrapped before it is typed, so a word never jumps to the next row half
// written; each row then shows as much of itself as has been typed
export function revealRows(rows, text, shownLength) {
  let cursor = 0;

  return rows.map((row) => {
    const found = text.indexOf(row, cursor);
    const start = found < 0 ? cursor : found;

    cursor = start + row.length;

    return row.slice(0, Math.max(0, shownLength - start));
  });
}

export function firstVisibleRow(shown, rowsThatFit) {
  const typedRows = shown.filter(Boolean).length;

  return Math.max(0, typedRows - rowsThatFit);
}

export function layoutLine(context, line, area) {
  const style = textStyleOf(line.text);
  const rows = wrapText(context, line.text, { maxWidth: area.width, size: style.size });
  const shown = revealRows(rows, line.text, line.shown.length);
  const fit = Math.max(1, Math.floor(area.height / style.lineHeight));
  const first = firstVisibleRow(shown, fit);

  return {
    style,
    rows: rows.slice(first, first + fit),
    shown: shown.slice(first, first + fit),
  };
}

// a centred row starts where its whole width puts it, so it types from the left and never slides
function rowLeft(context, { row, area, style, center }) {
  if (!center) {
    return area.x;
  }

  return Math.round(area.x + (area.width - measureText(context, row, style)) / 2);
}

export function drawLineText(context, line, { area, color, shadow, center = false }) {
  const { style, rows, shown } = layoutLine(context, line, area);
  const blockHeight = rows.length * style.lineHeight;
  const top = center ? area.y + Math.round((area.height - blockHeight) / 2) : area.y;

  rows.forEach((row, i) => {
    if (shown[i]) {
      drawText(context, shown[i], {
        x: rowLeft(context, { row, area, style, center }),
        y: top + i * style.lineHeight,
        color,
        shadow,
        size: style.size,
      });
    }
  });

  return { top, height: blockHeight, rows: rows.length };
}
