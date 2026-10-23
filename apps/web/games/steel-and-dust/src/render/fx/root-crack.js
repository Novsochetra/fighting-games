import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { GUARDIAN_MOVES } from '../../data/enemies/moves/guardian-moves.js';
import { easeOutCubic } from '../../lib/math.js';
import { crackPath, openCrack } from './crack-path.js';
import {
  PIXEL,
  ellipseRows,
  fillRows,
  fineLine,
  flicker,
  inLight,
  snap,
  steppedLevel,
} from './fine-pixels.js';
import { isBlinking, isHurrying } from './mark-blink.js';

// the mark is laid this long before the root bursts under it; the crack runs out over most of that
const MARK_TICKS = GUARDIAN_MOVES.figRoots.roots.underHero;
const OPEN_TICKS = 28;
const OPEN_FROM = 2;
const OPEN_REACH = 20;
// over its last ticks light pours up out of it at its heart and either side
const SHAFTS = [
  [0, 18],
  [-8, 13],
  [8, 13],
];
const SHAFT_TICKS = 16;
// chips of stone hop out of it once it has opened
const CHIPS = 3;
const CHIP_LIFE = 12;
const GLOW_LEVELS = [0.14, 0.2, 0.26];

export function crackOpen(time) {
  const since = MARK_TICKS + time;
  return OPEN_FROM + OPEN_REACH * easeOutCubic(Math.min(1, Math.max(0, since) / OPEN_TICKS));
}

// the crack is widest at its heart and thins to a hairline of gold at its ends and forks
export function wallWidth(segment) {
  const out = segment.start + (segment.fork ? 6 : 0);
  if (out < 5) {
    return 3;
  }
  return out < 12 ? 2 : 1;
}

const at = (root, part) => ({ x: root.x + part.x, y: root.y + part.y });

function drawLines(context, { root, segments, color, widthOf }) {
  context.fillStyle = color;
  for (const segment of segments) {
    const width = widthOf(segment);
    fineLine(context, { from: at(root, segment.from), to: at(root, segment.to), width });
  }
}

// the seam burns white-hot at the crack's heart and at the ends still running out
function seamColor(root, segment) {
  if (segment.start < 3 || segment.running) {
    return COLORS.white;
  }
  return isBlinking(root.time) ? COLORS.red : FX_COLORS.gazeGold;
}

function drawSeams(context, root, segments) {
  for (const segment of segments) {
    context.fillStyle = seamColor(root, segment);
    fineLine(context, { from: at(root, segment.from), to: at(root, segment.to), width: 1 });
  }
}

// a shaft of light, wide and soft at its foot and narrowing up to a white-hot thread
function drawShaft(context, { x, floor, height }) {
  inLight(context, () => {
    context.globalAlpha = 0.45;
    context.fillStyle = FX_COLORS.gazeGold;
    const foot = snap(height * 0.45);
    context.fillRect(x - PIXEL * 2, floor - foot, PIXEL * 5, foot);
    context.fillRect(x - PIXEL, floor - height, PIXEL * 3, height);
  });
  context.globalAlpha = 1;
  context.fillStyle = FX_COLORS.gazeWhite;
  const core = snap(height * 0.75);
  context.fillRect(x, floor - core, PIXEL, core);
}

function drawShafts(context, root) {
  const rise = 1 - -root.time / SHAFT_TICKS;
  for (const [ahead, tall] of SHAFTS) {
    const height = snap(tall * rise * (0.75 + 0.25 * flicker(ahead, root.time >> 1)));
    drawShaft(context, { x: snap(root.x + ahead), floor: snap(root.y + 1), height });
  }
}

function drawChips(context, root) {
  const since = MARK_TICKS + root.time;
  context.fillStyle = FX_COLORS.stoneSkin;
  for (let i = 0; i < CHIPS; i++) {
    const life = since + (i * CHIP_LIFE) / CHIPS;
    const age = life % CHIP_LIFE;
    const side = flicker(Math.round(root.x) + i, Math.floor(life / CHIP_LIFE)) < 0.5 ? -1 : 1;
    const x = root.x + side * (1 + age * 0.6);
    const y = root.y - 1 - age * (CHIP_LIFE - age) * 0.12;
    context.fillRect(snap(x), snap(y), PIXEL * 2, PIXEL * 2);
  }
}

function drawGlow(context, root, { open, segments }) {
  inLight(context, () => {
    const hurry = isHurrying(root.time) ? 0.1 : 0;
    context.globalAlpha = steppedLevel(GLOW_LEVELS, Math.round(root.x), root.time >> 2) + hurry;
    context.fillStyle = FX_COLORS.gazeGold;
    fillRows(context, { x: root.x, y: root.y + 1, rows: ellipseRows(open + 3, 2.5) });
    context.globalAlpha = 0.3;
    const widthOf = (segment) => wallWidth(segment) + 2;
    drawLines(context, { root, segments, color: FX_COLORS.gazeEmber, widthOf });
  });
  context.globalAlpha = 1;
}

// the road cracks open over the root about to burst under the hero: dark walls round a seam of
// gold glowing on the road, chips of stone hopping out of it and, at the last, light pouring up
export function drawRootCrack(context, root) {
  const open = crackOpen(root.time);
  const segments = openCrack(crackPath(Math.round(root.x)), open);
  drawGlow(context, root, { open, segments });
  drawLines(context, { root, segments, color: FX_COLORS.rootCrack, widthOf: wallWidth });
  drawSeams(context, root, segments);
  if (open > OPEN_FROM + OPEN_REACH / 2) {
    drawChips(context, root);
  }
  if (-root.time < SHAFT_TICKS) {
    drawShafts(context, root);
  }
}
