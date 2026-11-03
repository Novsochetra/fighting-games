import { describe, expect, it } from 'vitest';
import { plateRect } from '../../../../src/render/dialogue/plate.js';

const context = { measureText: (text) => ({ width: [...text].length * 10 }) };

describe('a name plate’s place', () => {
  it('starts at its anchor when the name fits the room it has', () => {
    expect(plateRect(context, 'Dara', { x: 168, y: 274, align: 'left', limit: 336 }).x).toBe(168);

    const right = plateRect(context, 'Dara', { x: 600, y: 274, align: 'right', limit: 430 });

    expect(right.x + right.width).toBe(600);
  });

  it('slides a long name back from its limit instead of running past it', () => {
    const left = plateRect(context, 'Riverside coach', {
      x: 168,
      y: 274,
      align: 'left',
      limit: 336,
    });
    const right = plateRect(context, 'Riverside coach', {
      x: 600,
      y: 274,
      align: 'right',
      limit: 430,
    });

    expect(left.x + left.width).toBe(336);
    expect(left.x).toBeLessThan(168);
    expect(right.x).toBe(430);
    expect(right.x + right.width).toBeGreaterThan(600);
  });

  it('stays where it is put when it has no limit', () => {
    const plate = plateRect(context, 'Riverside coach', { x: 116, y: 308, align: 'left' });

    expect(plate.x).toBe(116);
  });
});
