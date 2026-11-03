import { describe, expect, it } from 'vitest';
import { KEEPER_SPARES, KITS, PLAIN_KITS } from '../../../src/art/kits.js';
import {
  DIGITS,
  NUMBER_COLOURS,
  PLAIN_NUMBER_COLOURS,
  SPARE_NUMBER_COLOURS,
  TRAINING_NUMBER,
} from '../../../src/art/shirt-numbers.js';
import { SOCHETRA_LOOK } from '../../../src/art/training/people.js';
import {
  contrastRatio,
  numberFillOf,
  shirtBaseOf,
} from '../../../src/render/actors/number-colours.js';

const CHOICES = ['home', 'away', 'keeper'];
const READS = 3;

// every shirt a player can wear, with the kit id and choice its number is looked up by
const SHIRTS = [
  ...Object.entries(KITS).flatMap(([id, set]) =>
    CHOICES.map((choice) => ({ name: `${id} ${choice}`, id, choice, shirt: set[choice].shirt })),
  ),
  ...KEEPER_SPARES.map((kit, i) => ({
    name: `spare ${i}`,
    id: 'cambodia',
    choice: `keeper-${i}`,
    shirt: kit.shirt,
  })),
  ...PLAIN_KITS.flatMap((set, side) =>
    CHOICES.map((choice) => ({
      name: `plain ${side} ${choice}`,
      id: `plain-${side}`,
      choice,
      shirt: set[choice].shirt,
    })),
  ),
];

describe('the shirt digits', () => {
  it('are each a rectangle of pixels five rows tall, painted or bare', () => {
    expect(Object.keys(DIGITS).sort()).toEqual([...'0123456789']);

    for (const rows of Object.values(DIGITS)) {
      expect(rows).toHaveLength(5);
      expect(new Set(rows.map((row) => row.length)).size).toBe(1);
      expect(rows.join('')).toMatch(/^[#.]+$/);
    }
  });

  it('use every column and every row they take, so none has a bare edge', () => {
    for (const rows of Object.values(DIGITS)) {
      const columns = [...rows[0]].map((_, x) => rows.some((row) => row[x] === '#'));

      expect(columns.every(Boolean)).toBe(true);
      expect(rows.every((row) => row.includes('#'))).toBe(true);
    }
  });

  it('are told apart: no two digits are the same picture', () => {
    const pictures = Object.values(DIGITS).map((rows) => rows.join('|'));

    expect(new Set(pictures).size).toBe(pictures.length);
  });
});

describe('the number colours', () => {
  it('name one for every shirt of every kit, the spares and the plain sides', () => {
    for (const set of Object.keys(KITS)) {
      expect(Object.keys(NUMBER_COLOURS[set] ?? {}).sort()).toEqual([...CHOICES].sort());
    }

    expect(SPARE_NUMBER_COLOURS).toHaveLength(KEEPER_SPARES.length);
    expect(PLAIN_NUMBER_COLOURS).toHaveLength(PLAIN_KITS.length);
  });

  it.each(SHIRTS)('read on the $name shirt at 3:1 or more', ({ id, choice, shirt }) => {
    expect(
      contrastRatio(numberFillOf(id, choice, shirt), shirtBaseOf(shirt)),
    ).toBeGreaterThanOrEqual(READS);
  });

  it("read on Sochetra's training shirt", () => {
    expect(contrastRatio(TRAINING_NUMBER, shirtBaseOf(SOCHETRA_LOOK.shirt))).toBeGreaterThanOrEqual(
      READS,
    );
  });
});
