import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { easeOutCubic } from '../../lib/math.js';
import { PIXEL, ellipseRows, fillRows, flicker, inLight, ringRows, snap } from './fine-pixels.js';
import { isBlinking, isHurrying } from './mark-blink.js';

// a ring of runes as wide as the pillar's foot, lying flat on the road; it pops open over its first
// ticks and throbs on a beat while a ring of light closes in on the spot, quicker once it hurries
const RADIUS = 13;
const FLAT = 0.3;
const GROW_TICKS = 10;
const THROB_TICKS = 6;
const CLOSE_TICKS = 10;
const HURRY_CLOSE_TICKS = 5;
const RUNES = 8;
const RUNE_TURN = 0.04;
const MOTES = 4;
const MOTE_LIFE = 14;

export function ringRadius(pillar) {
  const grown = Math.min(1, (pillar.wait + pillar.time) / GROW_TICKS);
  return snap(RADIUS * (0.3 + 0.7 * easeOutCubic(grown)));
}

export const isThrobbing = (since) => since % THROB_TICKS < 2;

// how far in the closing ring has come, as a share of the rim's radius
export function closingShare(time, since) {
  const period = isHurrying(time) ? HURRY_CLOSE_TICKS : CLOSE_TICKS;
  return 1 - (since % period) / period;
}

const flatRing = (radius, width) => ringRows(radius, radius * FLAT, width);
const flatDisc = (radius) => ellipseRows(radius, radius * FLAT);

function paint(context, { color, alpha = 1 }, draw) {
  context.globalAlpha = alpha;
  context.fillStyle = color;
  draw();
}

function drawGlow(context, { x, y, radius, throb }) {
  inLight(context, () => {
    paint(context, { color: FX_COLORS.gazeGold, alpha: throb ? 0.32 : 0.2 }, () =>
      fillRows(context, { x, y, rows: flatDisc(radius - 1) }),
    );
    paint(context, { color: FX_COLORS.gazeEmber, alpha: 0.5 }, () =>
      fillRows(context, { x, y, rows: flatRing(radius + 1, 2) }),
    );
  });
}

// short strokes of light stand round the ring between its two lines, turning slowly
function drawRunes(context, { x, y, radius, since, color }) {
  const beat = since >> 1;
  for (let i = 0; i < RUNES; i++) {
    const angle = (i * Math.PI * 2) / RUNES + since * RUNE_TURN;
    const height = (2 + Math.floor(flicker(i, beat) * 2)) * PIXEL;
    const at = {
      x: snap(x + Math.cos(angle) * (radius - 1)),
      y: snap(y + Math.sin(angle) * (radius - 1) * FLAT),
    };
    paint(context, { color, alpha: Math.sin(angle) > 0 ? 1 : 0.6 }, () =>
      context.fillRect(at.x, at.y - height, PIXEL, height),
    );
    paint(context, { color: COLORS.white, alpha: Math.sin(angle) > 0 ? 1 : 0.6 }, () =>
      context.fillRect(at.x, at.y - height - PIXEL, PIXEL, PIXEL),
    );
  }
}

// motes of light rise off the ring from places that change with each one's life
function drawMotes(context, { x, y, radius, since }) {
  const seed = Math.round(x);
  inLight(context, () => {
    for (let i = 0; i < MOTES; i++) {
      const life = since + (i * MOTE_LIFE) / MOTES;
      const age = life % MOTE_LIFE;
      const spread = (flicker(seed + i, Math.floor(life / MOTE_LIFE)) - 0.5) * radius * 1.6;
      paint(context, { color: FX_COLORS.gazeWhite, alpha: 1 - age / MOTE_LIFE }, () =>
        context.fillRect(snap(x + spread), snap(y - 1 - age * 1.1), PIXEL, PIXEL * 2),
      );
    }
  });
}

// a white-hot spot swells at its heart as the pillar nears
function drawHeart(context, { x, y, time }) {
  const swell = (10 + time) / 10;
  if (swell <= 0) {
    return;
  }
  paint(context, { color: time > -4 ? COLORS.white : FX_COLORS.gazeWhite, alpha: 0.85 }, () =>
    fillRows(context, { x, y, rows: flatDisc(snap(1 + swell * 4)) }),
  );
}

// the gaze's mark: a double ring of gold with runes between its lines, glowing on the road
export function drawRuneRing(context, pillar) {
  const since = pillar.wait + pillar.time;
  const radius = ringRadius(pillar);
  const throb = isThrobbing(since);
  const spot = { x: pillar.x, y: pillar.y, radius };
  const line = isBlinking(pillar.time) ? COLORS.red : FX_COLORS.gazeGold;
  drawGlow(context, { ...spot, throb });
  const closing = snap(radius * closingShare(pillar.time, since));
  paint(context, { color: FX_COLORS.gazeWhite, alpha: 0.9 - 0.5 * (closing / radius) }, () =>
    fillRows(context, { ...spot, rows: flatRing(closing, 1) }),
  );
  paint(context, { color: throb ? FX_COLORS.gazeWhite : line }, () =>
    fillRows(context, { ...spot, rows: flatRing(radius + (throb ? PIXEL : 0), 1) }),
  );
  paint(context, { color: line, alpha: 0.7 }, () =>
    fillRows(context, { ...spot, rows: flatRing(radius - 2, 1) }),
  );
  drawRunes(context, { ...spot, since, color: line });
  drawHeart(context, { ...spot, time: pillar.time });
  drawMotes(context, { ...spot, since });
  context.globalAlpha = 1;
}
