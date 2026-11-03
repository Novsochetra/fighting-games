import { CINE } from '../../../art/cinematics/palette.js';
import { backOut, shareOf } from '../shared/ease.js';
import { drawWords } from '../shared/words.js';
import { LABELS } from '../shared/labels.js';

const RADIUS = 25;
const POP = { delay: 16, ticks: 12 };

function diamond(context, { x, y, radius }, colour) {
  context.fillStyle = colour;

  for (let row = -radius; row <= radius; row += 1) {
    const half = radius - Math.abs(row);

    context.fillRect(x - half, y + row, half * 2 + 1, 1);
  }
}

function drawMedallion(context, { x, y, radius }) {
  diamond(context, { x, y: y + 2, radius: radius + 1 }, CINE.ink);
  diamond(context, { x, y, radius: radius + 1 }, CINE.ink);
  diamond(context, { x, y, radius }, CINE.gold[1]);
  diamond(context, { x: x - 1, y: y - 1, radius: radius - 1 }, CINE.gold[3]);
  diamond(context, { x, y, radius: radius - 2 }, CINE.gold[2]);
  diamond(context, { x, y, radius: radius - 5 }, CINE.ink);
  diamond(context, { x, y, radius: radius - 6 }, CINE.panel[1]);
}

function drawGlint(context, { x, y, tick }) {
  const phase = tick % 90;

  if (phase > 10) {
    return;
  }

  const reach = phase < 5 ? phase : 10 - phase;

  context.fillStyle = CINE.white;
  context.fillRect(x - reach, y, reach * 2 + 1, 1);
  context.fillRect(x, y - reach, 1, reach * 2 + 1);
}

export function drawVersus(context, { state, x, y, leave, tick }) {
  const grow = backOut(shareOf(state.tick, state.beats.teams + POP.delay, POP.ticks));
  const radius = Math.round(RADIUS * grow * (1 - leave));

  if (radius < 4) {
    return;
  }

  drawMedallion(context, { x, y, radius });

  if (radius >= RADIUS - 2) {
    drawWords(context, LABELS.versus, {
      x,
      y: y - 7,
      size: 16,
      color: CINE.gold[3],
      align: 'center',
    });
    drawGlint(context, { x: x - 12, y: y - 12, tick });
  }
}
