import { mixes } from '../dither.js';
import { hash } from '../hash.js';
import { plot } from '../raster.js';
import { disc, line } from '../shapes.js';

// The sugar palm, tnaot, the tree of every Cambodian field: a tall bare trunk and a round head of
// stiff fan leaves, the old ones hanging dry below it. `colors` = { trunk: [shade, lit],
// leaf: [shade, base, lit], dead: [shade, lit] }; a silhouette's lit colours are its rim.

function paintTrunk(raster, { x, base, height, lean, colors, light }) {
  for (let row = 0; row <= height; row += 1) {
    const along = row / height;
    const column = Math.round(x + lean * along ** 1.6);
    const thick = height > 60 && along < 0.05 ? 3 : 1 + Number(height > 24);

    for (let i = 0; i < thick; i += 1) {
      const litSide = light > 0 ? i === thick - 1 : i === 0;
      const lit = thick > 1 && litSide && mixes(column, base - row, 0.6);

      plot(raster, column + i - Math.floor(thick / 2), base - row, colors.trunk[lit ? 1 : 0]);
    }
  }
}

function paintSkirt(raster, { x, y, crown, colors, seed }) {
  const count = Math.max(4, Math.round(crown * 1.2));

  for (let i = 0; i < count; i += 1) {
    const across = (i / (count - 1) - 0.5) * crown * 1.2;
    const length = crown * (0.5 + 0.5 * hash(seed, i, 7));
    const color = colors.dead[hash(seed, i, 8) > 0.6 ? 1 : 0];

    line(
      raster,
      { from: { x: x + across * 0.5, y }, to: { x: x + across * 1.1, y: y + length } },
      color,
    );
  }
}

function fanColor(colors, { facing, radius, edge }) {
  if (facing > 0.15 && radius > edge - 1.4) {
    return colors.leaf[2];
  }

  return colors.leaf[facing > 0.55 && radius > edge * 0.6 ? 1 : 0];
}

function paintFan(raster, { center, angle, reach, colors, light }) {
  const spread = 0.3;
  const step = 1 / (reach * 2.2);

  for (let turn = -spread; turn <= spread; turn += step) {
    const spike = Math.floor((turn + spread) / (step * 2)) % 2;
    const edge = reach * (0.78 + 0.22 * spike) * (1 - Math.abs(turn) * 0.6);
    const along = angle + turn;
    const facing = Math.cos(along) * light * 0.9 + Math.sin(along) * 0.5;

    for (let radius = reach * 0.45; radius <= edge; radius += 0.5) {
      const color = fanColor(colors, { facing, radius, edge });

      plot(raster, center.x + Math.cos(along) * radius, center.y - Math.sin(along) * radius, color);
    }
  }
}

function paintCrown(raster, { center, crown, colors, light, seed }) {
  const count = 11;

  disc(raster, { x: center.x, y: center.y, radius: crown * 0.3 }, colors.leaf[0]);

  for (let i = 0; i < count; i += 1) {
    const angle = -0.7 + (i / (count - 1)) * (Math.PI + 1.4) + (hash(seed, i, 3) - 0.5) * 0.3;
    const reach = crown * (0.8 + 0.35 * hash(seed, i, 4));
    const stalk = {
      x: center.x + Math.cos(angle) * reach * 0.5,
      y: center.y - Math.sin(angle) * reach * 0.5,
    };

    line(raster, { from: center, to: stalk }, colors.leaf[0]);
    paintFan(raster, { center, angle, reach, colors, light });
  }
}

// `base` is where the trunk meets the ground, `sway` shifts the head a pixel in the wind
export function paintSugarPalm(raster, palm) {
  const { x, base, height, lean = 0, crown, colors, sway = 0, light = 1, seed = 1 } = palm;
  const center = { x: Math.round(x + lean + sway), y: base - height };

  paintTrunk(raster, { x, base, height, lean, colors, light });
  paintSkirt(raster, { x: center.x, y: center.y + 1, crown, colors, seed });
  paintCrown(raster, { center, crown, colors, light, seed });
}
