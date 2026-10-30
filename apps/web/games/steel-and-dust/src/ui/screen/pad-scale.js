import { roomyScale } from '../../../../../packages/touch-pad/src/pad-room.js';
import { BUTTON_SCALES, buttonScale } from '../../data/settings.js';
import { layoutOf, shapesOf } from '../../data/skins/skins.js';
import { frameOf, lookNow, orientationNow, screenOf } from './fit-pad.js';
import { arrangeStage } from './stage-layout.js';
import { touchAreaOf } from './touch-area.js';

// px at scale 1 a thumb needs between two controls to press one and not the next
const CONTROL_GAP = 12;

// a shell's bezel round the game's screen (styles/skin-clear.css), px at scale 1, as deep on every
// side, and under the screen deeper still by the game's name, which does not scale
export const BEZEL = { side: 12, name: 14 };

function bezelRound(rect, scale) {
  const side = BEZEL.side * scale;

  return {
    left: rect.x - side,
    top: rect.y - side,
    right: rect.x + rect.width + side,
    bottom: rect.y + rect.height + side + BEZEL.name,
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
  const orientation = orientationNow(context);
  const padLayout = layoutOf(skinId, orientation);
  const hinge = context.hingeNow();
  const screen = screenOf(context);
  const keepOut = (scale) => {
    const frame = frameOf(padLayout, scale);
    const stage = { ...screen, safe, touch: true, buttonScale: scale, hinge, frame };
    const { rect, framed } = arrangeStage(stage);

    return framed ? [bezelRound(rect, scale)] : [];
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
