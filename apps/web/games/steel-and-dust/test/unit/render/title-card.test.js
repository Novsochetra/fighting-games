import { describe, expect, it } from 'vitest';
import { VIEW_WIDTH } from '../../../src/config.js';
import { cardAge, cardDoneAt, letterHitsAt } from '../../../src/data/mission-handoff.js';
import { layoutCard } from '../../../src/render/hud/title-card.js';
import { letterAt, shineAt, typedLength } from '../../../src/render/hud/title-card-timing.js';

const fallOf = (index, ages) => ages.map((age) => letterAt(age, index));

describe('a mission title card', () => {
  it('drops each letter in after the one before it', () => {
    expect(letterAt(0, 0)).not.toBeNull();
    expect(letterAt(0, 1)).toBeNull();
    expect(letterAt(2, 1)).toBeNull();
    expect(letterAt(3, 1)).not.toBeNull();
  });

  it('starts a letter above its place, strikes it, bounces below and settles there', () => {
    const fall = fallOf(0, [0, 3, 6, 7, 9, 30]).map((letter) => letter.offset);
    expect(fall[0]).toBeLessThan(-30);
    expect(fall[1]).toBeLessThan(0);
    expect(Math.max(...fall)).toBeGreaterThan(0);
    expect(fall.slice(-2)).toEqual([0, 0]);
    const hit = letterHitsAt(0);
    expect(letterAt(hit - 1, 0).offset).toBeLessThan(0);
    expect(letterAt(hit, 0).offset).toBeGreaterThanOrEqual(0);
    expect(letterAt(hit, 0).sinceHit).toBe(0);
  });

  it('keeps a letter white from the stamp until a moment after it lands', () => {
    const hot = fallOf(0, [0, 9, 12, 13, 40]).map((letter) => letter.hot);
    expect(hot).toEqual([true, true, true, false, false]);
  });

  it('runs a band of light over the card once every letter is down, and again later', () => {
    const count = 15;
    const landed = cardDoneAt(count);
    expect(letterAt(landed, count - 1).hot).toBe(false);
    expect(shineAt(landed - 1, count)).toBeNull();
    expect(shineAt(landed, count)).toBe(0);
    expect(shineAt(landed + 10, count)).toBeGreaterThan(shineAt(landed + 5, count));
    expect(shineAt(landed + 60, count)).toBe(0);
  });

  it('types out the line under the title once the title is down', () => {
    const landed = cardDoneAt(8);
    expect(typedLength(0, 8)).toBe(0);
    expect(typedLength(landed, 8)).toBe(0);
    expect(typedLength(landed + 10, 8)).toBe(5);
  });

  it('breaks a long title a word a line and keeps a short one on one line', () => {
    const complete = layoutCard('Mission complete');
    expect(complete.letters.map((letter) => letter.char).join('')).toBe('MISSIONCOMPLETE');
    expect(new Set(complete.letters.map((letter) => letter.y)).size).toBe(2);
    const mission = layoutCard('Mission 12');
    expect(mission.letters).toHaveLength(9);
    expect(new Set(mission.letters.map((letter) => letter.y)).size).toBe(1);
  });

  it('centers each line on the screen and lays its letters on whole pixels', () => {
    const card = layoutCard('All clear');
    const width = card.letters.at(-1).x + 3 * card.scale - card.letters[0].x;
    expect(Math.abs(card.letters[0].x + width / 2 - VIEW_WIDTH / 2)).toBeLessThanOrEqual(1);
    expect(card.letters.every((letter) => Number.isInteger(letter.x + letter.y))).toBe(true);
    expect(card.bottom).toBeGreaterThan(card.top);
  });

  it("waits out the boss's slow fall before the clear card, and the wipe before a mission's", () => {
    expect(cardAge({ age: 0 }, true)).toBeLessThan(-15);
    expect(cardAge({ age: 0 }, false)).toBeLessThan(-10);
    expect(cardAge({ age: 20 }, true)).toBeLessThan(cardAge({ age: 20 }, false));
  });
});
