import { describe, expect, it } from 'vitest';
import { ENEMY_SPRITES } from '../../../src/data/enemies/enemy-sprites.js';
import { FX_SPRITES } from '../../../src/data/fx-sprites.js';
import { RENDER_SCALE } from '../../../src/config.js';
import { POINTED_ORB, SUN } from '../../../src/sim/bosses/sun-curse.js';
import { THRUST_ORB } from '../../../src/sim/hazards/mirage-bolts.js';
import { readPngAlpha } from '../../support/png-alpha.js';

const GAME = new URL('../../../', import.meta.url);
const sprite = ENEMY_SPRITES.pharaoh;
const sheet = readPngAlpha(new URL(`assets/sprites/enemies/${sprite.file}`, GAME));
// the sheet pixel under a point on his body (body-point.js): his art is drawn at his scale, so a
// point in his own units lies RENDER_SCALE sheet pixels per unit from his feet whatever his scale
function pixelAt(strip, frame, { ahead, up }) {
  const x = frame * sprite.frameWidth + sprite.feetX + Math.round(ahead * RENDER_SCALE);
  const y =
    sprite.strips[strip].row * sprite.frameHeight + sprite.feetY - Math.round(up * RENDER_SCALE);
  return { alpha: sheet.alpha(x, y), rgb: sheet.rgb(x, y) };
}

// the orb is blue with a white-hot core
const isOrbBlue = ({ alpha, rgb: [red, green, blue] }) =>
  alpha > 0 && blue > 180 && (blue - red > 60 || (red > 200 && green > 200));
function lowestRow(strip, frame) {
  const top = sprite.strips[strip].row * sprite.frameHeight;
  for (let y = sprite.frameHeight - 1; y >= 0; y--) {
    for (let x = 0; x < sprite.frameWidth; x++) {
      if (sheet.alpha(frame * sprite.frameWidth + x, top + y) > 0) {
        return y;
      }
    }
  }
  return -1;
}

const isSunlit = ({ alpha, rgb: [red, green] }) => alpha > 0 && red > 180 && green > 140;

// what flies or bursts from his staff starts on the staff's orb as the art draws it
describe("the Sand Pharaoh's art and his spells", () => {
  it('pour the scarabs and fire the mirage bolts from the orb he thrusts low', () => {
    expect(isOrbBlue(pixelAt('scarabCarpet', 3, THRUST_ORB))).toBe(true);
  });

  it('burst the broken sun where the sun burns over his staff', () => {
    for (const frame of [4, 5, 6, 7]) {
      const pixel = pixelAt('curseOfSun', frame, SUN);
      expect(isOrbBlue(pixel) || isSunlit(pixel), `frame ${frame}`).toBe(true);
    }
  });

  it('flash the curse going off from the orb he points at the hero', () => {
    expect(isOrbBlue(pixelAt('curseOfSun', 9, POINTED_ORB))).toBe(true);
  });

  // he stands on the same line as in his idle frames; only sand and sparks stray a pixel
  it('stand his own strips on the line his idle frames stand on', () => {
    const idleFeet = lowestRow('idle', 0);
    for (const strip of ['mirage', 'scarabCarpet', 'curseOfSun']) {
      const last = sprite.strips[strip].frames - 1;
      expect(lowestRow(strip, 0), strip).toBe(idleFeet);
      expect(lowestRow(strip, last), strip).toBe(idleFeet);
      for (let frame = 1; frame < last; frame++) {
        expect(
          Math.abs(lowestRow(strip, frame) - idleFeet),
          `${strip} ${frame}`,
        ).toBeLessThanOrEqual(1);
      }
    }
  });

  // a fighter's feet are drawn a sheet pixel into the road, so what crawls or stands there is too
  it('stand the scarabs, the jars and the sunfall on the road as his feet stand on it', () => {
    for (const name of ['scarab', 'canopic', 'sunfall']) {
      const { frameWidth, frameHeight, frames, anchorY } = FX_SPRITES[name];
      const strip = readPngAlpha(new URL(`assets/sprites/fx/${name}.png`, GAME));
      let lowest = 0;
      for (let x = 0; x < frameWidth * frames; x++) {
        for (let y = 0; y < frameHeight; y++) {
          lowest = strip.alpha(x, y) > 0 ? Math.max(lowest, y) : lowest;
        }
      }
      expect(lowest - anchorY, name).toBe(sprite.frameHeight - sprite.feetY - 2);
    }
  });

  // art that touches its frame's edge was cut off there; only the ground may be touched
  it('cut off nothing at the sides or the top of any frame', () => {
    const strips = [
      ...['mirage', 'scarabCarpet', 'curseOfSun'].map((strip) => ({
        image: sheet,
        top: sprite.strips[strip].row * sprite.frameHeight,
        ...sprite,
        frames: sprite.strips[strip].frames,
        name: strip,
      })),
      ...['scarab', 'canopic', 'curse', 'sunfall', 'mirageBolt'].map((name) => ({
        image: readPngAlpha(new URL(`assets/sprites/fx/${name}.png`, GAME)),
        top: 0,
        ...FX_SPRITES[name],
        name,
      })),
    ];
    for (const { image, top, frameWidth, frameHeight, frames, name } of strips) {
      for (let frame = 0; frame < frames; frame++) {
        const left = frame * frameWidth;
        const edge = [];
        for (let y = 0; y < frameHeight; y++) {
          edge.push(image.alpha(left, top + y), image.alpha(left + frameWidth - 1, top + y));
        }
        for (let x = 0; x < frameWidth; x++) {
          edge.push(image.alpha(left + x, top));
        }
        expect(Math.max(...edge), `${name} ${frame}`).toBe(0);
      }
    }
  });
});
