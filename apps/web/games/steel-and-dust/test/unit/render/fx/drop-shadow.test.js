import { describe, expect, it } from 'vitest';
import { FX_COLORS } from '../../../../src/art/fx-colors.js';
import { BODY_ART } from '../../../../src/art/weapon-art.js';
import { GROUND_Y } from '../../../../src/config.js';
import { DROP } from '../../../../src/data/ambush.js';
import { drawDropShadow, dropShadow } from '../../../../src/render/fx/drop-shadow.js';
import { drawnRects, recordingPainter } from './fx-recorder.js';

const FLAT = () => GROUND_Y;
const mark = (fields) => ({ x: 120, y: GROUND_Y, raiderKind: 'grunt', raider: null, ...fields });
const falling = (height) =>
  mark({ time: DROP.warn + 10, raider: { x: 120, y: GROUND_Y - height } });

function drawn(shadow, floorAt = FLAT) {
  const { painter, log } = recordingPainter();

  drawDropShadow(painter, shadow, floorAt);

  return { log, rects: drawnRects(log) };
}

describe('the shadow of a raider overhead', () => {
  it('gathers faint and wide while it settles, then draws in and darkens as it gets ready', () => {
    const settling = dropShadow(mark({ time: 4 }));
    const settled = dropShadow(mark({ time: DROP.warn - DROP.ready }));
    const ready = dropShadow(mark({ time: DROP.warn }));

    expect(settled.half).toBeGreaterThan(settling.half);
    expect(settled.darkness).toBeGreaterThan(settling.darkness);
    expect(ready.half).toBeLessThan(settled.half);
    expect(ready.darkness).toBeGreaterThan(settled.darkness);
  });

  it('sharpens as the raider comes down, to its own shadow just as it lands', () => {
    const high = dropShadow(falling(110));
    const low = dropShadow(falling(4));

    expect(low.half).toBeLessThan(high.half);
    expect(low.darkness).toBeGreaterThan(high.darkness);
    expect(low.soft).toBeLessThan(0.1);
  });

  it('deepens what it lies on instead of painting over it, and never the red of a danger', () => {
    const { log, rects } = drawn(mark({ time: 40 }));

    expect(log).toContain('globalCompositeOperation=multiply');
    expect(log.at(-2)).toBe('globalCompositeOperation=source-over');
    expect(new Set(rects.map((rect) => rect.color))).toEqual(new Set([FX_COLORS.dropShadow]));
  });

  it('lies on the turf from the floor line down, never on what stands behind the road', () => {
    const { rects } = drawn(mark({ time: 50 }));

    expect(Math.min(...rects.map((rect) => rect.y))).toBe(GROUND_Y);
  });

  it('drapes over a hump, following what each column of it falls on', () => {
    const hump = (x) => GROUND_Y - Math.max(0, 6 - Math.abs(x - 120));
    const { rects } = drawn(mark({ time: 50 }), hump);
    const top = (x) => Math.min(...rects.filter((rect) => rect.x === x).map((rect) => rect.y));

    expect(top(120)).toBe(GROUND_Y - 6);
    expect(top(124)).toBe(GROUND_Y - 2);
    expect(top(114)).toBe(GROUND_Y);
  });

  it('hands over to the raider its own shadow over the last stretch of its fall', () => {
    const high = drawn(falling(60)).rects;
    const low = drawn(falling(4)).rects;

    expect(high.some((rect) => rect.color === BODY_ART.shadow)).toBe(false);
    expect(low.some((rect) => rect.color === BODY_ART.shadow)).toBe(true);
  });
});
