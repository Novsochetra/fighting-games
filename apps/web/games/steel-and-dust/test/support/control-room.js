import { gapBetween, outlineOf } from '../../../../packages/touch-pad/src/pad-room.js';

export function outlinesOn(items, [width, height], scale) {
  const layer = { left: 0, top: 0, width, height };

  return items.map((item) => outlineOf(item, layer, scale));
}

export function tightestGap(outlines) {
  return Math.min(
    ...outlines.flatMap((outline, i) =>
      outlines.slice(i + 1).map((other) => gapBetween(outline, other)),
    ),
  );
}

export const PHONES = {
  landscape: [
    [667, 375],
    [740, 360],
    [844, 390],
    [932, 430],
  ],
  portrait: [
    [360, 740],
    [375, 667],
    [390, 844],
    [430, 932],
  ],
};
