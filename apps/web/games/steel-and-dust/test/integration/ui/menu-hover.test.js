// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { openPage, selected } from '../../support/menu-page.js';

const button = (action) => document.querySelector(`#m-title [data-act="${action}"]`);
const hover = (target, pointerType = 'mouse') =>
  target.dispatchEvent(new PointerEvent('pointermove', { pointerType, bubbles: true }));
const ticks = (audio) => audio.sfx.mock.calls.filter(([name]) => name === 'ui').length;

describe('hovering the menu buttons', () => {
  let page;
  beforeEach(() => {
    page = openPage();
    page.audio.sfx.mockClear();
  });

  it('ticks once as the mouse comes onto a button, as the arrow keys do', () => {
    hover(button('help'));
    expect(selected().textContent).toBe('How to play');
    expect(ticks(page.audio)).toBe(1);
  });

  it('stays quiet while the mouse moves about on the same button', () => {
    hover(button('help'));
    hover(button('help'));
    hover(button('play'));
    expect(ticks(page.audio)).toBe(2);
  });

  it('stays quiet for a finger, which only taps', () => {
    hover(button('help'), 'touch');
    expect(ticks(page.audio)).toBe(0);
  });
});
