import { describe, expect, it } from 'vitest';
import {
  createDraft,
  customised,
  layoutForScreen,
  moveControl,
  nextControl,
  orientationOf,
  resetLayout,
  resizeControl,
  savedLayout,
  shownControls,
  sizeOf,
} from '../../../src/ui/layout/layout-draft.js';

const centres = {
  ult: { x: 0.70123456, y: 0.66 },
  dash: { x: 0.8, y: 0.61 },
  jump: { x: 0.92, y: 0.58 },
  heavy: { x: 0.81, y: 0.86 },
  light: { x: 0.92, y: 0.83 },
  stick: { x: 0.1125, y: 0.75 },
};
// ATTACK is 96px on an 800x400 layer: half of it is 6% of the width and 12% of the height; the
// stick's base is 128px
const half = { x: 0.06, y: 0.12 };
const stickHalf = { x: 0.08, y: 0.16 };

const landscapeDraft = () => customised(createDraft(null), 'landscape', centres);

describe('orientation', () => {
  it('tells an upright screen the same way the screen fit does', () => {
    expect(orientationOf(844, 390)).toBe('landscape');
    expect(orientationOf(390, 844)).toBe('portrait');
    expect(orientationOf(800, 820)).toBe('landscape');
  });

  it('picks the saved layout for the screen, or none', () => {
    const saved = { landscape: { light: 1 }, portrait: null };
    expect(layoutForScreen(saved, 844, 390)).toEqual({ light: 1 });
    expect(layoutForScreen(saved, 390, 844)).toBeNull();
    expect(layoutForScreen(null, 844, 390)).toBeNull();
  });
});

describe('the layout draft', () => {
  it('starts from the saved layouts', () => {
    expect(createDraft(null)).toEqual({ landscape: null, portrait: null });
    const saved = { landscape: { light: 1 }, portrait: null };
    expect(createDraft(saved)).toEqual(saved);
  });

  it('turns the original layout into a custom one where the buttons stand', () => {
    const draft = landscapeDraft();
    expect(draft.portrait).toBeNull();
    expect(draft.landscape.ult).toEqual({ x: 0.7012, y: 0.66, size: 1 });
    expect(customised(draft, 'landscape', { light: { x: 0, y: 0 } })).toBe(draft);
  });

  it('moves a button, kept whole on the screen', () => {
    const draft = landscapeDraft();
    const moved = moveControl(draft, {
      orientation: 'landscape',
      control: 'light',
      centre: { x: 0.25, y: 0.5 },
      half,
    });
    expect(moved.landscape.light).toEqual({ x: 0.25, y: 0.5, size: 1 });
    expect(draft.landscape.light).toEqual({ x: 0.92, y: 0.83, size: 1 });
    const edge = moveControl(draft, {
      orientation: 'landscape',
      control: 'light',
      centre: { x: -0.2, y: 1.3 },
      half,
    });
    expect(edge.landscape.light).toEqual({ x: 0.06, y: 0.88, size: 1 });
  });

  it('resizes a button and pushes it back on screen as it grows', () => {
    let draft = moveControl(landscapeDraft(), {
      orientation: 'landscape',
      control: 'light',
      centre: { x: 1, y: 1 },
      half,
    });
    expect(draft.landscape.light).toEqual({ x: 0.94, y: 0.88, size: 1 });
    for (const step of [1, 1, 1, 1, 1]) {
      draft = resizeControl(draft, { orientation: 'landscape', control: 'light', step, half });
    }
    expect(draft.landscape.light).toEqual({ x: 0.91, y: 0.82, size: 1.5 });
    expect(sizeOf(draft, 'landscape', 'light')).toBe(1.5);
    expect(sizeOf(draft, 'portrait', 'light')).toBe(1);
  });

  it('resets one orientation to the original layout', () => {
    const draft = { ...landscapeDraft(), portrait: { light: { x: 0.5, y: 0.5, size: 1 } } };
    const reset = resetLayout(draft, 'landscape');
    expect(reset.landscape).toBeNull();
    expect(reset.portrait).toEqual(draft.portrait);
  });

  it('picks the controls in turn, leaving out a hidden stick', () => {
    const turns = (shown) => {
      const order = ['light'];
      while (order.length <= shown.length) {
        order.push(nextControl(order[order.length - 1], shown));
      }
      return order;
    };
    expect(turns(shownControls('fixed'))).toEqual([
      'light',
      'heavy',
      'jump',
      'dash',
      'ult',
      'stick',
      'light',
    ]);
    expect(shownControls('float')).toContain('stick');
    expect(turns(shownControls('hidden'))).toEqual([
      'light',
      'heavy',
      'jump',
      'dash',
      'ult',
      'light',
    ]);
  });

  it('moves and resizes the stick like a button', () => {
    let draft = landscapeDraft();
    expect(draft.landscape.stick).toEqual({ x: 0.1125, y: 0.75, size: 1 });
    draft = moveControl(draft, {
      orientation: 'landscape',
      control: 'stick',
      centre: { x: 0.98, y: 0.7 },
      half: stickHalf,
    });
    expect(draft.landscape.stick).toEqual({ x: 0.92, y: 0.7, size: 1 });
    for (const step of [1, 1, 1]) {
      draft = resizeControl(draft, {
        orientation: 'landscape',
        control: 'stick',
        step,
        half: stickHalf,
      });
    }
    expect(draft.landscape.stick).toEqual({ x: 0.896, y: 0.7, size: 1.3 });
    expect(sizeOf(draft, 'landscape', 'stick')).toBe(1.3);
    expect(draft.landscape.light).toEqual(landscapeDraft().landscape.light);
    expect(resetLayout(draft, 'landscape').landscape).toBeNull();
  });

  it('saves nothing when both orientations are the original layout', () => {
    expect(savedLayout(createDraft(null))).toBeNull();
    expect(savedLayout(resetLayout(landscapeDraft(), 'landscape'))).toBeNull();
    const saved = savedLayout(landscapeDraft());
    expect(saved.portrait).toBeNull();
    expect(saved.landscape.dash).toEqual({ x: 0.8, y: 0.61, size: 1 });
  });
});
