import { describe, expect, it } from 'vitest';

import { CINEMA } from '../../../../../src/data/cinema.js';
import { chaseLengthOf, noteChase } from '../../../../../src/render/duel/chase/chase-length.js';
import { REPEAT_SHARE } from '../../../../../src/render/duel/stages.js';

const roundOf = (move) => ({ picked: { attack: { id: move ?? 'shoot', move } } });

const showOf = (cinema, budget = null) => ({ cinema, budget, seen: { moves: new Set() } });

describe("a keeper round's chase", () => {
  it('rides a special the whole way the first time, and shorter once it has been seen', () => {
    const show = showOf('full');
    const round = roundOf('naga-shot');

    expect(chaseLengthOf(show, round)).toBe(CINEMA.chase.ticks);
    noteChase(show, round);
    expect(chaseLengthOf(show, round)).toBe(Math.round(CINEMA.chase.ticks * REPEAT_SHARE));
    expect(chaseLengthOf(show, roundOf('garuda-volley'))).toBe(CINEMA.chase.ticks);
  });

  it('plays for no plain shot, and only where the camera adds time', () => {
    expect(chaseLengthOf(showOf('full'), roundOf(null))).toBe(0);
    expect(chaseLengthOf(showOf('short'), roundOf('naga-shot'))).toBe(0);
    expect(chaseLengthOf(showOf('off'), roundOf('naga-shot'))).toBe(0);
  });

  it('gives way once the match has spent its share of real time on shows', () => {
    const spent = showOf('full', { play: 0, shows: 1e6 });

    expect(chaseLengthOf(spent, roundOf('naga-shot'))).toBe(0);
  });
});
