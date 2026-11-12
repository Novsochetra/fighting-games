import { describe, expect, it } from 'vitest';
import { chipsOf, rowLefts } from '../../../src/ui/praise-view.js';

const text = { t: (key) => key };

describe('the chips a payment earns', () => {
  it('are one for each reason it earned anything, the pay first', () => {
    const paid = { pay: 1000, speedPay: 2000, clean: false, extra: 1000 };

    expect(chipsOf(paid, text).map((chip) => [chip.kind, chip.amount])).toEqual([
      ['pay', 1000],
      ['speed', 2000],
      ['extra', 1000],
    ]);
  });

  it('start in a row centred on a point, side by side with a little space', () => {
    expect(rowLefts([100, 40, 60], 300)).toEqual([194, 300, 346]);
  });

  it('start a lone chip centred', () => {
    expect(rowLefts([80], 50)).toEqual([10]);
  });
});
