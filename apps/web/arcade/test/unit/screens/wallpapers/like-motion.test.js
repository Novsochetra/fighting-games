import { describe, expect, it, vi } from 'vitest';
import {
  burstSparks,
  floatBigHeart,
  popLikeHeart,
  rollCount,
} from '@/screens/wallpapers/like-motion.js';

const TOKENS = {
  '--duration-ring': '450ms',
  '--duration-like-burst': '600ms',
  '--duration-like-float': '1000ms',
  '--duration-segment': '320ms',
  '--easing-standard': 'ease',
  '--easing-pop': 'ease',
  '--easing-spring': 'ease',
  '--scale-heart-pop': '1.28',
  '--offset-like-spark': '20px',
  '--offset-like-float': '36px',
};

// an element the motion plays on, in a page with the arcade's tokens and the visitor's motion choice
function element({ reduced = false } = {}) {
  const ownerDocument = {
    documentElement: {},
    defaultView: {
      getComputedStyle: () => ({ getPropertyValue: (name) => TOKENS[name] ?? '' }),
      matchMedia: () => ({ matches: reduced }),
    },
  };

  return { ownerDocument, animate: vi.fn() };
}

const framesOf = (target) => target.animate.mock.calls[0][0];
const timingOf = (target) => target.animate.mock.calls[0][1];

describe('the like motion', () => {
  it('pops the heart as it fills, on the pop curve', () => {
    const heart = element();

    popLikeHeart(heart);
    expect(framesOf(heart)).toEqual([
      { scale: '1' },
      { scale: '1.28', offset: 0.4 },
      { scale: '1' },
    ]);
    expect(timingOf(heart)).toEqual({ duration: 450, easing: 'ease' });
  });

  it('flies the little hearts out all round, each its own way, to fade at their distance', () => {
    const sparks = Array.from({ length: 4 }, () => element());

    burstSparks(sparks);

    const ends = sparks.map((spark) => framesOf(spark).at(-1));
    expect(ends.map((end) => end.opacity)).toEqual([0, 0, 0, 0]);
    expect(ends[0].transform).toMatch(/^translate\(0px, -20px\)/);
    expect(ends[1].transform).toMatch(/^translate\(20px, /);
    expect(ends[2].transform).toMatch(/, 20px\)/);
    expect(ends[3].transform).toMatch(/^translate\(-20px, /);
  });

  it('pops the big heart over the picture, then floats it up as it fades', () => {
    const heart = element();

    floatBigHeart(heart);
    expect(framesOf(heart).at(0)).toMatchObject({ opacity: 0 });
    expect(framesOf(heart).at(-1)).toEqual({
      opacity: 0,
      transform: 'translateY(-36px) scale(1.05)',
    });
    expect(timingOf(heart).duration).toBe(1000);
  });

  it('rolls the count in from below for a like and from above for taking it back', () => {
    const up = element();
    const down = element();

    rollCount(up, 'up');
    rollCount(down, 'down');
    expect(framesOf(up)[0].transform).toBe('translateY(60%)');
    expect(framesOf(down)[0].transform).toBe('translateY(-60%)');
  });

  it('plays none of it for a visitor who asks for reduced motion', () => {
    const heart = element({ reduced: true });
    const sparks = [element({ reduced: true })];

    popLikeHeart(heart);
    burstSparks(sparks);
    floatBigHeart(heart);
    rollCount(heart, 'up');
    expect(heart.animate).not.toHaveBeenCalled();
    expect(sparks[0].animate).not.toHaveBeenCalled();
  });
});
