import { fillClipped, scrollX } from './motion.js';

const ROW = 2;
const MARGIN = 24;

// a far dust devil spins up, wanders downwind across the mesas and dies away, once a period
function devilNow(effect, tick) {
  const round = Math.floor(tick / effect.period);
  const age = tick - round * effect.period;
  const life = effect.period * 0.6;
  return age < life ? { progress: age / life, round } : null;
}

// the funnel narrows to a thread at the ground, leans downwind and frays out at the top
function rowAt(row, { effect, tick, progress }) {
  const rise = (row * ROW) / effect.height;
  const width = Math.round(2 + rise * rise * 16);
  const twist = Math.sin(tick * 0.13 - row * 0.45) * (0.5 + rise * 3);
  const fray = Math.min(1, (1 - rise) * 4);
  return { offset: Math.round(twist - rise * 7 - progress * 2), width, fray };
}

// a dusky body with a sunlit edge, so the funnel shows against the bright sky and the dark rock
export function drawDevil(painter, { effect, tick, cameraX, colors }) {
  const now = devilNow(effect, tick);
  if (!now) {
    return;
  }
  const wander = Math.sin(tick * 0.006 + now.round) * 18 - now.progress * 70;
  const baseX = scrollX(effect.x + wander, { cameraX, drift: effect.drift, margin: MARGIN });
  const fade = Math.sin(Math.PI * now.progress);
  const [body, rim] = colors.devil;
  for (let row = 0; row * ROW < effect.height; row++) {
    const { offset, width, fray } = rowAt(row, { effect, tick, progress: now.progress });
    const box = { x: Math.round(baseX + offset - width / 2), y: effect.y - (row + 1) * ROW };
    painter.use(body).alpha(0.42 * fade * fray);
    fillClipped(painter, { ...box, width, height: ROW });
    painter.use(rim).alpha(0.5 * fade * fray);
    fillClipped(painter, { ...box, width: 1, height: ROW });
  }
  painter.use(body).alpha(0.2 * fade);
  fillClipped(painter, { x: Math.round(baseX) - 8, y: effect.y - 2, width: 16, height: 2 });
  painter.alpha(1);
}
