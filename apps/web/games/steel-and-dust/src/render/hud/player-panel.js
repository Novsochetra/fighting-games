import { COLORS } from '../../art/colors.js';
import { drawBar } from './bar.js';
import { drawBoxStamped } from './box-stamp.js';
import { drawPlaque } from './hud-frames.js';
import { drawLives, LIVES_WIDTH } from './lives.js';
import { LIVES_BOX, ROW_ONE, ROW_TWO, VITALS_BOX } from './top-bar.js';
import { drawUltGauge } from './ult-gauge.js';
import { drawWeaponBox } from './weapon-box.js';

const BAR_INSET = 6;
const BAR_X = VITALS_BOX.x + BAR_INSET;
const BAR_WIDTH = VITALS_BOX.width - BAR_INSET * 2;

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
    x: BAR_X,
    y: ROW_ONE - 1,
    width: BAR_WIDTH,
    height: 6,
    fraction,
    lag: player.hpLag / player.maxHp,
    color: healthColor(fraction, tickCount),
  });
}

function drawLivesBox(painter, game, view) {
  drawBoxStamped(painter, {
    key: `lives|${game.lives}`,
    box: LIVES_BOX,
    ready: Boolean(view.hudFrames.ready.panel),
    draw: (inner) => {
      drawPlaque(inner, view.hudFrames, 'panel', LIVES_BOX);
      drawLives(inner, {
        lives: game.lives,
        x: LIVES_BOX.x + Math.floor((LIVES_BOX.width - LIVES_WIDTH) / 2),
        y: LIVES_BOX.y + 5,
      });
    },
  });
}

// the weapon in one box, health over the ULT gauge in the next, and the lives under the weapon
export function drawPlayerPanel(painter, game, view) {
  drawWeaponBox(painter, game, view);
  drawPlaque(painter, view.hudFrames, 'panel', VITALS_BOX);
  drawHealth(painter, game.player, game.tickCount);
  drawUltGauge(painter, game, { x: BAR_X, y: ROW_TWO, width: BAR_WIDTH });
  drawLivesBox(painter, game, view);
}
