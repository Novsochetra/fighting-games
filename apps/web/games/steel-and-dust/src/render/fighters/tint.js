// a solid-color copy of a sheet, for flashes, glows and afterimages; cached per sheet and color
export function tintedImage(cache, { image, key, color, createCanvas }) {
  const cacheKey = key + color;
  if (!cache[cacheKey]) {
    const canvas = createCanvas(image.width, image.height);
    const context = canvas.getContext('2d');
    context.drawImage(image, 0, 0);
    context.globalCompositeOperation = 'source-in';
    context.fillStyle = color;
    context.fillRect(0, 0, canvas.width, canvas.height);
    cache[cacheKey] = canvas;
  }
  return cache[cacheKey];
}
