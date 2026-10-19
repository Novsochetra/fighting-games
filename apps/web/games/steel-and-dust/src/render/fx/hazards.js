import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { GROUND_Y } from '../../config.js';
import { point } from '../painter.js';

function drawShockPeak(painter, x, height) {
  for (let row = 0; row <= height; row++) {
    const half = Math.round(((height - row) / height) * 3);
    painter.use(COLORS.outline).rect(x - half - 1, GROUND_Y - row, half * 2 + 3, 1);
  }
  for (let row = 0; row < height; row++) {
    const half = Math.round(((height - row) / height) * 3) - 1;
    if (half >= 0) {
      painter.use(FX_COLORS.shockLight).rect(x - half, GROUND_Y - row, half + 1, 1);
      painter.use(FX_COLORS.shockDark).rect(x + 1, GROUND_Y - row, half, 1);
    }
  }
}

export function drawShockwaves(painter, shockwaves) {
  for (const wave of shockwaves) {
    const size = Math.max(4, 14 - wave.time * 0.4);
    for (let peak = 0; peak < 3; peak++) {
      const height = Math.round(size - peak * 3.5);
      if (height >= 3) {
        drawShockPeak(painter, Math.round(wave.x - wave.direction * peak * 6), height);
      }
    }
  }
}

function drawKnife(painter, knife) {
  const angle = knife.time * 0.55 * knife.direction;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const tip = point(knife.x + cos * 4, knife.y + sin * 4);
  painter.use(COLORS.outline).line(point(knife.x - cos * 4, knife.y - sin * 4), tip, 3);
  painter.use(knife.color).line(point(knife.x - cos * 1, knife.y - sin * 1), tip, 1);
  const handle = knife.side === 'player' ? COLORS.gold : FX_COLORS.knifeHandle;
  painter.use(handle).rect(knife.x - cos * 3 - 0.5, knife.y - sin * 3 - 0.5, 2, 2);
}

// the sword's slash wave: a travelling crescent that fades at the end of its flight
function drawSlashWave(painter, wave) {
  const radius = 16;
  const centerX = wave.x - wave.direction * 10;
  painter.alpha(wave.time > 60 ? (70 - wave.time) / 10 : 1);
  for (let i = 0; i <= 16; i++) {
    const angle = -1.2 + (i * 2.4) / 16;
    const x = centerX + Math.cos(angle) * radius * wave.direction;
    const y = wave.y + Math.sin(angle) * radius * 1.2;
    const thickness = i > 3 && i < 13 ? 3 : 2;
    painter.use(wave.color).rect(x - 1, y - 1, thickness + 1, thickness + 1);
    if (i > 2 && i < 14) {
      painter.use(COLORS.white).rect(x - wave.direction * 2, y, 1, 1);
    }
  }
  painter.alpha(1);
}

export function drawProjectiles(painter, projectiles) {
  for (const shot of projectiles) {
    if (shot.kind === 'knife') {
      drawKnife(painter, shot);
    } else {
      drawSlashWave(painter, shot);
    }
  }
}
