import { roomyScale } from '../../../../../packages/touch-pad/src/pad-room.js';
import { BUTTON_SCALES, buttonScale } from '../../data/settings.js';
import { layoutOf, shapesOf, SKINS } from '../../data/skins/skins.js';
import { frameOf, lookNow, orientationNow, screenOf } from './fit-pad.js';
import { arrangeStage } from './stage-layout.js';
import { touchAreaOf } from './touch-area.js';

// px at scale 1 a thumb needs between two controls to press one and not the next
const CONTROL_GAP = 12;

function bezelRound(rect, { side, chin }, scale) {
  const round = side * scale;

  return {
    left: rect.x - round,
    top: rect.y - round,
    right: rect.x + rect.width + round,
    bottom: rect.y + rect.height + round + chin,
  };
}

// a folded phone's bottom half has no status bar over it (touch-area.js)
function safeLayer(context, safe) {
  const area = touchAreaOf(context.hingeNow());
  const { width, height } = area ?? screenOf(context);
  const top = area ? 0 : safe.top;

  return {
    left: safe.left,
    top,
    width: width - safe.left - safe.right,
    height: height - top - safe.bottom,
  };
}

export function padScaleOf(context, safe) {
  const { skinId } = lookNow(context);
  const { bezel } = SKINS[skinId];
  const orientation = orientationNow(context);
  const padLayout = layoutOf(skinId, orientation);
  const hinge = context.hingeNow();
  const screen = screenOf(context);
  const keepOut = (scale) => {
    const frame = frameOf(padLayout, scale);
    const stage = { ...screen, safe, touch: true, buttonScale: scale, hinge, frame };
    const { rect, framed } = arrangeStage(stage);

    return framed && bezel ? [bezelRound(rect, bezel, scale)] : [];
  };

  return roomyScale({
    variants: shapesOf(skinId, orientation),
    layer: safeLayer(context, safe),
    keepOut,
    wanted: buttonScale(context.game.settings),
    floor: BUTTON_SCALES[0],
    gap: CONTROL_GAP,
  });
}
