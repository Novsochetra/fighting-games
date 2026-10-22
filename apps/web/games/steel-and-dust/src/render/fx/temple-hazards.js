import { FX_COLORS } from '../../art/fx-colors.js';
import { clamp } from '../../lib/math.js';
import { CRUMBLE_TICKS, RUBBLE_FADE, isJarStanding } from '../../sim/hazards/canopic-jars.js';
import { CURSE_OVER_HEAD } from '../../sim/hazards/curse-marks.js';
import { drawText } from '../text/draw-text.js';
import { drawFxFrame } from './fx-sheets.js';

// the carpet: a back row of scarabs a step behind the front row, each on its own step of the walk
const CARPET = [
  [-12, -3],
  [4, -3],
  [-18, 0],
  [-4, 0],
  [12, 0],
];
const CURSE_HURRY = 120;

export function drawScarabs(painter, carpet, sheets) {
  CARPET.forEach(([ahead, up], i) => {
    drawFxFrame(painter, sheets, {
      name: 'scarab',
      frame: Math.floor((carpet.time + i * 2) / 3) % 4,
      x: carpet.x + carpet.direction * ahead,
      y: carpet.y + up,
      facing: carpet.direction,
    });
  });
}

const CRUMBLED = 5 * CRUMBLE_TICKS;

// frame 0 is the jar standing; 1-5 break it, and the rubble of frame 5 fades where it fell
export function drawCanopic(painter, jar, sheets) {
  const since = isJarStanding(jar) ? -1 : jar.time - jar.brokenAt;
  const frame = since < 0 ? 0 : Math.min(5, 1 + Math.floor(since / CRUMBLE_TICKS));
  painter.alpha(since < CRUMBLED ? 1 : clamp(1 - (since - CRUMBLED) / RUBBLE_FADE, 0, 1));
  drawFxFrame(painter, sheets, { name: 'canopic', frame, x: jar.x, y: jar.y });
  painter.alpha(1);
}

// the sun's eye over the cursed hero beats faster as the curse nears, under the seconds left
export function drawCurseMark(painter, mark, sheets) {
  const ticks = mark.left < CURSE_HURRY ? 3 : 6;
  const y = mark.y - CURSE_OVER_HEAD;
  drawFxFrame(painter, sheets, {
    name: 'curse',
    frame: Math.floor(mark.time / ticks) % 4,
    x: mark.x,
    y,
  });
  drawText(painter, String(Math.ceil(mark.left / 60)), {
    x: mark.x,
    y: y - 22,
    color: FX_COLORS.sunWhite,
    align: 'center',
  });
}

export function drawMirageBolt(painter, bolt, sheets) {
  drawFxFrame(painter, sheets, {
    name: 'mirageBolt',
    frame: Math.floor(bolt.time / 3) % 4,
    x: bolt.x,
    y: bolt.y,
    facing: bolt.direction,
  });
}
