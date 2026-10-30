import { describe, expect, it } from 'vitest';
import { slideFrames, type SlideLook } from '@/navigation/stack/stack-motion';

const look: SlideLook = {
  motion: 'slide',
  offsetUnder: '-30%',
  dimUnder: '0.9',
  shadow: 'shadow',
  scaleUnder: '1.03',
  scaleAway: '0.96',
  reduced: false,
};
const zoom: SlideLook = { ...look, motion: 'zoom' };

const animatedProperties = (frames: Keyframe[]) =>
  new Set(frames.flatMap((frame) => Object.keys(frame).filter((key) => key !== 'offset')));

describe('slideFrames on a phone', () => {
  it('slides a pushed screen in from the right over the one it covers, which slips left and dims', () => {
    const { front, back } = slideFrames('push', look);

    expect(front).toEqual([
      { translate: '100% 0', boxShadow: 'shadow' },
      { translate: '0 0', boxShadow: 'shadow' },
    ]);
    expect(back.at(-1)).toEqual({ translate: '-30% 0', filter: 'brightness(0.9)' });
  });

  it('plays a pop as the push backwards', () => {
    const push = slideFrames('push', look);
    const pop = slideFrames('pop', look);

    expect(pop.front).toEqual([...push.front].reverse());
    expect(pop.back).toEqual([...push.back].reverse());
  });

  it('only fades with reduced motion, as iOS dissolves', () => {
    const { front, back } = slideFrames('push', { ...look, reduced: true });

    expect(front).toEqual([{ opacity: 0 }, { opacity: 1 }]);
    expect(back.map((frame) => frame.translate)).toEqual(['0 0', '0 0']);
  });
});

describe('slideFrames on a desktop', () => {
  it('zooms in on a push: the screen arriving grows into place as it fades in', () => {
    const { front, back } = slideFrames('push', zoom);

    expect(front[0]).toEqual({ opacity: 0, scale: '0.96' });
    expect(front.at(-1)).toEqual({ opacity: 1, scale: '1' });
    expect(back).toEqual([{ scale: '1' }, { scale: '1.03' }]);
  });

  it('zooms out on a pop: the screen leaving shrinks away as the one under settles back', () => {
    const { front, back } = slideFrames('pop', zoom);

    expect(front[0]).toEqual({ opacity: 1, scale: '1' });
    expect(front.at(-1)).toEqual({ opacity: 0, scale: '0.96' });
    expect(back).toEqual([{ scale: '1.03' }, { scale: '1' }]);
  });

  it('trades the screens early in the zoom, so no ghost of the one gone lingers', () => {
    for (const move of ['push', 'pop'] as const) {
      const fade = slideFrames(move, zoom).front.find((frame) => frame.offset !== undefined);

      expect(fade?.offset).toBeLessThan(1);
      expect(fade?.opacity).toBe(move === 'push' ? 1 : 0);
    }
  });

  it('never slides a screen sideways, and moves only what the compositor plays alone', () => {
    const { front, back } = slideFrames('push', zoom);

    expect([...animatedProperties([...front, ...back])].sort()).toEqual(['opacity', 'scale']);
  });

  it('only fades with reduced motion, as on a phone', () => {
    expect(slideFrames('push', { ...zoom, reduced: true })).toEqual(
      slideFrames('push', { ...look, reduced: true }),
    );
  });
});
