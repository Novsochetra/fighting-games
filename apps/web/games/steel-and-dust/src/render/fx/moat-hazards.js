import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { BOLT_WARN } from '../../sim/hazards/naga-bolts.js';
import { ORB_GROW } from '../../sim/hazards/rainbow-orb.js';
import { SPIRIT_HEAD_UP, SWEEP_WARN } from '../../sim/hazards/spirit-nagas.js';
import { TIDE_BREAK, TIDE_RISE } from '../../sim/hazards/tides.js';
import { drawText } from '../text/draw-text.js';
import { drawFxFrame, fxFrameAt } from './fx-sheets.js';

const MARK_LENGTH = 30;
const EDGE_GAP = 16;
const LOOP_TICKS = 4;

// frames 0-1 raise the wave, 2-4 roll its curl, 5-7 break it
function tideFrame(tide) {
  if (tide.time < TIDE_RISE) {
    return Math.floor(tide.time / (TIDE_RISE / 2));
  }
  if (tide.time < tide.breakAt) {
    return 2 + (Math.floor((tide.time - TIDE_RISE) / LOOP_TICKS) % 3);
  }
  return Math.min(7, 5 + Math.floor((tide.time - tide.breakAt) / (TIDE_BREAK / 3)));
}

export function drawTide(painter, tide, sheets) {
  drawFxFrame(painter, sheets, {
    name: 'tide',
    frame: tideFrame(tide),
    x: tide.x,
    y: tide.y,
    facing: tide.direction,
  });
}

// a red bar at the height something will fly, with chevrons pointing the way, blinking faster as it
// nears, like every boss danger
function drawLaneMark(painter, { x, y, direction, left: ticksLeft, time }) {
  const start = direction > 0 ? x : x - MARK_LENGTH;
  const blink = ticksLeft < 12 ? 1 : 2;
  painter.alpha((time >> blink) & 1 ? 0.75 : 0.4).use(COLORS.red);
  painter.rect(start, y - 1, MARK_LENGTH, 3);
  painter.use(FX_COLORS.dangerLight).rect(start, y - 1, MARK_LENGTH, 1);
  for (let i = 1; i <= 2; i++) {
    drawText(painter, direction > 0 ? '>' : '<', {
      x: x + direction * i * 11,
      y: y - 9,
      color: COLORS.coral,
      align: 'center',
      shadow: null,
    });
  }
  painter.alpha(1);
}

// a water naga takes shape at her mouth (0-1) while its lane is marked, then darts (2-3)
export function drawNagaBolt(painter, bolt, sheets) {
  const darting = bolt.time >= BOLT_WARN;
  if (!darting) {
    drawLaneMark(painter, {
      x: bolt.x + bolt.direction * 12,
      y: bolt.laneY,
      direction: bolt.direction,
      left: BOLT_WARN - bolt.time,
      time: bolt.time,
    });
  }
  const frame = darting
    ? 2 + (Math.floor(bolt.time / 3) % 2)
    : Math.floor((bolt.time * 2) / BOLT_WARN);
  drawFxFrame(painter, sheets, {
    name: 'nagaBolt',
    frame,
    x: bolt.x,
    y: bolt.y,
    facing: bolt.direction,
  });
}

// a spirit naga's lane is marked at the screen's edge while it waits; then it takes shape (1-2),
// sweeps (3-4) and, at the far side, comes apart (5-6)
export function drawSpiritNaga(painter, spirit, sheets) {
  if (spirit.time < SWEEP_WARN) {
    drawLaneMark(painter, {
      x: spirit.x + spirit.direction * EDGE_GAP,
      y: spirit.y - 4,
      direction: spirit.direction,
      left: SWEEP_WARN - spirit.time,
      time: spirit.time,
    });
    return;
  }
  const since = spirit.time - SWEEP_WARN;
  const frame = since < 8 ? 1 + (since >> 2) : 3 + (Math.floor(since / LOOP_TICKS) % 2);
  drawFxFrame(painter, sheets, {
    name: 'spiritNaga',
    frame,
    x: spirit.x,
    y: spirit.y - SPIRIT_HEAD_UP,
    facing: spirit.direction,
  });
}

// the orb grows out of sparks (0-2), spins (3-6) and bursts (7)
export function drawRainbowOrb(painter, orb, sheets) {
  let frame = 7;
  if (orb.time < ORB_GROW) {
    frame = Math.floor((orb.time * 3) / ORB_GROW);
  } else if (orb.time < orb.burstAt) {
    frame = 3 + (Math.floor((orb.time - ORB_GROW) / LOOP_TICKS) % 4);
  }
  drawFxFrame(painter, sheets, {
    name: 'rainbowOrb',
    frame,
    x: orb.x,
    y: orb.y,
    facing: orb.direction,
  });
}

// the serpent of water bursts up out of its marked spot
export function drawSerpentRise(painter, rise, sheets) {
  if (rise.time < rise.warn) {
    return;
  }
  drawFxFrame(painter, sheets, {
    name: 'serpentRise',
    frame: fxFrameAt('serpentRise', rise.time - rise.warn),
    x: rise.x,
    y: rise.y,
    facing: rise.direction,
  });
}
