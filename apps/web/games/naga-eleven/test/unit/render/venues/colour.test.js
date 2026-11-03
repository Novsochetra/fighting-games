import { describe, expect, it } from 'vitest';
import {
  CLEAR,
  mix,
  packAll,
  packed,
  packedAlpha,
  unpack,
} from '../../../../src/render/venues/kit/colour.js';

describe('the colours a venue is painted in', () => {
  it('packs a colour into one pixel word and back', () => {
    expect(unpack(packed('#1f5a33'))).toEqual([0x1f, 0x5a, 0x33, 255]);
    expect(unpack(packedAlpha('#ffffff', 0.5))).toEqual([255, 255, 255, 128]);
  });

  it('lays a glow over a clear pixel as the glow itself, partly see-through', () => {
    expect(unpack(mix(CLEAR, packed('#fff2c2'), 0.5))).toEqual([255, 242, 194, 128]);
  });

  it('mixes one colour part of the way to another', () => {
    expect(unpack(mix(packed('#000000'), packed('#ffffff'), 0.25))).toEqual([64, 64, 64, 255]);
  });

  it('packs every colour of a palette and leaves its words alone', () => {
    const palette = packAll({ ad: { back: '#ff0000', text: 'NAGA AIR' }, ramp: ['#000000'] });

    expect(palette.ad.text).toBe('NAGA AIR');
    expect(palette.ad.back).toBe(packed('#ff0000'));
    expect(palette.ramp).toEqual([packed('#000000')]);
  });
});
