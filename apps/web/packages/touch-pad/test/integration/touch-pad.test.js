// @vitest-environment happy-dom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installTouchPad } from '../../src/install-touch-pad.js';
import { placePad, placesOf } from '../../src/pad-place.js';
import { renderPad } from '../../src/pad-markup.js';

const STEER = { up: 'up', right: 'right', down: 'down', left: 'left' };
const STICK = { id: 'stick', kind: 'stick', inputs: STEER, class: 'my-stick' };
const DPAD = { id: 'dpad', kind: 'dpad', inputs: STEER, size: 150 };
const JUMP = { id: 'jump', kind: 'button', inputs: ['jump'], label: 'JUMP' };
const SUPER = { id: 'super', kind: 'button', inputs: ['jump', 'light'], label: 'J+A' };

// happy-dom lays nothing out, so each control gets the rect of a 100px square at a spot of its own
const SPOTS = { stick: [100, 300], dpad: [200, 300], jump: [700, 300], super: [600, 300] };

// the stick's zone is the left half of an 800x400 screen standing at y 100
const ZONE = { left: 0, top: 100, right: 400, bottom: 500, width: 400, height: 400 };

function rectOf(node) {
  if (node.classList.contains('pad-zone')) {
    return ZONE;
  }

  const [x, y] = SPOTS[node.dataset?.control] ?? [0, 0];

  return { left: x - 50, top: y - 50, right: x + 50, bottom: y + 50, width: 100, height: 100 };
}

function stubRects() {
  vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function rect() {
    return rectOf(this);
  });
  vi.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockImplementation(function width() {
    return this.classList.contains('pad-knob') ? 44 : 100;
  });
}

function pointer(target, type, [x, y], pointerId = 1) {
  target.dispatchEvent(
    new PointerEvent(type, { bubbles: true, pointerId, clientX: x, clientY: y }),
  );
}

const control = (id) => document.querySelector(`[data-control="${id}"]`);

describe('a touch pad drawn from a skin', () => {
  let layer;
  let calls;
  let mode;
  let pad;

  beforeEach(() => {
    stubRects();
    document.head.innerHTML = '';
    document.body.innerHTML = '<div id="layer"><button class="pause">II</button></div>';
    layer = document.getElementById('layer');
    calls = [];
    mode = 'fixed';
    const record =
      (name) =>
      (...args) =>
        calls.push([name, ...args]);
    const handler = { press: record('press'), release: record('release'), steer: record('steer') };
    renderPad(layer, { items: [STICK, DPAD, JUMP, SUPER] });
    pad = installTouchPad(layer, {
      handler,
      stickMode: () => mode,
      stickRest: () => ({ x: 90, y: 280 }),
    });
  });

  afterEach(() => vi.restoreAllMocks());

  it('draws the stick in a zone of its own, first, and the other controls after it', () => {
    const drawn = layer.firstElementChild;

    expect(drawn.className).toBe('pad');
    expect(drawn.firstElementChild.className).toBe('pad-zone');
    expect(control('stick').className).toBe('pad-stick my-stick');
    expect(
      [...drawn.querySelectorAll('.pad-controls > [data-control]')].map(
        (node) => node.dataset.control,
      ),
    ).toEqual(['dpad', 'jump', 'super']);
    expect(control('jump').textContent).toBe('JUMP');
    expect(control('dpad').style.getPropertyValue('--pad-base')).toBe('150px');
    expect(document.querySelectorAll('#touch-pad-styles')).toHaveLength(1);
    expect(layer.lastElementChild.className).toBe('pause');
  });

  it('presses every input of a button and lets them go together', () => {
    pointer(control('super'), 'pointerdown', SPOTS.super);
    expect(control('super').classList.contains('on')).toBe(true);
    pointer(control('super'), 'pointerup', SPOTS.super);
    pointer(control('super'), 'lostpointercapture', SPOTS.super);

    expect(calls).toEqual([
      ['press', 'jump'],
      ['press', 'light'],
      ['release', 'jump'],
      ['release', 'light'],
    ]);
    expect(control('super').classList.contains('on')).toBe(false);
  });

  it('rolls a thumb over the d-pad from up to a corner to right, then lets go', () => {
    const [x, y] = SPOTS.dpad;

    pointer(control('dpad'), 'pointerdown', [x, y - 40]);
    pointer(control('dpad'), 'pointermove', [x + 40, y - 40]);
    expect(control('dpad').dataset.pressed).toBe('up right');
    pointer(control('dpad'), 'pointermove', [x + 40, y]);
    pointer(control('dpad'), 'pointerup', [x + 40, y]);

    expect(calls).toEqual([
      ['steer', 'up', true],
      ['steer', 'right', true],
      ['steer', 'up', false],
      ['steer', 'right', false],
    ]);
    expect(control('dpad').classList.contains('on')).toBe(false);
  });

  it('grabs a fixed stick only near it, steers, and rests again on release', () => {
    const zone = layer.querySelector('.pad-zone');
    const [x, y] = SPOTS.stick;

    pad.restStick();
    expect([control('stick').style.left, control('stick').style.top]).toEqual(['90px', '280px']);
    pointer(zone, 'pointerdown', [x + 300, y]);
    expect(calls).toEqual([]);
    pointer(zone, 'pointerdown', [x, y], 2);
    pointer(zone, 'pointermove', [x + 40, y], 2);
    expect(control('stick').classList.contains('on')).toBe(true);
    pointer(zone, 'pointerup', [x + 40, y], 2);

    expect(calls).toEqual([
      ['steer', 'right', true],
      ['steer', 'right', false],
    ]);
    expect(control('stick').style.transform).toBe('');
  });

  it('brings a floating stick under the thumb, kept whole in its zone', () => {
    const zone = layer.querySelector('.pad-zone');

    mode = 'float';
    pointer(zone, 'pointerdown', [5, 300]);
    expect([control('stick').style.left, control('stick').style.top]).toEqual(['30px', '200px']);
    pointer(zone, 'pointerup', [5, 300]);

    expect(calls).toEqual([
      ['steer', 'left', true],
      ['steer', 'left', false],
    ]);
  });

  it('leaves a hidden stick’s side alone', () => {
    mode = 'hidden';
    pointer(layer.querySelector('.pad-zone'), 'pointerdown', SPOTS.stick);

    expect(control('stick').classList.contains('on')).toBe(false);
    expect(calls).toEqual([]);
  });

  it('keeps the drawn pad for the same layout, and answers on one drawn for another', () => {
    const first = control('jump');
    const layout = { items: [JUMP] };

    renderPad(layer, layout);
    renderPad(layer, layout);
    expect(control('jump')).not.toBe(first);
    expect(layer.querySelector('.pad-zone')).toBeNull();
    pointer(control('jump'), 'pointerdown', SPOTS.jump);
    expect(calls).toEqual([['press', 'jump']]);
    expect(pad.control('jump')).toBe(control('jump'));
  });

  it('places the controls the skin or the player puts somewhere, and the stick by its size', () => {
    const layout = {
      items: [
        { ...STICK, at: { x: 0.1, y: 0.7 } },
        { ...JUMP, at: { x: 0.9, y: 0.6 } },
      ],
    };

    renderPad(layer, layout);
    placePad(
      layer,
      placesOf(layout, {
        jump: { x: 0.5, y: 0.5, size: 1.2 },
        stick: { x: 0.2, y: 0.7, size: 1.4 },
      }),
    );
    expect(layer.querySelector('.pad-controls').classList.contains('pad-placed')).toBe(true);
    expect(control('jump').style.getPropertyValue('--pad-x')).toBe('0.5');
    expect(control('stick').style.getPropertyValue('--pad-size')).toBe('1.4');
    expect(control('stick').style.getPropertyValue('--pad-x')).toBe('');
    placePad(layer, null);
    expect(control('jump').style.getPropertyValue('--pad-x')).toBe('');
    expect(layer.querySelector('.pad-controls').classList.contains('pad-placed')).toBe(false);
  });

  it('outlines the controls of a skin drawn for debugging', () => {
    expect(
      renderPad(layer, { items: [JUMP] }, { debug: true }).classList.contains('pad-debug'),
    ).toBe(true);
  });
});
