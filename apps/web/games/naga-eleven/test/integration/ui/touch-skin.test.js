import { describe, expect, it } from 'vitest';
import { skinProblems } from '../../../../../packages/touch-pad/src/skin-check.js';
import { PITCH_SIDE } from '../../../src/data/skins/pitch-side.js';
import { actionOfKey } from '../../../src/input/keyboard.js';

const KEY_ACTIONS = new Set(
  ['KeyW', 'KeyS', 'KeyA', 'KeyD', 'KeyJ', 'KeyK', 'KeyL'].map(actionOfKey),
);
const layouts = Object.entries(PITCH_SIDE.layouts);
const buttonsOf = (layout) => layout.items.filter((item) => item.kind === 'button');

describe('the touch skin', () => {
  it('passes the touch pad’s own checks', () => {
    expect(skinProblems(PITCH_SIDE)).toEqual([]);
  });

  it.each(layouts)('gives only actions the game knows, held %s', (_, layout) => {
    const inputs = layout.items.flatMap((item) =>
      Array.isArray(item.inputs) ? item.inputs : Object.values(item.inputs),
    );

    for (const input of inputs) {
      expect(input === 'pause' || KEY_ACTIONS.has(input)).toBe(true);
    }
  });

  it.each(layouts)('draws every kick and the pause as a round key, held %s', (_, layout) => {
    const buttons = buttonsOf(layout);

    expect(buttons.map((item) => item.id).sort()).toEqual(['pass', 'pause', 'shoot', 'sprint']);

    for (const button of buttons) {
      expect(button.aspect).toBeUndefined();
    }
  });

  it.each(layouts)(
    'rims SHOOT alone in gold, every key in the glass style, held %s',
    (_, layout) => {
      const gold = buttonsOf(layout).filter((item) => item.class.split(' ').includes('pitch-gold'));

      expect(gold.map((item) => item.id)).toEqual(['shoot']);
      expect(layout.items.every((item) => /^pitch-(button|stick)\b/.test(item.class))).toBe(true);
    },
  );

  it.each(layouts)('keeps every key a thumb’s size, held %s', (_, layout) => {
    for (const button of buttonsOf(layout)) {
      expect(button.size).toBeGreaterThanOrEqual(44);
    }
  });
});
