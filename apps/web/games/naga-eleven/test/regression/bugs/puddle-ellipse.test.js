import { describe, expect, it } from 'vitest';
import { VILLAGE_FIELD } from '../../../src/art/venues/village-field.js';
import { FORMATS } from '../../../src/data/formats.js';
import { packAll } from '../../../src/render/venues/kit/colour.js';
import { villageSurface } from '../../../src/render/venues/village-field/ground.js';

// The village field's puddle was a perfect ellipse of water striped with a light row every five,
// with no mud round it: it read as a sticker on the grass. It has an uneven shore, a rim of mud,
// the far bank and the sky in it, and the rings of a drop.

const art = packAll(VILLAGE_FIELD);
const layout = { pitch: FORMATS['7'].pitch };
const surface = villageSurface(layout, art);
const centre = { x: layout.pitch.length * 0.23, y: layout.pitch.width * 0.72 };
// the old puddle's ellipse
const OLD = { radiusX: 52, radiusY: 22 };

const WATER = new Set(art.water);
const MUD = new Set(art.dirt.slice(0, 2));

// the ground round the puddle, a sample every half world unit
function samples() {
  const found = [];

  for (let dy = -40; dy <= 40; dy += 0.5) {
    for (let dx = -120; dx <= 120; dx += 0.5) {
      const x = centre.x + dx;
      const y = centre.y + dy;
      const column = Math.round(dx * 2) + 400;
      const row = Math.round(dy * 2) + 200;

      found.push({ dx, dy, row, colour: surface(x, y, column, row) });
    }
  }

  return found;
}

const insideOld = ({ dx, dy }) => (dx / OLD.radiusX) ** 2 + (dy / OLD.radiusY) ** 2 < 1;

describe('the village puddle', () => {
  const ground = samples();
  const water = ground.filter(({ colour }) => WATER.has(colour));

  it('has a shore of its own, not an ellipse’s', () => {
    expect(water.filter((point) => !insideOld(point)).length).toBeGreaterThan(200);
    expect(
      ground.filter((point) => insideOld(point) && !WATER.has(point.colour)).length,
    ).toBeGreaterThan(200);
  });

  it('lies in a rim of wet mud', () => {
    expect(ground.filter(({ colour }) => MUD.has(colour)).length).toBeGreaterThan(400);
  });

  it('holds the far bank dark along its far shore and the sky light in its middle', () => {
    const far = water.filter(({ dy }) => dy < -8);
    const middle = water.filter(({ dy, dx }) => Math.abs(dy) < 4 && Math.abs(dx) < 20);

    expect(far.filter(({ colour }) => colour === art.water[0]).length).toBeGreaterThan(20);
    expect(middle.filter(({ colour }) => colour === art.water[0]).length).toBe(0);
  });

  it('shows the rings of a drop, lit on their far side', () => {
    const lit = water.filter(({ colour }) => colour === art.water[5]);

    expect(lit.length).toBeGreaterThan(60);
  });

  it('is no longer striped with a light row every five', () => {
    const toneOf = (colour) => art.water.indexOf(colour);
    const means = [0, 1, 2, 3, 4].map((stripe) => {
      const tones = water
        .filter(({ row }) => row % 5 === stripe)
        .map(({ colour }) => toneOf(colour));

      return tones.reduce((sum, tone) => sum + tone, 0) / tones.length;
    });

    expect(Math.max(...means) - Math.min(...means)).toBeLessThan(0.2);
  });
});
