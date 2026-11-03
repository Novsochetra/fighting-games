// @vitest-environment happy-dom
import { beforeEach, describe, expect, it } from 'vitest';
import { installTouch } from '../../../src/input/touch.js';
import { createInput } from '../../../src/sim/input-state.js';

let layer;
let touch;

const hidden = (node) => node.style.visibility === 'hidden';
const controlOf = (id) => layer.querySelector(`[data-control="${id}"]`);
const shownIds = () =>
  ['stick', 'pass', 'shoot', 'sprint', 'pause'].filter((id) => {
    const control = controlOf(id);

    return !hidden(id === 'stick' ? control.parentElement : control);
  });

beforeEach(() => {
  document.body.innerHTML = '<div id="touch"></div>';
  layer = document.getElementById('touch');
  touch = installTouch(layer, { source: createInput().sources.touch, onPause: () => {} });
  touch.fit(false);
});

describe('the touch pad over a drill', () => {
  it('shows every key until a screen names the ones it reads', () => {
    expect(shownIds()).toEqual(['stick', 'pass', 'shoot', 'sprint', 'pause']);
  });

  it('stands aside the keys the screen reads none of, but keeps pause', () => {
    touch.show(['up', 'down', 'left', 'right', 'shoot']);

    expect(shownIds()).toEqual(['stick', 'shoot', 'pause']);

    touch.show(['pass']);

    expect(shownIds()).toEqual(['pass', 'pause']);
  });

  it('stands the stick aside with its zone, so a touch there goes through to the stage', () => {
    touch.show(['pass']);

    expect(hidden(controlOf('stick').parentElement)).toBe(true);
    expect(controlOf('stick').parentElement.classList.contains('pad-zone')).toBe(true);
  });

  it('keeps the keys it stood aside through a turn of the phone, and shows all again on null', () => {
    touch.show(['pass']);
    touch.fit(true);

    expect(shownIds()).toEqual(['pass', 'pause']);

    touch.show(null);

    expect(shownIds()).toEqual(['stick', 'pass', 'shoot', 'sprint', 'pause']);
  });
});
