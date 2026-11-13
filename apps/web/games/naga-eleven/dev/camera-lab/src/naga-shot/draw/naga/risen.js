import { shiftedPen } from '../../../../../../src/render/duel/pen.js';
import { canBake } from '../bake.js';
import { auraBake } from './aura.js';
import { figureLayout } from './bakes.js';
import { levelOf, LEVELS } from './dither.js';
import { drawEyeFire } from './eyes.js';
import { drawGround } from './ground.js';
import { GAPES, eyeMiddle, paintFigure } from './figure.js';
import { FLICKER_PHASES, flickerBake } from './flicker.js';
import { fadeInBake, revealBake, rimBake, silhouetteBake } from './looks.js';
import { drawPulse } from './pulse.js';

const FLICKER_TICKS = 5;

const BOB_TICKS = 12;

function layersOf(naga, look) {
  if (naga.colour <= 0) {
    const level = levelOf(naga.silhouette);

    if (level <= 0) {
      return [];
    }

    return level >= LEVELS ? [silhouetteBake(look)] : [fadeInBake(look, level)];
  }

  if (naga.colour < 1) {
    return [silhouetteBake(look), revealBake(look, levelOf(naga.colour))];
  }

  const flicker = Math.floor(naga.breath / FLICKER_TICKS) % FLICKER_PHASES;

  return [auraBake(look, flicker), flickerBake(look, flicker)];
}

function stampAbove(pen, canvas, { left, top, floor }) {
  const rows = Math.min(canvas?.height ?? 0, floor - top);

  if (rows <= 0) {
    return;
  }

  const { context, unit, origin } = pen;

  context.save();
  context.imageSmoothingEnabled = false;
  context.drawImage(
    canvas,
    ...[0, 0, canvas.width, rows],
    ...[origin.x + left * unit, origin.y + top * unit, canvas.width * unit, rows * unit],
  );
  context.restore();
}

function drawFigure(pen, { naga, at, look, floor }) {
  if (!canBake()) {
    paintFigure(shiftedPen(pen, at.x, at.y), { ...look, floor: floor - at.y });

    return;
  }

  const layout = figureLayout(look);
  const place = { left: at.x + layout.left, top: at.y + layout.top, floor };

  layersOf(naga, look).forEach((canvas) => stampAbove(pen, canvas, place));

  if (naga.pulse >= 0 && naga.pulse < 2) {
    stampAbove(pen, rimBake(look), place);
  }
}

export function drawRisen(pen, naga, { floor }) {
  const look = { size: naga.size, gape: GAPES[naga.pulse >= 0 ? 1 : 0] };
  const bob = naga.pulse >= 0 && Math.floor(naga.breath / BOB_TICKS) % 2 === 1 ? -1 : 0;
  const at = { x: Math.round(naga.x), y: Math.round(naga.y) + bob };
  const eye = eyeMiddle(look.size);

  drawPulse(pen, { at, pulse: naga.pulse });
  drawFigure(pen, { naga, at, look, floor });
  drawGround(pen, { at, size: look.size, floor, ticks: naga.breath });

  if (at.y + eye.y < floor - 2) {
    drawEyeFire(pen, { at, size: look.size, eyes: naga.eyes, lit: naga.lit ?? -1 });
  }
}
