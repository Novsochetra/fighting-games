import { SIDES } from '../../story/stage.js';
import { drawPortrait } from '../portraits/index.js';
import { clamp01, onGrid, remaining } from './motion.js';

const SLIDE_TICKS = 12;
const SLIDE_DISTANCE = 56;
const RISE_TICKS = 6;
const LISTENER_SINK = 8;

function standingOf(state, side, entry) {
  const speaking = state.stage.speaking === side;
  const since = state.tick - entry.since;
  const wasListening = entry.since < state.tick - state.lineTick;
  const sink = speaking
    ? LISTENER_SINK * (wasListening ? remaining(state.lineTick, RISE_TICKS) : 0)
    : LISTENER_SINK;
  const slide = SLIDE_DISTANCE * remaining(since, SLIDE_TICKS);

  return {
    shift: onGrid(side === 'left' ? -slide : slide),
    sink: onGrid(sink),
    alpha: clamp01((since + 1) / (SLIDE_TICKS / 2)),
  };
}

export function drawStage(context, state, layoutOf) {
  for (const side of SIDES) {
    const entry = state.stage[side];

    if (entry) {
      const { portrait } = layoutOf(side);
      const { shift, sink, alpha } = standingOf(state, side, entry);

      context.save();
      context.globalAlpha *= alpha;
      drawPortrait(context, {
        ...entry.portrait,
        x: portrait.x + shift,
        y: portrait.y + sink,
        scale: portrait.scale,
        flip: side === 'right',
      });
      context.restore();
    }
  }
}
