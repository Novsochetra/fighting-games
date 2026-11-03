import { describe, expect, it } from 'vitest';
import { FORMATS } from '../../../../../src/data/formats.js';
import { isFlashing, photographers } from '../../../../../src/render/venues/props/drawables.js';

const { pitch, goal } = FORMATS['11'];
const [left] = photographers({ pitch, goal });
const right = photographers({ pitch, goal }).find((prop) => prop.facing < 0);

const CALM = { cheer: false, excited: false };
const sceneAt = (tick, { ballX = pitch.length / 2, mood = CALM } = {}) => ({
  tick,
  mood,
  match: { pitch, ball: { x: ballX, y: pitch.width / 2 } },
});

// the share of `ticks` ticks from 1000 on that a photographer's flash is lit in
function litShare(prop, options, ticks = 12000) {
  let lit = 0;

  for (let tick = 1000; tick < 1000 + ticks; tick += 1) {
    lit += isFlashing(prop, sceneAt(tick, options)) ? 1 : 0;
  }

  return lit / ticks;
}

describe('a photographer behind the goal', () => {
  it('flashes in open play too, now and then, and far more with the play near his goal', () => {
    const far = litShare(left, { ballX: pitch.length * 0.6 });
    const near = litShare(left, { ballX: pitch.length * 0.08 });

    expect(far).toBeGreaterThan(0);
    expect(far).toBeLessThan(0.01);
    expect(near).toBeGreaterThan(far * 4);
    expect(near).toBeLessThan(0.1);
  });

  it('heeds the play near his own goal, not the other one', () => {
    const atLeftGoal = { ballX: pitch.length * 0.05 };

    expect(litShare(left, atLeftGoal)).toBeGreaterThan(litShare(right, atLeftGoal) * 4);
  });

  it('flashes at every chance while the crowd cheers a goal', () => {
    const cheering = { mood: { cheer: true, excited: true } };

    expect(litShare(left, cheering)).toBeGreaterThan(0.2);
  });

  it('fires a burst as two flashes, each lit four ticks', () => {
    const near = { ballX: pitch.length * 0.05 };
    const start = Array.from({ length: 4000 }, (_, i) => 1024 + i * 16).find((tick) =>
      isFlashing(left, sceneAt(tick, near)),
    );
    const burst = Array.from({ length: 16 }, (_, i) => isFlashing(left, sceneAt(start + i, near)));

    expect(burst.map((lit) => (lit ? 1 : 0)).join('')).toBe('1111000011110000');
  });

  it('flashes the same in a frame drawn twice', () => {
    for (let tick = 0; tick < 2000; tick += 7) {
      const scene = sceneAt(tick, { ballX: pitch.length * 0.1 });

      expect(isFlashing(left, scene)).toBe(isFlashing(left, { ...scene }));
    }
  });

  it('flashes now and then, as far from the play, with no match to read the play from', () => {
    let alone = 0;
    let far = 0;

    for (let tick = 1000; tick < 13000; tick += 1) {
      alone += isFlashing(left, { tick, mood: CALM, match: null }) ? 1 : 0;
      far += isFlashing(left, sceneAt(tick, { ballX: pitch.length * 0.6 })) ? 1 : 0;
    }

    expect(alone).toBe(far);
  });
});
