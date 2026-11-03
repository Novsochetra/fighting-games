import { SHIRT } from '../../../art/cinematics/icons.js';
import { CINE } from '../../../art/cinematics/palette.js';
import { shirtColours } from '../shared/kits.js';
import { drawBox, drawRampBar } from '../shared/panel.js';
import { drawPixelMap } from '../shared/pixel-map.js';
import { drawWords, wordsOf } from '../shared/words.js';

export const PLATE = { width: 318, height: 76 };

const SHIRT_SCALE = 3;
const SHIRT_WIDTH = SHIRT[0].length * SHIRT_SCALE;
const FIELD_REACH = 74;

function drawKitBars(context, { x, y, kit }) {
  drawRampBar(context, { x, y, width: PLATE.width, height: 7 }, kit.band);
  drawRampBar(context, { x, y: y + 7, width: PLATE.width, height: 2 }, kit.trim);
  drawRampBar(context, { x, y: y + PLATE.height - 5, width: PLATE.width, height: 5 }, kit.shorts);
}

function drawKitField(context, { x, y, kit, mirror }) {
  const top = y + 9;
  const height = PLATE.height - 14;

  for (let row = 0; row < height; row += 1) {
    const reach = FIELD_REACH + Math.round((height / 2 - row) / 2);
    const from = mirror ? x + PLATE.width - reach : x;

    context.fillStyle = kit.band[0];
    context.fillRect(from, top + row, reach, 1);
    context.fillStyle = kit.band[2];
    context.fillRect(mirror ? from - 2 : from + reach, top + row, 2, 1);
  }
}

function drawSheen(context, { x, y }) {
  context.fillStyle = CINE.panel[2];
  context.fillRect(x + 1, y + 9, PLATE.width - 2, 14);

  for (let column = x + 1; column < x + PLATE.width - 1; column += 2) {
    context.fillRect(column, y + 23, 1, 1);
  }
}

export function drawTeamPlate(context, { x, y, team, kit, side, lang }) {
  const mirror = side === 1;
  const shirtX = mirror ? x + PLATE.width - 14 - SHIRT_WIDTH : x + 14;
  const textX = mirror ? x + PLATE.width - 96 : x + 96;
  const align = mirror ? 'right' : 'left';

  drawBox(context, { x, y, width: PLATE.width, height: PLATE.height });
  drawSheen(context, { x, y });
  drawKitField(context, { x, y, kit, mirror });
  drawKitBars(context, { x, y, kit });
  drawPixelMap(context, SHIRT, {
    x: shirtX,
    y: y + 18,
    colours: shirtColours(kit),
    scale: SHIRT_SCALE,
  });
  drawWords(context, wordsOf(team.short, lang), {
    x: textX,
    y: y + 20,
    size: 24,
    align,
    drop: 1,
  });
  drawWords(context, wordsOf(team.name, lang), {
    x: textX,
    y: y + 52,
    color: CINE.muted,
    align,
  });
}
