import { mossCoreOf } from '../../../sim/fx/heavy/moss-swing.js';
import { point } from '../../painter.js';

// a thrusting heavy drives a thorny lance of vine out ahead of it, which shoots to full length in a
// couple of ticks and then draws in from its root
const TICKS = 5;
const REACH = 24;
const GROWTH = 9;
const THORN_EVERY = 5;

function spanOf(since) {
  const reach = Math.min(REACH, 8 + since * GROWTH);
  const root = since >= 2 ? (since - 1) * 7 : 0;
  return { root: 4 + root, reach: 4 + reach };
}

// thorns along the lance point back toward the Shade, alternately above and below it
function drawThorns(painter, { end, root, reach, art }) {
  for (let along = root + THORN_EVERY; along < reach - 2; along += THORN_EVERY) {
    const side = Math.round(along / THORN_EVERY) % 2 ? -1 : 1;
    const tip = end(along - 2, side * 3);
    painter.use(art.outline).line(end(along, side), tip, 1);
    painter.use(art.thornTip).rect(tip.x, tip.y, 1, 1);
  }
}

export function drawLance(painter, { fighter, move, time, art }) {
  const since = time - move.startup;
  if (since < 0 || since >= TICKS) {
    return;
  }
  const core = mossCoreOf(fighter);
  const end = (along, dy = 0) => point(core.x + along * fighter.facing, core.y - 3 + dy);
  const { root, reach } = spanOf(since);
  painter.alpha(since >= TICKS - 2 ? 0.6 : 1);
  painter.use(art.outline).line(end(root, 1), end(reach, 1), 1);
  painter.use(art.thornLight).line(end(root), end(reach), 1);
  painter.use(since === 0 ? art.bloom : art.glow).line(end(root + 2, -1), end(reach - 3, -1), 1);
  drawThorns(painter, { end, root, reach, art });
  const tip = end(reach);
  painter.use(art.bloom).rect(tip.x, tip.y, 1, 1);
  painter.alpha(1);
}
