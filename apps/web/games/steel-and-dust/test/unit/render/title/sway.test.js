import { describe, expect, it } from 'vitest';
import { drawSway, swayAt, swayOffset } from '../../../../src/render/title/sway.js';
import { PAINTING, drawnRows, record, ticksUpTo } from './title-recorder.js';

const CROWNS = [
  { left: 10, right: 40, top: 5, bottom: 35 },
  { left: 60, right: 90, top: 20, bottom: 44 },
];
const SWAY = { kind: 'sway', reach: 1.6, crowns: CROWNS };
const TICKS = ticksUpTo(1800, 1);

describe('the palm crowns swaying', () => {
  it('lean both ways, never further than all the way', () => {
    const leans = TICKS.map((tick) => swayAt(0, tick));
    expect(Math.max(...leans)).toBeGreaterThan(0.8);
    expect(Math.min(...leans)).toBeLessThan(-0.8);
    expect(leans.every((lean) => Math.abs(lean) <= 1)).toBe(true);
  });

  it('each lean on their own beat', () => {
    const apart = TICKS.filter((tick) => Math.abs(swayAt(0, tick) - swayAt(1, tick)) > 0.5);
    expect(apart.length).toBeGreaterThan(TICKS.length / 4);
  });

  it('bend from the trunk: the bottom row holds and the top moves most', () => {
    const [crown] = CROWNS;
    expect(swayOffset(crown, crown.bottom, 1.6)).toBe(0);
    expect(swayOffset(crown, crown.top, 1.6)).toBe(2);
    expect(swayOffset(crown, crown.top, -1.6)).toBe(-2);
    expect(swayOffset(crown, crown.bottom - 1, -1.6)).toBe(0);
  });

  it('redraw only the rows of a crown that lean, inside the crown', () => {
    const tick = TICKS.find((at) => Math.abs(swayAt(0, at)) > 0.9 && Math.abs(swayAt(1, at)) > 0.9);
    const drawn = drawnRows(
      record((painter) => drawSway(painter, { effect: SWAY, tick, painting: PAINTING })).log,
    );
    expect(drawn.length).toBeGreaterThan(10);
    for (const row of drawn) {
      const index = CROWNS.findIndex((crown) => row.x === crown.left);
      const crown = CROWNS[index];
      const offset = swayOffset(crown, row.y, swayAt(index, tick) * SWAY.reach);
      expect(offset).not.toBe(0);
      expect(row.y).toBeGreaterThanOrEqual(crown.top);
      expect(row.y).toBeLessThan(crown.bottom);
      expect(row).toMatchObject({ width: crown.right - crown.left, sx: crown.left - offset });
    }
  });

  it('move a crown at most a pixel from one tick to the next', () => {
    const [crown] = CROWNS;
    TICKS.slice(1).forEach((tick) => {
      const now = swayOffset(crown, crown.top, swayAt(0, tick) * SWAY.reach);
      const before = swayOffset(crown, crown.top, swayAt(0, tick - 1) * SWAY.reach);
      expect(Math.abs(now - before)).toBeLessThanOrEqual(1);
    });
  });
});
