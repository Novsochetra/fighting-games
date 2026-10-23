import { FX_SCALE, FX_SPRITES } from '../../data/fx-sprites.js';
import { bodySize } from '../../sim/fighters/body-point.js';
import { fistOf } from '../../sim/hazards/chain-fist.js';
import { HOOK_SIZE } from '../../sim/hazards/chain-pull.js';
import { drawFxFrame } from './fx-sheets.js';

// the chain is the one strip of links laid end to end along the line, cut where the line ends
function drawLinks(painter, sheets, { length, scale }) {
  const context = painter.context;
  const step = FX_SPRITES.chain.frameWidth * FX_SCALE * scale;
  context.save();
  context.beginPath();
  context.rect(0, -step, length, step * 2);
  context.clip();
  for (let at = 0; at < length; at += step) {
    drawFxFrame(painter, sheets, { name: 'chain', frame: 0, x: at, y: 0, scale });
  }
  context.restore();
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
  const context = painter.context;
  context.save();
  context.translate(fist.x, fist.y);
  context.scale(facing, 1);
  context.rotate(angle);
  drawLinks(painter, sheets, { length, scale: bodySize(hook.owner, 1) });
  context.restore();
  const level = isCaught(hook);
  const outward = level ? Math.sign(hook.x - hook.owner.x) || facing : facing;
  context.save();
  context.translate(hook.x, hook.y);
  context.scale(outward, 1);
  context.rotate(level ? 0 : angle);
  drawFxFrame(painter, sheets, {
    name: 'hook',
    frame: 0,
    x: 0,
    y: 0,
    scale: bodySize(hook.owner, HOOK_SIZE),
  });
  context.restore();
}

// the crack a rift runs along is the fissure drawn with it (rifts.js); the rift itself shows nothing
export const drawRift = () => {};
