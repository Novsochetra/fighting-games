// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { createScreens } from '../../../src/ui/screens/index.js';
import { loadPageBody } from '../../support/page-body.js';
import { fakeStorage } from '../../support/screen-fixtures.js';

const focused = () =>
  document.activeElement.dataset.action ?? document.activeElement.dataset.adjust;

const inPause = (action) => document.querySelector(`#screen-pause [data-action="${action}"]`);

let place = 0;

// a mouse moving onto a node: each move lands somewhere new unless it is given where
function moveOver(node, { pointerType = 'mouse', at = null } = {}) {
  place += 7;

  const [clientX, clientY] = at ?? [place, place];

  node.dispatchEvent(
    new PointerEvent('pointermove', { bubbles: true, pointerType, clientX, clientY }),
  );
}

describe('the mouse moving over a screen', () => {
  let screens;

  beforeEach(async () => {
    await loadPageBody(document);
    screens = createScreens(document, { storage: fakeStorage() });
    screens.show('pause');
  });

  it('gives the button it moves over the focus, the one gold look', () => {
    moveOver(inPause('settings'));

    expect(focused()).toBe('settings');
  });

  it('leaves the keys and the pad to go on from where the mouse left the focus', () => {
    moveOver(inPause('settings'));
    screens.navigate('down');

    expect(focused()).toBe('how-to');

    screens.navigate('up');
    screens.navigate('up');

    expect(focused()).toBe('hero');
  });

  it('takes the focus back only when the mouse itself moves, not when a list moves under it', () => {
    moveOver(inPause('hero'), { at: [40, 60] });
    screens.navigate('down');
    moveOver(inPause('settings'), { at: [40, 60] });
    moveOver(inPause('hero'), { at: [40, 60] });

    expect(focused()).toBe('settings');

    moveOver(inPause('hero'), { at: [41, 60] });

    expect(focused()).toBe('hero');
  });

  it('leaves the focus alone under a finger dragging a list', () => {
    moveOver(inPause('quit'), { pointerType: 'touch' });

    expect(focused()).toBe('resume');
  });

  it('leaves the focus where it was over what is not a button', () => {
    moveOver(inPause('hero'));
    moveOver(document.querySelector('#screen-pause'));

    expect(focused()).toBe('hero');
  });

  it('reaches only the question’s buttons while a screen asks to confirm', () => {
    inPause('quit').click();
    moveOver(inPause('hero'));

    expect(focused()).toBe('confirm-no');

    moveOver(document.querySelector('#screen-pause [data-action="confirm-yes"]'));

    expect(focused()).toBe('confirm-yes');
  });

  it('skips a button the screen hides', () => {
    screens.show('menu', { hasSave: false });

    const hidden = document.querySelector('#screen-menu [data-action="continue"]');

    moveOver(hidden);

    expect(focused()).toBe('new-story');
  });

  it('gives a row of settings the focus from the arrows on it', () => {
    screens.show('settings');
    moveOver(
      document.querySelector('#screen-settings [data-adjust="sound"] [data-action="adjust"]'),
    );

    expect(focused()).toBe('sound');
  });
});
