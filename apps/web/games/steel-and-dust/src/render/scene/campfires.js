import { FX_COLORS } from '../../art/fx-colors.js';
import { VIEW_WIDTH } from '../../config.js';
import { FX_SPRITES } from '../../data/fx-sprites.js';
import { drawFxFrame } from '../fx/fx-sheets.js';

const MARGIN = 40;
const { frames, ticks } = FX_SPRITES.campfire;
// the firelight pools on the road and reaches up past the flames, faint layers adding up to a glow
// at the heart of the fire, as the temple braziers' light does
const GLOW_LAYERS = [
  [84, 5, 2],
  [62, 14, 10],
  [48, 24, 18],
  [36, 34, 27],
  [24, 44, 36],
  [12, 50, 44],
];
const GLOW = 0.05;
const FLICKER = 0.015;

// each fire flickers on its own beat, so two in view never burn in step
export function campfireFrame(fire, tick) {
  return Math.floor((tick + fire.x) / ticks) % frames;
}

function flickerOf(fire, tick) {
  return Math.sin(tick * 0.31 + fire.x) * 0.6 + Math.sin(tick * 0.83 + fire.x * 0.5) * 0.4;
}

function drawGlow(painter, fire, tick) {
  painter.use(FX_COLORS.campfireGlow).alpha(GLOW + flickerOf(fire, tick) * FLICKER);
  for (const [width, height, lift] of GLOW_LAYERS) {
    painter.rect(fire.x - width / 2, fire.y - lift, width, height);
  }

  painter.alpha(1);
}

export function drawCampfires(painter, sheets, { campfires, cameraX, tick }) {
  for (const fire of campfires) {
    if (fire.x > cameraX - MARGIN && fire.x < cameraX + VIEW_WIDTH + MARGIN) {
      const frame = campfireFrame(fire, tick);

      drawGlow(painter, fire, tick);
      drawFxFrame(painter, sheets, { name: 'campfire', frame, x: fire.x, y: fire.y });
    }
  }
}
