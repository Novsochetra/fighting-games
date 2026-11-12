import { describe, expect, it } from 'vitest';
import { oscillators, played } from './open-audio.js';

const pitches = (started) => oscillators(started).map((voice) => voice.frequency);

describe('the last seconds of a customer’s patience', () => {
  it('tick on a wood block, a step higher each second: 3, 2, then 1', () => {
    const [three, two, one] = [3, 2, 1].map((seconds) => pitches(played('hurry', { seconds }))[0]);

    expect(three).toBeLessThan(two);
    expect(two).toBeLessThan(one);
  });

  it('tick as at three for a second they do not know', () => {
    expect(pitches(played('hurry', { seconds: 9 }))).toEqual(
      pitches(played('hurry', { seconds: 3 })),
    );
  });
});

describe('a customer storming off', () => {
  it('knocks twice on wood, then groans after the knocks', () => {
    const started = oscillators(played('stormed'));
    const knocks = started.filter((voice) => voice.frequency === 180);
    const groan = started.find((voice) => voice.frequency === 220);

    expect(knocks).toHaveLength(2);
    expect(groan.at).toBeGreaterThan(Math.max(...knocks.map((knock) => knock.at)));
  });
});

describe('the speed a bill was paid at', () => {
  it('rings longer and higher for lightning than for quick', () => {
    const perfect = played('perfect');
    const great = played('great');

    expect(oscillators(perfect).length).toBeGreaterThan(oscillators(great).length);
    expect(Math.max(...pitches(perfect))).toBeGreaterThan(Math.max(...pitches(great)));
  });

  it.each(['key', 'chip'])('plays a %s', (name) => {
    expect(played(name).length).toBeGreaterThan(0);
  });
});
