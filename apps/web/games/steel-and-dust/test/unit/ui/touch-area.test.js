import { describe, expect, it } from 'vitest';
import { fitTouchLayer, touchAreaOf } from '../../../src/ui/screen/touch-area.js';

const rect = (x, y, width, height) => ({ x, y, width, height });

function fakeLayer() {
  const properties = new Map();
  const style = {
    setProperty: (name, value) => (value ? properties.set(name, value) : properties.delete(name)),
  };

  return { style, properties };
}

describe('the touch layer on a folded phone', () => {
  it('keeps to the bottom half of a phone on a table', () => {
    const bottom = rect(0, 442, 1104, 442);

    expect(touchAreaOf({ stacked: true, game: rect(0, 0, 1104, 442), controls: bottom })).toBe(
      bottom,
    );
  });

  it('keeps the whole screen flat, or folded like a book', () => {
    expect(touchAreaOf(null)).toBeNull();
    expect(touchAreaOf({ stacked: false, game: rect(0, 0, 540, 720) })).toBeNull();
  });

  it('is placed on its area, with no status bar inset over the bottom half', () => {
    const layer = fakeLayer();

    fitTouchLayer(layer, rect(0, 574, 720, 540));
    expect(layer.style).toMatchObject({
      left: '0px',
      top: '574px',
      width: '720px',
      height: '540px',
    });
    expect(layer.properties.get('--sat')).toBe('0px');
  });

  it('goes back to the whole screen, its own CSS, once the phone lies flat', () => {
    const layer = fakeLayer();

    fitTouchLayer(layer, rect(0, 574, 720, 540));
    fitTouchLayer(layer, null);
    expect(layer.style).toMatchObject({ left: '', top: '', width: '', height: '' });
    expect(layer.properties.size).toBe(0);
  });
});
