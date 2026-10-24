import { describe, expect, it, vi } from 'vitest';
import { createActionSwap } from '../../../src/home/action-swap.js';

const TOKENS = {
  '--duration-swap-out': '140ms',
  '--duration-rise': '500ms',
  '--duration-stagger': '60ms',
  '--easing-standard': 'ease',
  '--easing-spring': 'spring',
  '--offset-rise': '12px',
};

function fakeAnimation() {
  let finish;
  const finished = new Promise((resolve) => {
    finish = resolve;
  });
  return { finished, finish: () => finish(), cancel: vi.fn() };
}

function setup({ reduced = false } = {}) {
  const document = {
    documentElement: {},
    defaultView: {
      getComputedStyle: () => ({ getPropertyValue: (name) => TOKENS[name] ?? '' }),
      matchMedia: () => ({ matches: reduced }),
    },
  };
  const animations = [];
  const button = (id) => ({
    id,
    hidden: false,
    ownerDocument: document,
    style: {
      transition: '',
      removeProperty(name) {
        this[name] = '';
      },
    },
    animate: vi.fn((keyframes, timing) => {
      const animation = { ...fakeAnimation(), keyframes, timing };
      animations.push(animation);
      return animation;
    }),
  });
  const buttons = [button('play'), button('details'), button('favorite')];
  const row = { ownerDocument: document, children: buttons, getBoundingClientRect: vi.fn() };
  const apply = vi.fn((card) => {
    buttons[1].hidden = card.isComingSoon;
    buttons[2].hidden = card.isComingSoon;
  });
  const show = createActionSwap({
    row,
    apply,
    modeOf: (card) => (card.isComingSoon ? 'soon' : 'game'),
  });
  return { show, apply, buttons, animations };
}

const game = { id: 'game' };
const teaser = { id: 'soon', isComingSoon: true };
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe('createActionSwap', () => {
  it('changes the buttons at once on the first show and between two games', () => {
    const { show, apply, buttons } = setup();
    show(game, { animate: true });
    show({ id: 'other' }, { animate: true });
    expect(apply.mock.calls.map(([card]) => card.id)).toEqual(['game', 'other']);
    expect(buttons[0].animate).not.toHaveBeenCalled();
  });

  it('fades the buttons out, swaps them unseen, then rises the new ones back in turn', async () => {
    const { show, apply, buttons, animations } = setup();
    show(game);
    show(teaser, { animate: true });
    expect(apply).toHaveBeenCalledTimes(1);
    const outs = animations.splice(0);
    expect(outs.map((animation) => animation.timing)).toEqual(
      Array(3).fill({ duration: 140, easing: 'ease', fill: 'forwards' }),
    );

    outs.forEach((animation) => animation.finish());
    await flush();
    expect(apply).toHaveBeenLastCalledWith(teaser);
    expect(buttons[0].animate).toHaveBeenCalledTimes(2);
    expect(animations).toHaveLength(1);
    expect(animations[0].keyframes[0]).toEqual({ opacity: 0, transform: 'translateY(12px)' });
    expect(animations[0].timing).toMatchObject({ duration: 500, delay: 0, fill: 'backwards' });
    outs.forEach((animation) => expect(animation.cancel).toHaveBeenCalled());
  });

  it('changes the buttons unseen with their transitions off, so Play does not fade to black in view', async () => {
    const { show, apply, buttons, animations } = setup();
    show(teaser);
    const transitions = [];
    apply.mockImplementation(() =>
      transitions.push(buttons.map((button) => button.style.transition)),
    );
    show(game, { animate: true });
    animations.splice(0).forEach((animation) => animation.finish());
    await flush();
    expect(transitions).toEqual([['none', 'none', 'none']]);
    expect(buttons.map((button) => button.style.transition)).toEqual(['', '', '']);
  });

  it('staggers the buttons that come back', async () => {
    const { show, animations } = setup();
    show(teaser);
    show(game, { animate: true });
    animations.splice(0).forEach((animation) => animation.finish());
    await flush();
    expect(animations.map((animation) => animation.timing.delay)).toEqual([0, 30, 60]);
  });

  it('folds swipes that land while it fades into the one change', async () => {
    const { show, apply, animations } = setup();
    show(game);
    show(teaser, { animate: true });
    show(game, { animate: true });
    show({ id: 'soon-2', isComingSoon: true }, { animate: true });
    expect(animations).toHaveLength(3);
    animations.splice(0).forEach((animation) => animation.finish());
    await flush();
    expect(apply.mock.calls.map(([card]) => card.id)).toEqual(['game', 'soon-2']);
  });

  it('swaps at once when the visitor asks for less motion', () => {
    const { show, apply, buttons } = setup({ reduced: true });
    show(game);
    show(teaser, { animate: true });
    expect(apply).toHaveBeenLastCalledWith(teaser);
    expect(buttons[0].animate).not.toHaveBeenCalled();
  });
});
