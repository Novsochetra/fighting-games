// every word in the game is set in Silkscreen (the logo in its bold), so the title waits for both
// rather than coming up in a fallback font and jumping when the pixel one lands
export const PIXEL_FONTS = ['16px Silkscreen', '700 16px Silkscreen'];

export function loadFonts(fontSet, specs = PIXEL_FONTS) {
  if (typeof fontSet?.load !== 'function') {
    return Promise.resolve();
  }
  return Promise.all(specs.map((spec) => fontSet.load(spec))).catch(() => {});
}
