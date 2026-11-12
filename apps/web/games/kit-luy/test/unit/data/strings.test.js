import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { OPERATIONS } from '../../../src/data/operations.js';
import { RANKS } from '../../../src/data/ranks.js';
import { SETTINGS_ROWS } from '../../../src/data/settings-rows.js';
import { EN } from '../../../src/data/strings/en.js';
import { KM } from '../../../src/data/strings/km.js';

const PAGE = readFileSync(new URL('../../../index.html', import.meta.url), 'utf8');
const namedOnPage = [...PAGE.matchAll(/data-i18n(?:-label)?="([^"]+)"/g)].map((match) => match[1]);
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();

describe('the game’s words', () => {
  it('are all said in both languages', () => {
    expect(Object.keys(KM).sort()).toEqual(Object.keys(EN).sort());
  });

  it('fill the same blanks in both languages', () => {
    for (const key of Object.keys(EN)) {
      expect(placeholders(KM[key]), key).toEqual(placeholders(EN[key]));
    }
  });

  it('are none of them empty', () => {
    for (const table of [EN, KM]) {
      expect(Object.values(table).every((text) => text.trim() !== '')).toBe(true);
    }
  });

  it('cover every word the page asks for', () => {
    expect(namedOnPage.length).toBeGreaterThan(20);
    expect(namedOnPage.filter((key) => !(key in EN))).toEqual([]);
  });

  it('name every rank, sum and settings row', () => {
    const keys = [
      ...RANKS.map((rank) => `rank.${rank.id}`),
      ...OPERATIONS.flatMap((op) => [`caption.${op}`, `op.${op}`]),
      ...SETTINGS_ROWS.map((row) => `settings.${row.key}`),
    ];

    expect(keys.filter((key) => !(key in EN))).toEqual([]);
  });

  it('are written in Khmer script in the Khmer table', () => {
    const latinOnly = Object.entries(KM).filter(([, text]) => !/[ក-៿]/.test(text));

    expect(latinOnly).toEqual([]);
  });
});
