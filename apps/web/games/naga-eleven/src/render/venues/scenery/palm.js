import { hash2 } from '../kit/hash.js';
import { line, plot, rect } from '../kit/raster.js';

// a sugar palm, the tree of the Cambodian plain: a tall bare trunk ringed with old leaf scars, and
// on top a round burst of fan leaves, lit from the top left, a few dead ones hanging beneath
function paintTrunk(raster, { x, base, top }, ramp) {
  rect(raster, { x: x - 1, y: top, width: 3, height: base - top }, ramp[1]);
  rect(raster, { x: x - 1, y: top, width: 1, height: base - top }, ramp[2]);
  rect(raster, { x: x + 1, y: top, width: 1, height: base - top }, ramp[0]);

  for (let y = top + 3; y < base; y += 5) {
    plot(raster, x, y, ramp[0]);
    plot(raster, x - 1, y + 1, ramp[3]);
  }
}

// a fan leaf: a stalk out from the crown and a spread of blades at its end
function paintLeaf(raster, { from, angle, length }, colour) {
  const tip = { x: from.x + Math.cos(angle) * length, y: from.y + Math.sin(angle) * length * 0.8 };

  line(raster, from, tip, colour);

  for (let blade = -2; blade <= 2; blade += 1) {
    const spread = angle + blade * 0.32;

    line(
      raster,
      tip,
      { x: tip.x + Math.cos(spread) * 4, y: tip.y + Math.sin(spread) * 3.2 },
      colour,
    );
  }
}

// a leaf pointing up and left catches the sun, one pointing down and right is in shade
function leafColour(angle, ramp, seed) {
  const lit = (-Math.cos(angle) - Math.sin(angle)) * 0.5 + 0.5 + (seed - 0.5) * 0.5;

  return ramp[Math.max(0, Math.min(ramp.length - 1, Math.round(lit * (ramp.length - 1))))];
}

export function paintSugarPalm(raster, { x, base, height, crown = 12 }, art) {
  const top = base - height;
  const centre = { x, y: top };

  paintTrunk(raster, { x, base, top: top + 2 }, art.trunk);

  for (let i = 0; i < 5; i += 1) {
    const sway = (hash2(x, i, 3) - 0.5) * 6;

    line(
      raster,
      { x: x + sway / 2, y: top + 2 },
      { x: x + sway, y: top + 8 + i * 2 },
      art.dead[i % 3],
    );
  }

  for (let i = 0; i < 40; i += 1) {
    const angle = (i / 40) * Math.PI * 2 + (hash2(x, i, 5) - 0.5) * 0.15;
    const length = crown * (0.78 + hash2(x, i, 7) * 0.22) * (Math.sin(angle) > 0.5 ? 0.8 : 1);

    paintLeaf(raster, { from: centre, angle, length }, leafColour(angle, art.leaf, hash2(x, i, 9)));
  }

  for (let ring = 0; ring < 3; ring += 1) {
    line(raster, { x: x - 2 + ring, y: top - 1 }, { x: x - 2 + ring, y: top + 1 }, art.leaf[0]);
  }
}
