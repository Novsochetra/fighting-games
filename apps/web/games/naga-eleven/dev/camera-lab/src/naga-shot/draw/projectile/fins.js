import { hash } from '../../../../../../src/render/duel/hash.js';
import { polygon } from '../../../../../../src/render/duel/shapes.js';
import { FRAY_FROM } from './body.js';
import { ENERGY_HEX } from './pixels.js';

const { emerald, gold, flash } = ENERGY_HEX;

const WIDTHS = [0.9, 1, 0.8, 0.45, 0];

// A fin is a flame of the kbach, as the crest's are: a leaf swelling off the back, its tip
// hooked back the way the Naga came, gold round an emerald heart, flickering as it burns.
function flame(at, { height, width }) {
  const edges = WIDTHS.map((share, i) => {
    const step = i / (WIDTHS.length - 1);
    const rise = height * step;
    const sweep = height * 0.95 * step * step;
    const x = at.x + at.back.x * (at.radius * 0.5 + rise) - at.ahead.x * sweep;
    const y = at.y + at.back.y * (at.radius * 0.5 + rise) - at.ahead.y * sweep;
    const half = (share * width) / 2;

    return [
      [x + at.ahead.x * half, y + at.ahead.y * half],
      [x - at.ahead.x * half, y - at.ahead.y * half],
    ];
  });

  return [...edges.map(([front]) => front), ...edges.map(([, back]) => back).reverse()];
}

const flickerOf = (i, frame) => 0.8 + 0.4 * hash(i, Math.floor(frame / 3), 17);

// now and then a fin's tip catches the light, as gold does
function drawGlint(sheet, { tip, seed }) {
  if (seed > 0.16) {
    return;
  }

  const [x, y] = tip.map(Math.round);
  const reach = seed < 0.05 ? 2 : 1;

  sheet.rect([x - reach, y, reach * 2 + 1, 1], gold[3]);
  sheet.rect([x, y - reach, 1, reach * 2 + 1], gold[3]);
  sheet.dot(x, y, flash);
}

export function drawFins(sheet, { frames, frame }) {
  frames.forEach((at, i) => {
    if (i % 5 !== 1 || at.along < 0.08 || at.along > FRAY_FROM + 0.05) {
      return;
    }

    const height = (at.radius * 1.7 + 3) * flickerOf(i, frame);
    const width = Math.max(3, at.radius * 1.1);

    const outline = flame(at, { height, width });

    polygon(sheet, outline, gold[3]);
    polygon(sheet, flame(at, { height: height * 0.9, width: width * 0.7 }), gold[2]);
    polygon(sheet, flame(at, { height: height * 0.6, width: width * 0.35 }), emerald[3]);
    drawGlint(sheet, { tip: outline[WIDTHS.length - 1], seed: hash(i, Math.floor(frame / 3), 19) });
  });
}
