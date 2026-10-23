import { describe, expect, it } from 'vitest';
import { RENDER_SCALE } from '../../../src/config.js';
import { GUARD_GLINT } from '../../../src/sim/bosses/guard-counter.js';
import { lowestRow, readSheet } from '../../support/sheet-cells.js';

// Bug: the Warden Ox's own strips stood a pixel higher than his first ones, his knock-out floated
// and sank while he lay still, his guard blinked his hammer out of sight every few ticks, and his
// flinch had a slit cut through his neck and breastplate where a hit splash was keyed out
const { sprite, image, cellOf } = readSheet('ox');
const SKILLS = ['chainHook', 'guardCounter', 'execution'];
const isSteel = ([red, green, blue]) =>
  Math.max(red, green, blue) - Math.min(red, green, blue) < 48 && blue > 90;

describe('the Warden Ox, strip to strip', () => {
  it('stands every frame of his own strips on the line his idle frames stand on', () => {
    const feet = lowestRow(image, cellOf('idle', 0));
    for (const strip of SKILLS) {
      for (let frame = 0; frame < sprite.strips[strip].frames; frame++) {
        expect(lowestRow(image, cellOf(strip, frame)), `${strip} ${frame}`).toBe(feet);
      }
    }
  });

  it('lies on the road his feet stand on once he is knocked down', () => {
    const feet = lowestRow(image, cellOf('idle', 0));
    for (const frame of [5, 6, 7, 8]) {
      expect(lowestRow(image, cellOf('ko', frame)), `ko ${frame}`).toBe(feet);
    }
  });

  it('keeps the hammer up in front of him all through his guard', () => {
    for (const frame of [2, 3]) {
      const cell = cellOf('guardCounter', frame);
      const x = cell.left + sprite.feetX + Math.round(GUARD_GLINT.ahead * RENDER_SCALE);
      const y = cell.top + sprite.feetY - Math.round(GUARD_GLINT.up * RENDER_SCALE);
      expect(image.alpha(x, y) > 0 && isSteel(image.rgb(x, y)), `frame ${frame}`).toBe(true);
    }
  });

  it('flinches with his neck and breastplate whole', () => {
    const cell = cellOf('hurt', 0);
    let holes = 0;
    for (let y = 84; y <= 108; y++) {
      for (let x = 117; x <= 124; x++) {
        holes += image.alpha(cell.left + x, cell.top + y) > 0 ? 0 : 1;
      }
    }
    expect(holes).toBe(0);
  });
});
