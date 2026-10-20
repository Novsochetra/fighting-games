import { VIEW_WIDTH } from '../../../config.js';
import { wrapX } from './motion.js';

// how far sparks and smoke spread from their emitter, so a copy just off-screen still shows its edge
const REACH = 32;

function isNear(x) {
  return x > -REACH && x < VIEW_WIDTH + REACH;
}

// the near layer repeats every tileWidth, so an emitter shows once per tile copy on screen;
// without a tileWidth it does not repeat, which also keeps a bad width from looping forever
export function emitterScreenXs(emitter, { tileWidth, cameraX, drift = 0 }) {
  const shifted = emitter.x - cameraX * drift;
  if (!(tileWidth > 0)) {
    return isNear(shifted) ? [Math.round(shifted)] : [];
  }
  const screenXs = [];
  for (let x = wrapX(shifted, tileWidth) - tileWidth; x < VIEW_WIDTH + REACH; x += tileWidth) {
    if (isNear(x)) {
      screenXs.push(Math.round(x));
    }
  }
  return screenXs;
}

export function emitterSpots(effect, cameraX) {
  const scroll = { tileWidth: effect.tileWidth, cameraX, drift: effect.drift };
  return effect.emitters.flatMap((emitter, index) =>
    emitterScreenXs(emitter, scroll).map((x) => ({ x, y: emitter.y, index })),
  );
}
