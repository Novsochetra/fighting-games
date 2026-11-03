import { STAMP, STAMP_CODES, stampCodes } from './number-stamp.js';

const channelsOf = (hex) => [1, 3, 5].map((at) => parseInt(hex.slice(at, at + 2), 16));

function paintVariant(image, { codes, mask, left, inks }) {
  for (let y = 0; y < STAMP.height; y += 1) {
    for (let x = 0; x < STAMP.width; x += 1) {
      const ink = inks[codes[y * STAMP.width + x]];

      if (ink && mask[y * STAMP.width + x]) {
        image.data.set([...ink, 255], (y * image.width + left + x) * 4);
      }
    }
  }
}

// one number in one kit's colours, painted once for every clip the frames need (a clip of the
// back or the chest), side by side
export function bakeNumberAtlas(createCanvas, { number, colours, variants }) {
  const canvas = createCanvas(Math.max(1, variants.length) * STAMP.width, STAMP.height);
  const context = canvas.getContext('2d');
  const image = context.createImageData(canvas.width, canvas.height);
  const codes = { back: stampCodes(number, 'back'), chest: stampCodes(number, 'chest') };
  const inks = {
    [STAMP_CODES.fill]: channelsOf(colours.fill),
    [STAMP_CODES.edge]: channelsOf(colours.edge),
  };

  variants.forEach(({ mask, side }, i) =>
    paintVariant(image, { codes: codes[side], mask, left: i * STAMP.width, inks }),
  );
  context.putImageData(image, 0, 0);

  return canvas;
}
