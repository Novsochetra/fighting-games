// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { installGestureGuards, isQuickSecondTap } from '../../src/gesture-guards.js';

describe('menu double-tap fix', () => {
  it('catches a quick second tap in the same spot', () => {
    expect(isQuickSecondTap({ distance: 3, sinceLastTap: 200 })).toBe(true);
  });

  it('leaves slow taps and swipes alone', () => {
    expect(isQuickSecondTap({ distance: 3, sinceLastTap: 500 })).toBe(false);
    expect(isQuickSecondTap({ distance: 40, sinceLastTap: 100 })).toBe(false);
  });
});

describe('gesture guards', () => {
  it('cancels the long-press menu in the game and every touch on what is played on', () => {
    document.body.innerHTML = '<div id="app"><div id="stage"></div><p id="menu"></p></div>';
    const root = document.getElementById('app');
    const stage = document.getElementById('stage');

    installGestureGuards({ window, document, root, surfaces: [stage] });

    const touch = new Event('touchstart', { bubbles: true, cancelable: true });
    const menu = new Event('contextmenu', { bubbles: true, cancelable: true });
    const elsewhere = new Event('touchstart', { bubbles: true, cancelable: true });
    stage.dispatchEvent(touch);
    document.getElementById('menu').dispatchEvent(menu);
    document.getElementById('menu').dispatchEvent(elsewhere);

    expect([touch.defaultPrevented, menu.defaultPrevented, elsewhere.defaultPrevented]).toEqual([
      true,
      true,
      false,
    ]);
  });

  // a name typed to post a run needs its caret and a selection, as nothing else on the page does
  it('lets a text field take a selection, and cancels one anywhere else', () => {
    document.body.innerHTML = '<div id="app"><p id="words">Steel</p><input id="name" /></div>';
    const root = document.getElementById('app');

    installGestureGuards({ window, document, root, surfaces: [] });

    const selecting = (id) => {
      const event = new Event('selectstart', { bubbles: true, cancelable: true });

      document.getElementById(id).dispatchEvent(event);

      return event.defaultPrevented;
    };

    expect([selecting('words'), selecting('name')]).toEqual([true, false]);
  });
});
