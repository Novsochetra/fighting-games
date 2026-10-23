import { FX_SCALE, FX_SPRITES } from '../../data/fx-sprites.js';
import { bodySize } from '../../sim/fighters/body-point.js';
import { fistOf } from '../../sim/hazards/chain-fist.js';
import { HOOK_SIZE } from '../../sim/hazards/chain-pull.js';
import { drawSlantedFrame } from './slanted-frame.js';

// the chain is the one strip of links laid end to end along the line, cut where the line ends
function drawLinks(painter, sheets, { line, length, scale }) {
  const step = FX_SPRITES.chain.frameWidth * FX_SCALE * scale;
  for (let shift = 0; shift < length; shift += step) {
    drawSlantedFrame(painter, sheets, {
      name: 'chain',
      frame: 0,
      scale,
      line,
      shift,
      window: { from: 0, to: length },
    });
  }
}

const isCaught = (hook) => hook.state === 'pull' || hook.state === 'held';

// the chain runs from the fist of the frame he is drawn on to the hook's ring, at his size; a flying
// hook points on along it, and one that has caught the hero lies level, its curve round them
export function drawChainHook(painter, hook, sheets) {
  const fist = fistOf(hook.owner);
  const dx = hook.x - fist.x;
  const length = Math.hypot(dx, hook.y - fist.y);
  const angle = Math.atan2(hook.y - fist.y, Math.abs(dx));
  const facing = dx < 0 ? -1 : 1;
  const line = { x: fist.x, y: fist.y, facing, angle };
  drawLinks(painter, sheets, { line, length, scale: bodySize(hook.owner, 1) });
  const level = isCaught(hook);
  const outward = level ? Math.sign(hook.x - hook.owner.x) || facing : facing;
  drawSlantedFrame(painter, sheets, {
    name: 'hook',
    frame: 0,
    scale: bodySize(hook.owner, HOOK_SIZE),
    line: { x: hook.x, y: hook.y, facing: outward, angle: level ? 0 : angle },
  });
}

// the crack a rift runs along is the fissure drawn with it (rifts.js); the rift itself shows nothing
export const drawRift = () => {};
