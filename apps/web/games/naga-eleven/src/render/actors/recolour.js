const ROLES = ['shirt', 'shorts', 'socks', 'trim', 'skin', 'hair'];

const packed = (hex) => parseInt(hex.slice(1, 7), 16);

// a source ramp's shade goes to the target's shade at the same place along it, so a sprite drawn
// in four shirt shades can wear a kit of three
function shadeFor(source, target, i) {
  if (source.length === 1) {
    return target[Math.floor(target.length / 2)];
  }

  return target[Math.round((i * (target.length - 1)) / (source.length - 1))];
}

// keyed and valued as 0xrrggbb, so a pixel is looked up without making a string
export function colourMap(sourceKit, look) {
  const map = new Map();

  for (const role of ROLES) {
    const source = sourceKit[role];
    const target = look[role];

    source?.forEach((hex, i) => {
      if (target) {
        map.set(packed(hex), packed(shadeFor(source, target, i)));
      }
    });
  }

  return map;
}

// only pixels painted exactly in a source colour change; every other one stays as drawn
export function recolourPixels(data, map) {
  for (let at = 0; at < data.length; at += 4) {
    const colour = map.get((data[at] << 16) | (data[at + 1] << 8) | data[at + 2]);

    if (colour !== undefined && data[at + 3] > 0) {
      data[at] = colour >> 16;
      data[at + 1] = (colour >> 8) & 255;
      data[at + 2] = colour & 255;
    }
  }

  return data;
}

// the sheet's pixels are read on a canvas of their own, made to be read: the recoloured sheet is
// drawn every frame, and a browser keeps a canvas read back often off the graphics card
function pixelsOf(image, createCanvas) {
  const context = createCanvas(image.width, image.height).getContext('2d', {
    willReadFrequently: true,
  });

  context.imageSmoothingEnabled = false;
  context.drawImage(image, 0, 0);

  return context.getImageData(0, 0, image.width, image.height);
}

export function recolourImage(image, map, createCanvas) {
  const pixels = pixelsOf(image, createCanvas);
  const canvas = createCanvas(image.width, image.height);

  recolourPixels(pixels.data, map);
  canvas.getContext('2d').putImageData(pixels, 0, 0);

  return canvas;
}
