import { COLORS } from '../../art/colors.js';
import { FX_COLORS } from '../../art/fx-colors.js';
import { FX_SPRITES } from '../../data/fx-sprites.js';
import { point } from '../painter.js';
import { drawBolt, drawBomb, drawFire, drawSand, drawVenom } from './enemy-shots.js';
import { BOSS_HAZARD_DRAWERS } from './boss-hazards.js';
import { drawFxFrame } from './fx-sheets.js';
import { drawLandingShadow } from './rock-hazards.js';
import { drawStrikeMark } from './storm-hazards.js';

function drawShockPeak(painter, { x, y, height }) {
  for (let row = 0; row <= height; row++) {
    const half = Math.round(((height - row) / height) * 3);
    painter.use(COLORS.outline).rect(x - half - 1, y - row, half * 2 + 3, 1);
  }
  for (let row = 0; row < height; row++) {
    const half = Math.round(((height - row) / height) * 3) - 1;
    if (half >= 0) {
      painter.use(FX_COLORS.shockLight).rect(x - half, y - row, half + 1, 1);
      painter.use(FX_COLORS.shockDark).rect(x + 1, y - row, half, 1);
    }
  }
}

export function drawShockwaves(painter, shockwaves) {
  for (const wave of shockwaves) {
    const size = Math.max(4, 14 - wave.time * 0.4);
    for (let peak = 0; peak < 3; peak++) {
      const height = Math.round(size - peak * 3.5);
      if (height >= 3) {
        const x = Math.round(wave.x - wave.direction * peak * 6);
        drawShockPeak(painter, { x, y: wave.y, height });
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

// a crescent wave loops its strip as it skims the road
function drawCrescent(painter, wave, sheets) {
  const { frames, ticks } = FX_SPRITES.crescent;
  const frame = Math.floor(wave.time / ticks) % frames;
  drawFxFrame(painter, sheets, {
    name: 'crescent',
    frame,
    x: wave.x,
    y: wave.y,
    facing: wave.direction,
  });
}

// the shadow of a pouncer grows and darkens on the spot as he comes down
function drawPounceMark(painter, mark) {
  const left = mark.life - mark.time;
  drawLandingShadow(painter, { x: mark.x, floor: mark.y, y: mark.y - left * 5, time: mark.time });
}

const DRAW_SHOT = {
  knife: drawKnife,
  wave: drawSlashWave,
  bolt: drawBolt,
  sand: drawSand,
  venom: drawVenom,
  bomb: drawBomb,
  fire: drawFire,
  crescent: drawCrescent,
  pounceMark: drawPounceMark,
  ...BOSS_HAZARD_DRAWERS,
};

// what lies flat on the road is drawn under the fighters' feet
const ON_GROUND = new Set(['puddle', 'pounceMark', 'lavaPool', 'canopic']);
// what strikes from above has its spot marked on the road under the fighters, and itself over them
const GROUND_MARK = { stormStrike: drawStrikeMark };

export function drawProjectiles(painter, projectiles, fxSheets) {
  for (const shot of projectiles) {
    if (!ON_GROUND.has(shot.kind)) {
      DRAW_SHOT[shot.kind](painter, shot, fxSheets);
    }
  }
}

export function drawGroundHazards(painter, projectiles, fxSheets) {
  for (const shot of projectiles) {
    if (ON_GROUND.has(shot.kind)) {
      DRAW_SHOT[shot.kind](painter, shot, fxSheets);
    }
    GROUND_MARK[shot.kind]?.(painter, shot);
  }
}
