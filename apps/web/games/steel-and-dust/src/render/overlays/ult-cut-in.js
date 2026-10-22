import { HERO_THEMES } from '../../art/hero-themes.js';
import { VIEW_WIDTH } from '../../config.js';
import { heroById } from '../../data/heroes.js';
import { ultimateOf } from '../../data/ultimates/index.js';
import { WEAPONS } from '../../data/weapons/index.js';
import { heroSheetFor } from '../fighters/hero-sheets.js';
import { drawHeroFrame } from '../fighters/hero-sprites.js';
import { drawText } from '../text/draw-text.js';

const BAND_Y = 52;
const BAND_HEIGHT = 46;
const GLOW = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

function drawBand(painter, game, colors) {
  painter.alpha(0.9).use(colors.band).rect(0, BAND_Y, VIEW_WIDTH, BAND_HEIGHT);
  painter.alpha(1).use(colors.edge).rect(0, BAND_Y, VIEW_WIDTH, 1);
  painter.use(colors.edge).rect(0, BAND_Y + BAND_HEIGHT - 1, VIEW_WIDTH, 1);
  for (let i = 0; i < 8; i++) {
    const streak = ((game.tickCount * 9 + i * 71) % (VIEW_WIDTH + 60)) - 30;
    painter.use(colors.streak).rect(VIEW_WIDTH - streak, BAND_Y + 5 + i * 5, 22 + (i % 3) * 8, 1);
  }
}

// the sword row, or the fists row for a hero whose ultimate is fought bare-handed
export function portraitRow(heroId) {
  return ultimateOf(heroId).bareHanded ? WEAPONS.fists.spriteRow : WEAPONS.sword.spriteRow;
}

// the Shade at twice its size, glowing in its ultimate's color, cropped to the band
function drawPortrait(painter, { view, game, colors, slide }) {
  const sheet = heroSheetFor(view, game.settings.hero);
  if (!sheet.ready) {
    return;
  }
  const context = painter.context;
  context.save();
  context.beginPath();
  context.rect(0, BAND_Y + 1, VIEW_WIDTH, BAND_HEIGHT - 2);
  context.clip();
  context.translate(Math.round(70 - slide * 140), BAND_Y + BAND_HEIGHT + 22);
  context.scale(2, 2);
  const row = portraitRow(game.settings.hero);
  const at = (dx, dy, tint) => ({ frame: ['idle', 0], x: dx, y: dy, facing: 1, tint, row });
  painter.alpha(0.8);
  for (const [dx, dy] of GLOW) {
    drawHeroFrame(painter, sheet, at(dx * 0.5, dy * 0.5, colors.edge));
  }
  painter.alpha(1);
  drawHeroFrame(painter, sheet, at(0, 0, null));
  context.restore();
}

function drawTitle(painter, { hero, ult, colors, slide }) {
  const x = VIEW_WIDTH / 2 + 46;
  drawText(painter, `${hero.name} - ultimate`, {
    x: x + slide * VIEW_WIDTH,
    y: BAND_Y + 8,
    color: colors.edge,
    align: 'center',
  });
  drawText(painter, ult.name, {
    x: x - slide * VIEW_WIDTH,
    y: BAND_Y + 18,
    color: colors.title,
    scale: 3,
    align: 'center',
  });
}

// the cut-in that plays while the world stands still: band, portrait and the ultimate's name
export function drawUltCutIn(painter, { game, view }) {
  const hero = heroById(game.settings.hero);
  const ult = ultimateOf(hero.id);
  const colors = HERO_THEMES[hero.id].ult;
  const slide = Math.max(0, 1 - (ult.intro - game.ultFreeze) / 8);
  drawBand(painter, game, colors);
  drawPortrait(painter, { view, game, colors, slide });
  drawTitle(painter, { hero, ult, colors, slide });
}
