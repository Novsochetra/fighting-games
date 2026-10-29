import { describe, expect, it } from 'vitest';
import { skinProblems } from '../../src/skin-check.js';

const STEER = { up: 'up', right: 'right', down: 'down', left: 'left' };

function skin(items) {
  return { id: 'test', name: 'Test', layouts: { landscape: { items }, portrait: { items } } };
}

describe('checking a skin', () => {
  it('finds nothing wrong with a skin of every kind of control', () => {
    const items = [
      { id: 'stick', kind: 'stick', inputs: STEER, at: { x: 0.15, y: 0.7 }, size: 128 },
      { id: 'dpad', kind: 'dpad', inputs: STEER, at: { x: 0.3, y: 0.7 }, class: 'dusk-dpad' },
      {
        id: 'super',
        kind: 'button',
        inputs: ['jump', 'light'],
        label: 'J+A',
        at: { x: 0.9, y: 0.8 },
      },
    ];

    expect(skinProblems(skin(items))).toEqual([]);
  });

  it('names a control with no inputs, or the wrong ones', () => {
    const problems = skinProblems(
      skin([
        { id: 'jump', kind: 'button', inputs: [] },
        { id: 'stick', kind: 'stick', inputs: { up: 'up' } },
        { id: 'odd', kind: 'wheel', inputs: ['spin'] },
      ]),
    );

    expect(problems).toContain('landscape: jump: a button needs a list of inputs');
    expect(problems).toContain(
      'landscape: stick: a stick needs an input for up, right, down and left',
    );
    expect(problems).toContain('landscape: odd: kind must be one of button, dpad, stick');
  });

  it('wants ids of their own, one stick, and places for all controls or none', () => {
    const problems = skinProblems(
      skin([
        { id: 'a', kind: 'stick', inputs: STEER, at: { x: 0.2, y: 0.7 } },
        { id: 'a', kind: 'stick', inputs: STEER },
      ]),
    );

    expect(problems).toEqual(
      expect.arrayContaining([
        'landscape: every control needs an id of its own',
        'landscape: it has more than one stick',
        'landscape: at places all its controls or none',
      ]),
    );
  });

  it('checks places, sizes and class names', () => {
    const problems = skinProblems(
      skin([
        { id: 'jump', kind: 'button', inputs: ['jump'], at: { x: 2, y: 0 }, size: 0, class: '<b>' },
      ]),
    );

    expect(problems).toEqual([
      'landscape: jump: at must be fractions of the layer',
      'landscape: jump: size must be px above 0',
      'landscape: jump: class must be class names',
      'portrait: jump: at must be fractions of the layer',
      'portrait: jump: size must be px above 0',
      'portrait: jump: class must be class names',
    ]);
  });

  it('takes px offsets from a control’s anchor, but not for the stick', () => {
    const problems = skinProblems(
      skin([
        { id: 'jump', kind: 'button', inputs: ['jump'], at: { x: 1, y: 1, dx: -100, dy: 'up' } },
        { id: 'stick', kind: 'stick', inputs: STEER, at: { x: 0, y: 1, dx: 120 } },
        { id: 'light', kind: 'button', inputs: ['light'], at: { x: 1, y: 1, dx: -120, dy: -90 } },
      ]),
    );

    expect(problems.filter((problem) => problem.startsWith('landscape'))).toEqual([
      'landscape: jump: dx and dy must be px',
      'landscape: stick: a stick stands by x and y alone',
    ]);
  });

  it('takes a shell, a frame for the game’s screen, and controls shaped like pills', () => {
    const items = [
      { id: 'dash', kind: 'button', inputs: ['dash'], at: { x: 0, y: 0 }, aspect: 0.4 },
    ];
    const framed = {
      id: 'shell',
      name: 'Shell',
      layouts: {
        landscape: {
          items,
          shell: { class: 'clear clear-lotus' },
          screen: { left: 170, right: 170 },
        },
        portrait: { items, shell: { class: 'clear' }, screen: { top: 10, align: 'top' } },
      },
    };

    expect(skinProblems(framed)).toEqual([]);
  });

  it('names a shell with no classes, a frame off the screen and a shape with no height', () => {
    const items = [{ id: 'dash', kind: 'button', inputs: ['dash'], aspect: 0 }];
    const layout = { items, shell: {}, screen: { left: -4, align: 'bottom' } };
    const problems = skinProblems({
      id: 'x',
      name: 'X',
      layouts: { landscape: layout, portrait: layout },
    });

    expect(problems.filter((problem) => problem.startsWith('landscape'))).toEqual([
      'landscape: dash: aspect must be its height over its width, above 0',
      'landscape: shell needs class names',
      'landscape: screen sides must be px of 0 or more',
      'landscape: screen align must be top or center',
    ]);
  });

  it('wants a name and both ways of holding the phone', () => {
    expect(skinProblems({ id: 'x', layouts: { landscape: { items: [] } } })).toEqual([
      'a skin needs an id and a name',
      'landscape: it lists no controls',
      'portrait: it lists no controls',
    ]);
  });
});
