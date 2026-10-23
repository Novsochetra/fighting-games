import { COLORS } from '../../art/colors.js';
import { drawText } from '../text/draw-text.js';
import { drawBar } from './bar.js';
import { drawHudFrame } from './hud-frames.js';
import { drawLives, LIVES_WIDTH } from './lives.js';
import { HERO_PLAQUE, ROW_ONE, ROW_TWO } from './top-bar.js';
import { drawUltGauge } from './ult-gauge.js';
import { drawWeaponSlot } from './weapon-slot.js';

const VITALS_X = 52;
const VITALS_RIGHT = 201;

function healthColor(fraction, tickCount) {
  if (fraction > 0.5) {
    return COLORS.mint;
  }
  if (fraction > 0.25) {
    return COLORS.amber;
  }
  return (tickCount >> 3) & 1 ? COLORS.red : COLORS.salmon;
}

function drawHealth(painter, player, tickCount) {
  const fraction = player.hp / player.maxHp;
  drawBar(painter, {
    x: VITALS_X,
    y: ROW_ONE - 1,
    width: 132,
    height: 6,
    fraction,
    lag: player.hpLag / player.maxHp,
    color: healthColor(fraction, tickCount),
  });
  drawText(painter, `${Math.ceil(player.hp)}`, {
    x: VITALS_RIGHT,
    y: ROW_ONE,
    color: fraction <= 0.25 ? COLORS.salmon : COLORS.lilac,
    align: 'right',
  });
}

// two rows: the health bar over the ULT gauge and the lives, beside the weapon slot
export function drawPlayerPanel(painter, game, view) {
  const { width, height } = HERO_PLAQUE;
  painter
    .alpha(0.55)
    .use(COLORS.night)
    .rect(2, 2, width - 4, height - 4);
  painter.alpha(1);
  drawHudFrame(painter, view.hudFrames, 'panel', HERO_PLAQUE);
  drawWeaponSlot(painter, game);
  drawHealth(painter, game.player, game.tickCount);
  drawUltGauge(painter, game, { x: VITALS_X, y: ROW_TWO });
  drawLives(painter, { lives: game.lives, x: VITALS_RIGHT - LIVES_WIDTH, y: ROW_TWO });
}
