import { describe, expect, it } from 'vitest';
import {
  LETTERS_PER_TICK,
  PAUSES,
  createTyping,
  finishTyping,
  isTyped,
  lettersOf,
  shownText,
  typeTick,
} from '../../../src/story/typewriter.js';

function ticksToType(text) {
  const typing = createTyping(text);
  let ticks = 0;

  while (!isTyped(typing)) {
    typeTick(typing);
    ticks += 1;
  }

  return ticks;
}

describe('the typewriter', () => {
  it('types about one and a half letters a tick', () => {
    const typing = createTyping('abcdefghij');

    typeTick(typing);
    expect(shownText(typing)).toBe('a');

    typeTick(typing);
    expect(shownText(typing)).toBe('abc');

    expect(ticksToType('abcdefghijkl')).toBe(Math.ceil(12 / LETTERS_PER_TICK));
  });

  it('rests after a mark that ends a phrase, then types on', () => {
    const typing = createTyping('Go, go');

    typeTick(typing);
    typeTick(typing);
    expect(shownText(typing)).toBe('Go,');

    for (let i = 0; i < PAUSES[',']; i += 1) {
      typeTick(typing);
      expect(shownText(typing)).toBe('Go,');
    }

    typeTick(typing);
    expect(shownText(typing).length).toBeGreaterThan(3);
  });

  it('rests longer after a sentence than after a comma', () => {
    expect(ticksToType('Go. go')).toBeGreaterThan(ticksToType('Go, go'));
    expect(PAUSES['។']).toBeGreaterThan(PAUSES[',']);
  });

  it('does not rest inside a word or at the end of the line', () => {
    expect(ticksToType('3.5km')).toBe(ticksToType('35kmx'));
    expect(ticksToType('Go!')).toBe(ticksToType('Gox'));
  });

  it('types a Khmer letter with the marks stacked on it at once', () => {
    const letters = lettersOf('ក្រុម');

    expect(letters.join('')).toBe('ក្រុម');
    expect(letters.length).toBeLessThan([...'ក្រុម'].length);
  });

  it('shows the whole line when finished early', () => {
    const typing = createTyping('Then I will wake it, Grandpa!');

    typeTick(typing);
    finishTyping(typing);

    expect(isTyped(typing)).toBe(true);
    expect(shownText(typing)).toBe('Then I will wake it, Grandpa!');
    expect(typing.wait).toBe(0);
  });
});
