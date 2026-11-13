// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { openPage } from '../../support/open-page.js';

const press = (key) =>
  document
    .querySelector(`.key[data-key="${key}"]`)
    .dispatchEvent(new window.MouseEvent('pointerdown', { bubbles: true, button: 0 }));

function listen(page) {
  const played = [];

  page.stage.audio.play = (name) => played.push(name);

  return played;
}

// The pad clicked for every press, even one that typed nothing, while Backspace and C typed
// from the keyboard or the pad made no sound.
describe('the click of the pad', () => {
  it('sounds only when the figure changes, whatever changed it', () => {
    const page = openPage({ settings: { input: 'keypad' } });
    const played = listen(page);

    press('0');
    press('00');
    page.step();
    expect(played.filter((name) => name === 'key')).toHaveLength(0);

    press('5');
    page.typeKey('Backspace');
    press('7');
    press('clear');
    page.step();
    expect(played.filter((name) => name === 'key')).toHaveLength(4);
  });
});
