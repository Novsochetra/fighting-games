// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { createScreens } from '../../../src/ui/screens/index.js';
import { loadPageBody } from '../../support/page-body.js';
import { fakeStorage } from '../../support/screen-fixtures.js';

// A mouse moving over a menu only lit the button under it pale, while the gold of focus stayed
// where the keys or the pad had left it: two buttons looked picked, and a click picked a third
// look again. The mouse now moves the focus, as the keys do, so the gold is under it.

const button = (action) => document.querySelector(`#screen-menu [data-action="${action}"]`);

const moveOver = (node, [clientX, clientY]) =>
  node.dispatchEvent(
    new PointerEvent('pointermove', { bubbles: true, pointerType: 'mouse', clientX, clientY }),
  );

describe('a mouse over the main menu', () => {
  let screens;

  beforeEach(async () => {
    await loadPageBody(document);
    screens = createScreens(document, { storage: fakeStorage() });
    screens.show('menu', { hasSave: true, chapter: 1, level: 1 });
  });

  it('takes the gold of focus to the button it moves over, and the keys go on from there', () => {
    moveOver(button('settings'), [120, 200]);

    expect(document.activeElement).toBe(button('settings'));

    screens.navigate('up');

    expect(document.activeElement).toBe(button('hero'));
  });
});
