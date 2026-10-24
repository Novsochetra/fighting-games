// Drawing the icon into a few pixels and letting the browser stretch them gives a soft wash of its
// colors for the launch screen, at no cost per frame, where a CSS blur would rerun every frame.
export const BACKDROP_SIZE = 6;

export function createBackdrop(document, art) {
  const canvas = document.createElement('canvas');
  canvas.className = 'launch__backdrop';
  canvas.width = BACKDROP_SIZE;
  canvas.height = BACKDROP_SIZE;
  const context = canvas.getContext?.('2d');
  if (context && art?.tagName === 'IMG' && art.complete && art.naturalWidth > 0) {
    context.drawImage(art, 0, 0, BACKDROP_SIZE, BACKDROP_SIZE);
  }
  return canvas;
}
