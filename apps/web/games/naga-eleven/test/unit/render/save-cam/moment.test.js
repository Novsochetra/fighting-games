import { describe, expect, it } from 'vitest';

import {
  camMoment,
  defaultAim,
  defaultDive,
  outcomeOf,
  roundMoment,
  styleOf,
} from '../../../../src/render/save-cam/moment.js';

const SEEDS = Array.from({ length: 40 }, (_, i) => i * 37 + 5);

describe('a save cam moment the sim has not filled in', () => {
  it('aims a save within his reach, a goal toward a post, a miss outside the frame', () => {
    for (const seed of SEEDS) {
      const save = defaultAim('saved', seed);
      const goal = defaultAim('goal', seed);
      const wide = defaultAim('wide', seed);

      expect(Math.abs(save.side)).toBeLessThanOrEqual(0.75);
      expect(save.height).toBeGreaterThanOrEqual(0.15);
      expect(save.height).toBeLessThanOrEqual(0.75);
      expect(Math.abs(goal.side)).toBeGreaterThanOrEqual(0.6);
      expect(Math.abs(goal.side)).toBeLessThanOrEqual(0.92);
      expect(Math.abs(wide.side)).toBeGreaterThan(1.1);
      expect(Math.abs(defaultAim('post', seed).side)).toBe(1);
    }
  });

  it('dives the way the ball goes, stands for one at him, and is the same each time', () => {
    expect(defaultDive('saved', { side: 0.5, height: 0.4 }, 1)).toBe(1);
    expect(defaultDive('saved', { side: -0.5, height: 0.4 }, 1)).toBe(-1);
    expect(defaultDive('saved', { side: 0.1, height: 0.4 }, 1)).toBe(0);
    expect(camMoment({ result: 'goal' }, 9)).toEqual(camMoment({ result: 'goal' }, 9));

    const wrongWay = SEEDS.filter((seed) => {
      const aim = defaultAim('goal', seed);

      return defaultDive('goal', aim, seed) === -Math.sign(aim.side);
    });

    expect(wrongWay.length).toBeGreaterThan(0);
    expect(wrongWay.length).toBeLessThan(SEEDS.length / 2);
  });

  it("keeps the ball out in the keeper's skill's style, a punch punching and the rest catching", () => {
    expect(styleOf('angkor-wall')).toBe('wall');
    expect(styleOf('belly-block')).toBe('wall');
    expect(styleOf('mountain-guard')).toBe('punch');
    expect(styleOf('bayon-eyes')).toBe('catch');
    expect(styleOf(null, 'punch')).toBe('punch');
    expect(styleOf(null, 'catch')).toBe('catch');
  });

  it('plays a goal or a miss as itself, a save in its style, a catch only just reached as a parry', () => {
    expect(outcomeOf('goal', 'wall')).toBe('goal');
    expect(outcomeOf('wide', 'catch')).toBe('wide');
    expect(outcomeOf('post', 'catch')).toBe('post');
    expect(outcomeOf('saved', 'wall')).toBe('wall');
    expect(outcomeOf('parried', 'catch')).toBe('parry');
    expect(outcomeOf('parried', 'punch')).toBe('punch');
  });
});

describe('a moment the sim has filled in', () => {
  it("takes the sim's aim, dive and style over its own, and the move's looks", () => {
    const moment = camMoment({
      move: 'garuda-volley',
      guard: 'mountain-guard',
      result: 'saved',
      aim: { side: -0.9, height: 0.95 },
      dive: -1,
      style: 'catch',
    });

    expect(moment).toMatchObject({
      aim: { side: -0.9, height: 0.95 },
      dive: -1,
      outcome: 'catch',
      look: 'garuda',
      guardLook: 'mountain',
    });
  });

  it("reads a duel's keeper round: its picks, its result and what the sim drew for it", () => {
    const round = {
      attacker: 4,
      defender: 5,
      picked: {
        attack: { move: 'naga-shot', bonus: 8, from: 'hanuman-leap' },
        defend: { move: null, kind: 'punch' },
      },
      result: { word: 'parried', aim: { side: 0.3, height: 0.5 }, dive: 1, style: 'punch' },
    };

    expect(camMoment(roundMoment(round))).toMatchObject({
      shooter: 4,
      keeper: 5,
      move: 'naga-shot',
      bonus: 8,
      from: 'hanuman-leap',
      result: 'parried',
      outcome: 'punch',
      dive: 1,
      guardLook: null,
    });
  });
});
