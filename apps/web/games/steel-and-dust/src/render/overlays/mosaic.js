import { VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';

// the frame drawn so far, grown into blocks of `block` view pixels as the SNES's mosaic did: shrunk
// a sample a block, then laid back over the view unsmoothed
export function pixelate(painter, view, block) {
  if (block <= 1) {
    return;
  }
  const { context } = painter;
  const screen = context.canvas;
  const width = VIEW_WIDTH / block;
  const height = VIEW_HEIGHT / block;
  view.mosaic ??= view.loaders.createCanvas(VIEW_WIDTH / 2, VIEW_HEIGHT / 2);
  const small = view.mosaic.getContext('2d');
  small.imageSmoothingEnabled = false;
  small.drawImage(screen, 0, 0, screen.width, screen.height, 0, 0, width, height);
  context.drawImage(view.mosaic, 0, 0, width, height, 0, 0, VIEW_WIDTH, VIEW_HEIGHT);
}
