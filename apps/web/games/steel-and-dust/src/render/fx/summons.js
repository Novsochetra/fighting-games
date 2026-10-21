import { FX_COLORS } from '../../art/fx-colors.js';
import { FX_SPRITES } from '../../data/fx-sprites.js';
import { drawFxFrame, fxFrameAt } from './fx-sheets.js';
import { drawLion } from './lion.js';

// the encasing spikes grow, then hold at full height until the ice shatters
const ICE_HOLD_FRAMES = [4, 5, 6, 7];
const STAG_ECHOES = 2;
const PHOENIX_ECHOES = 2;

function drawThorn(painter, sheets, thorn) {
  const frame = fxFrameAt('thorns', thorn.time);
  drawFxFrame(painter, sheets, {
    name: 'thorns',
    frame,
    x: thorn.x,
    y: thorn.y,
    scale: thorn.scale,
  });
}

function iceFrame(ice) {
  const grown = Math.floor(ice.time / FX_SPRITES.ice.ticks);
  if (grown < ICE_HOLD_FRAMES[0]) {
    return grown;
  }
  return ICE_HOLD_FRAMES[Math.floor(ice.time / 6) % ICE_HOLD_FRAMES.length];
}

function drawIce(painter, sheets, ice) {
  painter.alpha(0.85);
  const at = { name: 'ice', frame: iceFrame(ice), x: ice.x, y: ice.y, scale: ice.scale * 0.95 };
  drawFxFrame(painter, sheets, at);
  painter.alpha(1);
}

// a spirit stag is see-through, with a couple of fading echoes trailing its gallop
function drawStag(painter, sheets, stag) {
  const { ticks, frames } = FX_SPRITES.stag;
  for (let echo = STAG_ECHOES; echo >= 0; echo--) {
    const time = Math.max(0, stag.time - echo * 3);
    const x = stag.x - stag.direction * echo * stag.speed * 3;
    painter.alpha(echo ? 0.22 / echo : 0.9);
    drawFxFrame(painter, sheets, {
      name: 'stag',
      frame: Math.floor(time / ticks) % frames,
      x,
      y: stag.y,
      scale: stag.scale,
      facing: stag.direction,
      tint: echo ? FX_COLORS.spiritFlame : null,
    });
  }
  painter.alpha(1);
}

function drawFirefly(painter, sheets, fly) {
  const { ticks, frames } = FX_SPRITES.firefly;
  const frame = Math.floor(fly.time / ticks) % frames;
  drawFxFrame(painter, sheets, { name: 'firefly', frame, x: fly.x, y: fly.y, scale: 1.6 });
}

function drawPillar(painter, sheets, pillar) {
  const frame = fxFrameAt('pillar', pillar.time);
  drawFxFrame(painter, sheets, {
    name: 'pillar',
    frame,
    x: pillar.x,
    y: pillar.y,
    scale: pillar.scale,
  });
}

// see-through, so the raider shows through the flames licking up it
function drawBurn(painter, sheets, burn) {
  const { ticks, frames } = FX_SPRITES.burn;
  const frame = Math.floor(burn.time / ticks) % frames;
  painter.alpha(0.85);
  drawFxFrame(painter, sheets, { name: 'burn', frame, x: burn.x, y: burn.y, scale: burn.scale });
  painter.alpha(1);
}

// the firebird leaves fading afterimages of itself along its flight
function drawPhoenix(painter, sheets, phoenix) {
  const { ticks, frames } = FX_SPRITES.phoenix;
  for (let echo = PHOENIX_ECHOES; echo >= 0; echo--) {
    const time = Math.max(0, phoenix.time - echo * 2);
    painter.alpha(echo ? 0.3 / echo : 1);
    drawFxFrame(painter, sheets, {
      name: 'phoenix',
      frame: Math.floor(time / ticks) % frames,
      x: phoenix.x - phoenix.direction * echo * 12,
      y: phoenix.y,
      scale: phoenix.scale,
      facing: phoenix.direction,
    });
  }
  painter.alpha(1);
}

function drawBurst(painter, sheets, burst) {
  const frame = fxFrameAt(burst.sprite, burst.time);
  drawFxFrame(painter, sheets, {
    name: burst.sprite,
    frame,
    x: burst.x,
    y: burst.y,
    scale: burst.scale,
    facing: burst.direction,
  });
}

const DRAW_BY_KIND = {
  thorn: drawThorn,
  ice: drawIce,
  stag: drawStag,
  firefly: drawFirefly,
  burst: drawBurst,
  pillar: drawPillar,
  burn: drawBurn,
  phoenix: drawPhoenix,
  lion: drawLion,
};

// relief soldiers are drawn from a hero's own sheet, behind the fighters (soldiers.js)
export function drawSummons(painter, summons, sheets) {
  for (const summon of summons) {
    const draw = DRAW_BY_KIND[summon.kind];
    if (summon.time > 0 && draw) {
      draw(painter, sheets, summon);
    }
  }
}
