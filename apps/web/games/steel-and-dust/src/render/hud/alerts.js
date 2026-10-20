import { COLORS } from '../../art/colors.js';
import { VIEW_HEIGHT, VIEW_WIDTH } from '../../config.js';
import { clamp } from '../../lib/math.js';
import { currentZone } from '../../sim/stage/mission.js';
import { BANNER_FOREVER } from '../../sim/stage/stage-clear.js';
import { drawText } from '../text/draw-text.js';
import { drawBar } from './bar.js';

export function drawBossBar(painter, boss) {
  if (!boss || boss.state === 'ko' || boss.entering) {
    return;
  }
  painter
    .alpha(0.55)
    .use(COLORS.night)
    .rect(36, VIEW_HEIGHT - 22, VIEW_WIDTH - 72, 19);
  painter.alpha(1);
  drawText(painter, boss.def.name, { x: 40, y: VIEW_HEIGHT - 19, color: COLORS.coral });
  drawBar(painter, {
    x: 40,
    y: VIEW_HEIGHT - 11,
    width: VIEW_WIDTH - 80,
    height: 5,
    fraction: boss.hp / boss.maxHp,
    lag: boss.hpLag / boss.maxHp,
    color: COLORS.red,
  });
}

export function drawGoArrow(painter, game) {
  if (game.goArrowTime <= 0 || game.arena || !currentZone(game)) {
    return;
  }
  const step = (game.tickCount >> 2) % 6;
  const color = (game.goArrowTime >> 4) & 1 ? COLORS.amber : COLORS.butter;
  drawText(painter, 'GO', { x: VIEW_WIDTH - 26, y: 92, color, scale: 2, align: 'right' });
  for (let i = 0; i < 3; i++) {
    const arrowColor = i === step % 3 ? COLORS.white : COLORS.amber;
    drawText(painter, '>', {
      x: VIEW_WIDTH - 20 + i * 5 + (step >> 1),
      y: 92,
      color: arrowColor,
      scale: 2,
    });
  }
}

function drawEdgeArrow(painter, game, enemy) {
  const screenX = enemy.x - game.camera.x;
  if (screenX > -2 && screenX < VIEW_WIDTH + 2) {
    return;
  }
  const onLeft = screenX < 0;
  const y = clamp(enemy.y - 18 * enemy.scale, 40, VIEW_HEIGHT - 30);
  const x = onLeft ? 4 : VIEW_WIDTH - 5;
  if (!((game.tickCount >> 3) & 1)) {
    return;
  }
  painter.alpha(0.9);
  for (let i = 0; i < 4; i++) {
    painter
      .use(enemy.def.boss ? COLORS.scarlet : COLORS.red)
      .rect(onLeft ? x + i : x - i, y - i, 1, i * 2 + 1);
  }
  painter.alpha(1);
}

// raiders still off screen get an arrow at the edge
export function drawOffscreenArrows(painter, game) {
  if (game.mode !== 'play') {
    return;
  }
  for (const enemy of game.fighters) {
    if (enemy.side === 'enemy' && enemy.state !== 'ko') {
      drawEdgeArrow(painter, game, enemy);
    }
  }
}

export function drawBanner(painter, banner) {
  if (!banner) {
    return;
  }
  banner.startTime ||= banner.time;
  const age = banner.startTime - banner.time;
  const blink = banner.time < BANNER_FOREVER && banner.time < 20 && (banner.time >> 1) % 2;
  if (blink) {
    return;
  }
  const slide = age < 6 ? (6 - age) * 10 : 0;
  drawText(painter, banner.text, {
    x: VIEW_WIDTH / 2 + slide,
    y: 78,
    color: banner.color,
    scale: 3,
    align: 'center',
  });
  if (banner.sub) {
    drawText(painter, banner.sub, {
      x: VIEW_WIDTH / 2 - slide,
      y: 70,
      color: COLORS.sand,
      align: 'center',
    });
  }
}
