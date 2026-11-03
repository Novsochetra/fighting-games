import { VIEW } from '../../config.js';
import { HUD } from '../../art/hud.js';
import { drawText, khmerRoom, lettersOf, measureText, textOf } from '../text.js';
import { BANNER, RESTART_TAG } from './layout.js';
import { drawPanel } from './panel.js';

const MOTION = { open: 10, text: 12, close: 9 };
const BIG = { size: 24 };
const SMALL = { size: 8 };
const LINE_ROOM = 10;

const ease = (share) => 1 - (1 - Math.min(1, Math.max(0, share))) ** 3;

function drawBand(context, banner, { half, height, top }) {
  const middle = VIEW.width / 2;

  // the players under the band still show through it, as a goal is cheered right there
  context.globalAlpha = 0.78;
  context.fillStyle = HUD.banner;

  for (let row = 0; row < height; row += 1) {
    const slant = Math.round((row - height / 2) / 2);

    context.fillRect(middle - half - slant, top + row, half * 2, 1);
  }

  context.globalAlpha = 1;

  for (const [row, shade] of [
    [0, 3],
    [1, 2],
    [height - 2, 1],
    [height - 1, 0],
  ]) {
    const slant = Math.round((row - height / 2) / 2);

    context.fillStyle = banner.ramp[shade];
    context.fillRect(middle - half - slant, top + row, half * 2, 1);
  }
}

function drawHeavyText(context, words, { x, y, wave, age }) {
  const letters = lettersOf(words);
  const widths = letters.map((letter) => measureText(context, letter, BIG));
  let left = x - widths.reduce((sum, width) => sum + width, 0) / 2;

  letters.forEach((letter, i) => {
    const leap = wave ? Math.round(Math.max(0, Math.sin(age / 4 - i * 0.7)) * 4) : 0;
    const at = { y: y - leap, baseline: 'middle', ...BIG };

    for (const [dx, dy] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 2],
      [1, 2],
    ]) {
      drawText(context, letter, { ...at, x: left + dx, y: at.y + dy, color: HUD.ink });
    }

    drawText(context, letter, { ...at, x: left, color: HUD.gold[2] });
    left += widths[i];
  });
}

// `slot` is the band's top when it is open, BANNER's unless a goal asks for another
export function drawBigBanner(context, banner, { lang, slot = BANNER.y }) {
  const closing = Number.isFinite(banner.length) ? (banner.length - banner.age) / MOTION.close : 1;
  const fullHeight = BANNER.height + (banner.line ? LINE_ROOM + khmerRoom(banner.line) : 0);
  const height = Math.max(2, Math.round(fullHeight * ease(closing)));
  const top = slot + Math.round((fullHeight - height) / 2);
  const half = Math.round((VIEW.width / 2 + 24) * ease(banner.age / MOTION.open));
  const slide = Math.round((1 - ease((banner.age - 3) / MOTION.text)) * 90);

  drawBand(context, banner, { half, height, top });

  if (height < fullHeight * 0.7 || banner.age < 3) {
    return;
  }

  const words = textOf(banner.label, lang);
  const middle = top + BANNER.height / 2 + 1;

  drawHeavyText(context, words, {
    x: VIEW.width / 2 + slide,
    y: middle,
    wave: banner.wave,
    age: banner.age,
  });

  if (banner.line) {
    drawText(context, banner.line, {
      x: VIEW.width / 2 - slide,
      y: top + BANNER.height + 1 + khmerRoom(banner.line) / 2,
      color: HUD.text,
      shadow: HUD.ink,
      align: 'center',
      baseline: 'middle',
      ...SMALL,
    });
  }
}

export function drawRestartTag(context, banner, { lang }) {
  const words = textOf(banner.label, lang);
  const width = Math.ceil(measureText(context, words, SMALL)) + 20;
  const x = Math.round(VIEW.width / 2 - width / 2);
  const y = RESTART_TAG.y - Math.round((1 - ease(banner.age / 8)) * 24);

  const height = 14 + khmerRoom(words);

  drawPanel(context, { x, y, width, height });
  context.fillStyle = banner.ramp[2];
  context.fillRect(x + 3, y + 3, 4, height - 6);
  context.fillStyle = banner.ramp[3];
  context.fillRect(x + 3, y + 3, 4, 1);
  drawText(context, words, {
    x: x + 12,
    y: y + height / 2,
    color: HUD.text,
    baseline: 'middle',
    ...SMALL,
  });
}
