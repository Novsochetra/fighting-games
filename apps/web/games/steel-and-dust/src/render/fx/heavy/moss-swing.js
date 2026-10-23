import { mossCoreOf, mossSwingOf } from '../../../sim/fx/heavy/moss-swing.js';
import { point } from '../../painter.js';
import { drawLance } from './moss-lance.js';
import { drawOrbit } from './moss-orbit.js';
import { drawGroundRing } from './moss-ring.js';
import { drawSwirl } from './moss-swirl.js';

// a thorny crescent sweeps along a heavy's arc in its first ticks, head first, its tail fading
const ARCS = { sweep: [-1.35, 0.75], rise: [1.1, -1.9], fall: [-1.9, 1.1] };
const ARC_STEPS = 10;
const ARC_RADIUS = 15;
const ARC_TICKS = 5;

function arcPoint(at, angle, radius) {
  return point(at.x + Math.cos(angle) * radius * at.facing, at.y + Math.sin(angle) * radius);
}

function arcSpan(since) {
  const head = Math.min(ARC_STEPS, Math.round(((since + 1) * ARC_STEPS) / 2));
  const tail = Math.max(0, Math.round(((since - 1) * ARC_STEPS) / 3));
  return { head, tail };
}

function drawThorn(painter, { at, angle, art }) {
  const tip = arcPoint(at, angle, ARC_RADIUS + 5);
  painter.use(art.outline).line(arcPoint(at, angle, ARC_RADIUS + 2), tip, 1);
  painter.use(art.thornTip).rect(tip.x, tip.y, 1, 1);
}

// each step of the crescent: a navy edge, a green body, a sky-blue core through its middle
function drawArcStep(painter, { at, range, i, art, since }) {
  const angleAt = (step) => range[0] + ((range[1] - range[0]) * step) / ARC_STEPS;
  const band = (radius) => [arcPoint(at, angleAt(i), radius), arcPoint(at, angleAt(i + 1), radius)];
  painter.use(art.outline).line(...band(ARC_RADIUS + 2), 1);
  painter.use(art.thornLight).line(...band(ARC_RADIUS + 1), 1);
  if (Math.abs(i + 0.5 - ARC_STEPS / 2) < ARC_STEPS / 3) {
    painter.use(since === 0 ? art.bloom : art.glow).line(...band(ARC_RADIUS), 1);
  }
  if (i % 3 === 1) {
    drawThorn(painter, { at, angle: angleAt(i), art });
  }
}

function drawArc(painter, { fighter, move, time, art }, range) {
  const since = time - move.startup;
  if (since < 0 || since >= ARC_TICKS) {
    return;
  }
  const core = mossCoreOf(fighter);
  const at = { x: core.x, y: core.y - 4, facing: fighter.facing };
  const { head, tail } = arcSpan(since);
  painter.alpha(since >= ARC_TICKS - 2 ? 0.6 : 1);
  for (let i = tail; i < head; i++) {
    drawArcStep(painter, { at, range, i, art, since });
  }
  painter.alpha(1);
}

export function drawSwingUnder(painter, layer) {
  drawGroundRing(painter, layer, false);
  drawSwirl(painter, layer, false);
  if (mossSwingOf(layer.move) === 'spin') {
    drawOrbit(painter, layer, false);
  }
}

export function drawSwingOver(painter, layer) {
  drawGroundRing(painter, layer, true);
  drawSwirl(painter, layer, true);
  const swing = mossSwingOf(layer.move);
  if (swing === 'spin') {
    drawOrbit(painter, layer, true);
  } else if (swing === 'thrust') {
    drawLance(painter, layer);
  } else if (ARCS[swing]) {
    drawArc(painter, layer, ARCS[swing]);
  }
}
