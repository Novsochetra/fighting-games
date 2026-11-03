const packed = (hex) => parseInt(hex.slice(1, 7), 16);

// a source sheet read once into a mask: 1 where a pixel is painted in one of the sheets' own shirt
// shades, which is where a number can be printed
export function shirtMaskOf(image, { createCanvas, shirt }) {
  const canvas = createCanvas(image.width, image.height);
  const context = canvas.getContext('2d', { willReadFrequently: true });

  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0);

  const { data } = context.getImageData(0, 0, image.width, image.height);
  const shades = new Set(shirt.map(packed));
  const bits = new Uint8Array(image.width * image.height);

  for (let i = 0; i < bits.length; i += 1) {
    const at = i * 4;
    const colour = (data[at] << 16) | (data[at + 1] << 8) | data[at + 2];

    bits[i] = data[at + 3] > 0 && shades.has(colour) ? 1 : 0;
  }

  return { width: image.width, bits };
}

// one frame of the mask as it is drawn: a way drawn as another's mirror image reads it mirrored
export function cellOf(mask, { left, top, width, height, mirror }) {
  const inside = (x, y) => x >= 0 && y >= 0 && x < width && y < height;

  return {
    width,
    height,
    isShirt: (x, y) =>
      inside(x, y) && mask.bits[(top + y) * mask.width + left + (mirror ? width - 1 - x : x)] === 1,
  };
}
