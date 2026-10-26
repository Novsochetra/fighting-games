// @vitest-environment happy-dom
import { act, cleanup, render } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameCard } from '../../../src/home/game-card';
import { useActionRow } from '../../../src/home/use-action-row';

const TOKENS = {
  '--duration-swap-out': '140ms',
  '--duration-rise': '500ms',
  '--duration-stagger': '60ms',
  '--easing-standard': 'ease',
  '--easing-spring': 'spring',
  '--offset-rise': '12px',
};

interface FakeAnimation {
  keyframes: Keyframe[];
  timing: KeyframeAnimationOptions;
  finished: Promise<void>;
  finish: () => void;
  cancel: () => void;
}

const card = (id: string, isComingSoon = false) => ({ id, isComingSoon }) as GameCard;
const game = card('game');
const teaser = card('soon', true);

// Play, Details and the heart, which a teaser hides but Play.
function Row({ shows, animate }: { shows: GameCard; animate: boolean }) {
  const row = useRef<HTMLDivElement>(null);
  const shown = useActionRow(shows, animate, row);

  return (
    <div ref={row} data-shown={shown.id}>
      <a>{shown.id}</a>
      <button type="button" hidden={shown.isComingSoon} />
      <button type="button" hidden={shown.isComingSoon} />
    </div>
  );
}

let animations: FakeAnimation[] = [];

function fakeAnimate(
  keyframes: Keyframe[] | PropertyIndexedKeyframes | null,
  timing?: number | KeyframeAnimationOptions,
) {
  let finish = () => {};
  const finished = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const animation = {
    keyframes: keyframes as Keyframe[],
    timing: timing as KeyframeAnimationOptions,
    finished,
    finish,
    cancel: vi.fn(),
  };

  animations.push(animation);

  return animation as unknown as Animation;
}

function showRow(first: GameCard) {
  const view = render(<Row shows={first} animate={false} />);
  const rowOf = () => view.container.firstElementChild as HTMLElement;

  return {
    rowOf,
    shown: () => rowOf().dataset.shown,
    show: (next: GameCard) => view.rerender(<Row shows={next} animate />),
  };
}

const finishAll = () =>
  act(async () => {
    animations.splice(0).forEach((animation) => animation.finish());
  });

beforeEach(() => {
  for (const [name, value] of Object.entries(TOKENS)) {
    document.documentElement.style.setProperty(name, value);
  }

  animations = [];
  vi.spyOn(HTMLElement.prototype, 'animate').mockImplementation(fakeAnimate);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  document.documentElement.removeAttribute('style');
});

describe('useActionRow', () => {
  it('changes the buttons at once on the first show and between two games', () => {
    const row = showRow(game);

    row.show(card('other'));

    expect(row.shown()).toBe('other');
    expect(animations).toEqual([]);
  });

  it('fades the buttons out, swaps them unseen, then rises the new ones back in turn', async () => {
    const row = showRow(game);

    row.show(teaser);
    const fades = [...animations];

    expect(row.shown()).toBe('game');
    expect(fades.map((animation) => animation.timing)).toEqual(
      Array(3).fill({ duration: 140, easing: 'ease', fill: 'forwards' }),
    );

    await finishAll();

    expect(row.shown()).toBe('soon');
    expect(animations).toHaveLength(1);
    expect(animations[0]!.keyframes[0]).toEqual({ opacity: 0, transform: 'translateY(12px)' });
    expect(animations[0]!.timing).toMatchObject({ duration: 500, delay: 0, fill: 'backwards' });
    fades.forEach((animation) => expect(animation.cancel).toHaveBeenCalled());
  });

  it('lets the new look in with the transitions off, so Play does not fade to black in view', async () => {
    const row = showRow(teaser);
    const transitions: string[][] = [];

    vi.spyOn(row.rowOf(), 'getBoundingClientRect').mockImplementation(() => {
      transitions.push(
        [...row.rowOf().children].map((button) => (button as HTMLElement).style.transition),
      );

      return new DOMRect();
    });
    row.show(game);
    await finishAll();

    expect(transitions).toEqual([['none', 'none', 'none']]);
    expect(
      [...row.rowOf().children].map((button) => (button as HTMLElement).style.transition),
    ).toEqual(['', '', '']);
  });

  it('staggers the buttons that come back', async () => {
    const row = showRow(teaser);

    row.show(game);
    await finishAll();

    expect(animations.map((animation) => animation.timing.delay)).toEqual([0, 30, 60]);
  });

  it('folds swipes that land while it fades into the one change', async () => {
    const row = showRow(game);

    row.show(teaser);
    row.show(game);
    row.show(card('soon-2', true));
    expect(animations).toHaveLength(3);

    await finishAll();

    expect(row.shown()).toBe('soon-2');
  });

  it('swaps at once when the visitor asks for less motion', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({ matches: true } as MediaQueryList);
    const row = showRow(game);

    row.show(teaser);

    expect(row.shown()).toBe('soon');
    expect(animations).toEqual([]);
  });
});
