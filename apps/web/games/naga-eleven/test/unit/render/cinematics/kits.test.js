import { describe, expect, it } from 'vitest';
import { CINE } from '../../../../src/art/cinematics/palette.js';
import { KITS } from '../../../../src/art/kits.js';
import { colourGap } from '../../../../src/render/actors/kit-clash.js';
import { kitsOf } from '../../../../src/render/cinematics/shared/kits.js';

const teamsOf = (first, second) => [
  { id: first, kit: first },
  { id: second, kit: second },
];

describe('the colours television paints a side in', () => {
  it('are the shirt, for a shirt that stands out on the navy panels', () => {
    const [cambodia, japan] = kitsOf(teamsOf('cambodia', 'japan'));

    expect(cambodia.band).toBe(KITS.cambodia.home.shirt);
    expect(japan.band).toBe(KITS.japan.home.shirt);
  });

  // Phnom Penh Elite's black bars read as empty tracks on the full-time board
  it('are the trim for a black or navy shirt, or silver when the trim is lost too', () => {
    const [, elite] = kitsOf(teamsOf('kampong-cham-high', 'phnom-penh-elite'));
    const [, riverside] = kitsOf(teamsOf('chrey-school', 'riverside-school'));

    expect(elite.band).toBe(KITS['phnom-penh-elite'].home.trim);
    expect(riverside.shirt).toBe(KITS['riverside-school'].away.shirt);
    expect(riverside.band).toBe(CINE.silver);
  });

  it('never sink into the panels, whichever two kits meet', () => {
    const ids = Object.keys(KITS);

    for (const first of ids) {
      for (const second of ids.filter((id) => id !== first)) {
        for (const kit of kitsOf(teamsOf(first, second))) {
          expect(colourGap(kit.band[2], CINE.panel[1]), `${first} v ${second}`).toBeGreaterThan(
            130,
          );
        }
      }
    }
  });
});
