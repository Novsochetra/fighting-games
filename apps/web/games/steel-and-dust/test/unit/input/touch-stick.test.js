import { describe, expect, it } from 'vitest';
import { TouchStick } from '../../../src/input/touch-stick.js';
import { createTestGame } from '../../support/test-game.js';

const rect = { left: 0, top: 0, right: 400, bottom: 300, width: 400, height: 300 };
const element = (width) => ({
  offsetWidth: width,
  style: {},
  classList: { remove() {} },
  getBoundingClientRect: () => ({ ...rect, left: 40, top: 200, width, height: width }),
});

function stickWith(stick) {
  const game = createTestGame({ settings: { stick } });
  const elements = {
    zone: { getBoundingClientRect: () => rect },
    base: element(128),
    knob: element(56),
  };
  return new TouchStick({ elements, game, layout: { stickRest: () => ({ x: 0, y: 0 }) } });
}

describe('the touch stick', () => {
  it('appears under a thumb when floating, and ignores every thumb when hidden', () => {
    const thumb = { clientX: 120, clientY: 180, pointerId: 3 };
    expect(stickWith('float').grab(thumb)).toBe(true);
    const hidden = stickWith('hidden');
    expect(hidden.grab(thumb)).toBe(false);
    expect(hidden.pointerId).toBeNull();
  });
});
