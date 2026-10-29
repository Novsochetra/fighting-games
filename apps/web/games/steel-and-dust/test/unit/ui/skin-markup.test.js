import { describe, expect, it } from 'vitest';
import { browseHint, EDIT_HINT } from '../../../src/ui/skins/skin-markup.js';

describe('the words under a skin', () => {
  it('say a control is edited by a tap, and reshaped on a skin that offers pills', () => {
    expect(browseHint(false)).toBe('Tap a control to move or resize it');
    expect(browseHint(true)).toBe('Tap a control to move, resize or reshape it');
  });

  it('say how an edit ends once a control is picked', () => {
    expect(EDIT_HINT).toBe('Drag it to move it, and tap beside the controls when done');
  });
});
