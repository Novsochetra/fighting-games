// The launch screen takes the colors of the icon's background, sampled from its corners past the
// artwork, so each game opens into its own colors.
export const CORNER_SHARE = 0.2;

const CORNERS = [
  [0, 0],
  [1, 0],
  [0, 1],
  [1, 1],
];

function isDrawable(art) {
  return art?.tagName === 'IMG' && art.complete && art.naturalWidth > 0;
}

export function cornerSourceRect({ width, height }, [column, row]) {
  const cornerWidth = width * CORNER_SHARE;
  const cornerHeight = height * CORNER_SHARE;
  return [column * (width - cornerWidth), row * (height - cornerHeight), cornerWidth, cornerHeight];
}

const channelMean = (pixels, first, second, channel) =>
  Math.round((pixels[first * 4 + channel] + pixels[second * 4 + channel]) / 2);

function meanColor(pixels, first, second) {
  const [red, green, blue] = [0, 1, 2].map((channel) =>
    channelMean(pixels, first, second, channel),
  );
  return `rgb(${red} ${green} ${blue})`;
}

// pixels holds the four corners as RGBA, in the order top left, top right, bottom left, bottom right
export function splashColors(pixels) {
  return { top: meanColor(pixels, 0, 1), bottom: meanColor(pixels, 2, 3) };
}

export function sampleSplash(document, art) {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 2;
  const context = canvas.getContext?.('2d', { willReadFrequently: true });
  if (!context || !isDrawable(art)) {
    return null;
  }
  context.imageSmoothingQuality = 'high';
  const size = { width: art.naturalWidth, height: art.naturalHeight };
  for (const corner of CORNERS) {
    context.drawImage(art, ...cornerSourceRect(size, corner), corner[0], corner[1], 1, 1);
  }
  return splashColors(context.getImageData(0, 0, 2, 2).data);
}
