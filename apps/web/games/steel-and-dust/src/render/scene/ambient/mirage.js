import { CYCLE_WIDTH, TAU, fillClipped, scrollX, trait } from './motion.js';

const SALT = 17000;
const ROW_GAP = 2;
const STREAKS = 9;

// a streak trembles sideways and stretches, and its row jumps a pixel now and then: the
// horizon seems to boil the way hot air bends it
function streakAt(row, streak, { effect, tick, cameraX }) {
  const seed = row * 31 + streak + SALT;
  const length = 6 + Math.floor(trait(seed, 1) * 22);
  const tremble = Math.sin(tick * (0.09 + trait(seed, 2) * 0.08) + row * 1.7) * 1.5;
  const stretch = Math.round(Math.sin(tick * 0.03 + trait(seed, 3) * TAU) * 3);
  const baseX = trait(seed, 0) * CYCLE_WIDTH + tick * 0.02 + tremble;
  return {
    x: Math.round(scrollX(baseX, { cameraX, drift: effect.drift })),
    width: Math.max(2, length + stretch),
    shine: 0.5 + 0.5 * Math.sin(tick * (0.02 + trait(seed, 4) * 0.04) + trait(seed, 5) * TAU),
  };
}

function drawRow(painter, row, scene) {
  const { effect, tick } = scene;
  const rows = Math.max(1, Math.floor(effect.height / ROW_GAP));
  const y = effect.y + row * ROW_GAP + Math.round(Math.sin(tick * 0.11 + row * 2.3) * 0.6);
  const fade = 0.4 + (0.6 * (row + 1)) / rows;
  for (let streak = 0; streak < STREAKS; streak++) {
    const { x, width, shine } = streakAt(row, streak, scene);
    painter.alpha((0.12 + shine * 0.4) * fade);
    fillClipped(painter, { x, y, width, height: 1 });
  }
}

// odd rows mirror the sky and even rows catch the afterglow, as a mirage does
export function drawMirage(painter, { effect, tick, cameraX, colors }) {
  const [glow, sky] = colors.mirage;
  const rows = Math.max(1, Math.floor(effect.height / ROW_GAP));
  for (let row = 0; row < rows; row++) {
    painter.use(row % 2 ? sky : glow);
    drawRow(painter, row, { effect, tick, cameraX });
  }
  painter.alpha(1);
}
