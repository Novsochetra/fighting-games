import { describe, expect, it } from 'vitest';
import { CLASSIC } from '../../../src/data/skins/classic.js';
import { DUSK } from '../../../src/data/skins/dusk.js';
import {
  createDraft,
  customised,
  moveControl,
  nextControl,
  orientationOf,
  resetLayout,
  resizeControl,
  savedEntries,
  savedLayout,
  shownControls,
  sizeOf,
  slotFor,
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

// the classic skin held each way
const LANDSCAPE = 'classic:landscape';
const PORTRAIT = 'classic:portrait';

const landscapeDraft = () => customised(createDraft(null), LANDSCAPE, centres);

describe('orientation', () => {
  it('tells an upright screen the same way the screen fit does', () => {
    expect(orientationOf(844, 390)).toBe('landscape');
    expect(orientationOf(390, 844)).toBe('portrait');
    expect(orientationOf(800, 820)).toBe('landscape');
  });

  it('picks the skin chosen for the way the phone is held, and its saved layout, or none', () => {
    const settings = { skinLandscape: 'dusk', skinPortrait: 'classic' };
    expect(slotFor(settings, 'landscape')).toBe('dusk:landscape');
    expect(slotFor(settings, 'portrait')).toBe(PORTRAIT);
    expect(slotFor({ skinLandscape: 'gone' }, 'landscape')).toBe(LANDSCAPE);
    const saved = { dusk: { landscape: { light: 1 }, portrait: null } };
    expect(savedEntries(saved, 'dusk:landscape')).toEqual({ light: 1 });
    expect(savedEntries(saved, 'dusk:portrait')).toBeNull();
    expect(savedEntries(saved, LANDSCAPE)).toBeNull();
    expect(savedEntries(null, LANDSCAPE)).toBeNull();
  });
});

describe('the layout draft', () => {
  it('starts from the saved layouts of every skin', () => {
    expect(createDraft(null)).toEqual({
      [LANDSCAPE]: null,
      [PORTRAIT]: null,
      'dusk:landscape': null,
      'dusk:portrait': null,
    });
    const saved = { dusk: { landscape: { light: 1 }, portrait: null } };
    expect(createDraft(saved)).toMatchObject({ 'dusk:landscape': { light: 1 }, [LANDSCAPE]: null });
  });

  it('turns the original layout into a custom one where the buttons stand', () => {
    const draft = landscapeDraft();
    expect(draft[PORTRAIT]).toBeNull();
    expect(draft[LANDSCAPE].ult).toEqual({ x: 0.7012, y: 0.66, size: 1 });
    expect(customised(draft, LANDSCAPE, { light: { x: 0, y: 0 } })).toBe(draft);
  });

  it('moves a button, kept whole on the screen', () => {
    const draft = landscapeDraft();
    const moved = moveControl(draft, {
      slot: LANDSCAPE,
      control: 'light',
      centre: { x: 0.25, y: 0.5 },
      half,
    });
    expect(moved[LANDSCAPE].light).toEqual({ x: 0.25, y: 0.5, size: 1 });
    expect(draft[LANDSCAPE].light).toEqual({ x: 0.92, y: 0.83, size: 1 });
    const edge = moveControl(draft, {
      slot: LANDSCAPE,
      control: 'light',
      centre: { x: -0.2, y: 1.3 },
      half,
    });
    expect(edge[LANDSCAPE].light).toEqual({ x: 0.06, y: 0.88, size: 1 });
  });

  it('resizes a button and pushes it back on screen as it grows', () => {
    let draft = moveControl(landscapeDraft(), {
      slot: LANDSCAPE,
      control: 'light',
      centre: { x: 1, y: 1 },
      half,
    });
    expect(draft[LANDSCAPE].light).toEqual({ x: 0.94, y: 0.88, size: 1 });
    for (const step of [1, 1, 1, 1, 1]) {
      draft = resizeControl(draft, { slot: LANDSCAPE, control: 'light', step, half });
    }
    expect(draft[LANDSCAPE].light).toEqual({ x: 0.91, y: 0.82, size: 1.5 });
    expect(sizeOf(draft, LANDSCAPE, 'light')).toBe(1.5);
    expect(sizeOf(draft, PORTRAIT, 'light')).toBe(1);
  });

  it('resets one orientation to the original layout', () => {
    const draft = { ...landscapeDraft(), [PORTRAIT]: { light: { x: 0.5, y: 0.5, size: 1 } } };
    const reset = resetLayout(draft, LANDSCAPE);
    expect(reset[LANDSCAPE]).toBeNull();
    expect(reset[PORTRAIT]).toEqual(draft[PORTRAIT]);
  });

  it('picks the controls in turn, leaving out a hidden stick', () => {
    const turns = (shown) => {
      const order = ['light'];
      while (order.length <= shown.length) {
        order.push(nextControl(order[order.length - 1], shown));
      }
      return order;
    };
    expect(turns(shownControls(CLASSIC.layouts.landscape, 'fixed'))).toEqual([
      'light',
      'heavy',
      'jump',
      'dash',
      'ult',
      'stick',
      'light',
    ]);
    expect(shownControls(CLASSIC.layouts.landscape, 'float')).toContain('stick');
    expect(turns(shownControls(CLASSIC.layouts.landscape, 'hidden'))).toEqual([
      'light',
      'heavy',
      'jump',
      'dash',
      'ult',
      'light',
    ]);
    // a skin's d-pad is picked last, and a hidden stick leaves it be
    expect(shownControls(DUSK.layouts.portrait, 'hidden')).toEqual([
      'light',
      'heavy',
      'jump',
      'dash',
      'ult',
      'dpad',
    ]);
  });

  it('moves and resizes the stick like a button', () => {
    let draft = landscapeDraft();
    expect(draft[LANDSCAPE].stick).toEqual({ x: 0.1125, y: 0.75, size: 1 });
    draft = moveControl(draft, {
      slot: LANDSCAPE,
      control: 'stick',
      centre: { x: 0.98, y: 0.7 },
      half: stickHalf,
    });
    expect(draft[LANDSCAPE].stick).toEqual({ x: 0.92, y: 0.7, size: 1 });
    for (const step of [1, 1, 1]) {
      draft = resizeControl(draft, {
        slot: LANDSCAPE,
        control: 'stick',
        step,
        half: stickHalf,
      });
    }
    expect(draft[LANDSCAPE].stick).toEqual({ x: 0.896, y: 0.7, size: 1.3 });
    expect(sizeOf(draft, LANDSCAPE, 'stick')).toBe(1.3);
    expect(draft[LANDSCAPE].light).toEqual(landscapeDraft()[LANDSCAPE].light);
    expect(resetLayout(draft, LANDSCAPE)[LANDSCAPE]).toBeNull();
  });

  it('saves nothing when both orientations are the original layout', () => {
    expect(savedLayout(createDraft(null))).toBeNull();
    expect(savedLayout(resetLayout(landscapeDraft(), LANDSCAPE))).toBeNull();
    const saved = savedLayout(landscapeDraft());
    expect(Object.keys(saved)).toEqual(['classic']);
    expect(saved.classic.portrait).toBeNull();
    expect(saved.classic.landscape.dash).toEqual({ x: 0.8, y: 0.61, size: 1 });
  });
});
