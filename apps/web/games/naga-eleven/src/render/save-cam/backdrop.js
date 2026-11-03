import { backdropOf } from './backdrops/index.js';
import { drawStill, stillOf } from './backdrops/still.js';

// a frame of the venue's still: the same key always paints the same picture
const stillFor = (backdrop, frame) => ({
  key: `${backdrop.id}:${frame}`,
  paint: (raster) => backdrop.paint(raster, frame),
});

// behind the goal, the match's own venue: its still (the frame of it the show's clock is on),
// then what moves on it; `tick` is the app's clock, `ticks` the show's own
export function drawBackdrop(pen, { tick, ticks = tick, venue = null }) {
  const backdrop = backdropOf(venue);

  if (backdrop.paint) {
    drawStill(pen, stillFor(backdrop, backdrop.frameOf?.(ticks) ?? 0));
  }

  backdrop.live?.(pen, { tick, ticks });
}

// paints the venue's stills ahead, while a card is up, so a match's first save cam never waits
export function prepareBackdrop(venue) {
  const backdrop = backdropOf(venue);
  const frames = backdrop.frameOf ? [0, 1] : [0];

  if (!backdrop.paint) {
    return;
  }

  for (const frame of frames) {
    const { key, paint } = stillFor(backdrop, frame);

    stillOf(key, paint);
  }
}

export const goalStyleOf = (venue) => backdropOf(venue).goal;

export const skyOf = (venue) => backdropOf(venue).sky;
