// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { createScreens } from '../../../src/ui/screens/index.js';
import { loadPageBody } from '../../support/page-body.js';
import { fakeStorage, SAMPLE_PREMATCH } from '../../support/screen-fixtures.js';

const focused = () =>
  document.activeElement.dataset.action ?? document.activeElement.dataset.adjust;

describe('moving through a screen with the pad and the arrow keys', () => {
  let screens;
  let heard;

  beforeEach(async () => {
    await loadPageBody(document);
    heard = [];
    screens = createScreens(document, {
      storage: fakeStorage(),
      onAction: (name, payload) => heard.push([name, payload]),
    });
    screens.show('pause');
  });

  it('walks down the buttons and round from the last to the first', () => {
    const order = [];

    for (let step = 0; step < 6; step += 1) {
      screens.navigate('down');
      order.push(focused());
    }

    expect(order).toEqual(['hero', 'settings', 'how-to', 'quit', 'arcade', 'resume']);
  });

  it('goes up from the first to the last', () => {
    screens.navigate('up');

    expect(focused()).toBe('arcade');
  });

  it('takes the pad’s own menu steps and plain numbers too', () => {
    screens.navigate(['move', 1]);
    expect(focused()).toBe('hero');

    screens.navigate(-1);
    expect(focused()).toBe('resume');

    screens.navigate(['adjust', -1]);
    expect(focused()).toBe('arcade');
  });

  it('ignores a step it cannot read', () => {
    screens.navigate('sideways');
    screens.navigate(0);
    screens.navigate(['jump', 1]);

    expect(focused()).toBe('resume');
  });

  it('presses the button in focus', () => {
    screens.navigate('down');
    screens.confirm();

    expect(heard).toEqual([['hero', undefined]]);
  });

  it('finds a button again when the focus was lost', () => {
    document.activeElement.blur();
    screens.navigate('down');

    expect(focused()).toBe('resume');
  });

  it('skips the buttons a screen hides', () => {
    screens.show('menu', { hasSave: false });
    screens.navigate('up');
    screens.navigate('down');

    expect(focused()).toBe('new-story');
  });

  it('stays inside a question while it is asked', () => {
    document.querySelector('#screen-pause [data-action="quit"]').click();
    screens.navigate('down');
    expect(focused()).toBe('confirm-yes');

    screens.navigate('down');
    expect(focused()).toBe('confirm-no');
  });

  it('walks a screen with a row of two', () => {
    screens.show('prematch', SAMPLE_PREMATCH);
    expect(focused()).toBe('kick-off');

    screens.navigate('right');
    expect(focused()).toBe('back');

    screens.navigate('right');
    expect(focused()).toBe('kick-off');
  });

  it('changes a row’s value with left and right, and moves on with up and down', () => {
    screens.show('settings');
    screens.navigate('down');
    expect(focused()).toBe('sound');

    screens.navigate('left');
    expect(focused()).toBe('sound');
    expect(screens.settings().sound).toBe(7);
  });
});
