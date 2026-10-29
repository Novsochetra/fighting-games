import { describe, expect, it } from 'vitest';
import { placesOf, placeVars } from '../../src/pad-place.js';

const button = (id, at) => ({ id, kind: 'button', inputs: [id], ...(at && { at }) });

describe('placing the controls', () => {
  it('turns a place into the variables the pad stands a control by', () => {
    expect(placeVars({ x: 0.25, y: 0.5, size: 1.2 })).toEqual({
      '--pad-x': '0.25',
      '--pad-y': '0.5',
      '--pad-size': '1.2',
    });
    expect(placeVars(null)).toEqual({ '--pad-x': null, '--pad-y': null, '--pad-size': null });
  });

  it('places the controls where the skin puts them, at size 1', () => {
    const layout = {
      items: [button('jump', { x: 0.9, y: 0.6 }), button('light', { x: 0.8, y: 0.8 })],
    };

    expect(placesOf(layout, null)).toEqual({
      jump: { x: 0.9, y: 0.6, size: 1 },
      light: { x: 0.8, y: 0.8, size: 1 },
    });
  });

  it('puts the player’s own places first', () => {
    const custom = { jump: { x: 0.1, y: 0.1, size: 1.4 } };

    expect(placesOf({ items: [button('jump', { x: 0.9, y: 0.6 })] }, custom)).toBe(custom);
  });

  it('leaves a skin that places nothing to the game’s styles', () => {
    expect(placesOf({ items: [button('jump')] }, null)).toBeNull();
  });
});
