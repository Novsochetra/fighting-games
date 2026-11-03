import { cachedCanvas } from './cache.js';
import { GRID_SIZE } from './grid.js';
import { portraitFor } from './portrait.js';
import { paintRuns } from './runs.js';

export { clearPortraitCache, setPortraitCanvasFactory } from './cache.js';
export {
  AGES,
  CAST,
  GROWING_UP,
  MOODS,
  VILLAGER_COUNT,
  VILLAGER_KINDS,
  hasPortrait,
} from './cast/index.js';

export const PORTRAIT_SIZE = GRID_SIZE;

export function drawPortrait(context, options) {
  const { character, age, mood = 'neutral', x, y, scale = 1, flip = false, variant } = options;
  const unit = Math.max(1, Math.round(scale));
  const left = Math.round(x);
  const top = Math.round(y);
  const portrait = portraitFor({ character, age, mood, variant });
  const canvas = cachedCanvas(
    `${portrait.key}|${unit}|${flip}`,
    PORTRAIT_SIZE * unit,
    (offscreen) => paintRuns(offscreen, portrait.runs, { x: 0, y: 0, unit, flip }),
  );

  if (canvas) {
    context.drawImage(canvas, left, top);

    return;
  }

  paintRuns(context, portrait.runs, { x: left, y: top, unit, flip });
}
