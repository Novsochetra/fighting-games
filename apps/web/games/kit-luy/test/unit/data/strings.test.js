import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { OPERATIONS } from '../../../src/data/operations.js';
import { SETTINGS_ROWS } from '../../../src/data/settings-rows.js';
import { EN } from '../../../src/data/strings/en.js';
import { KM } from '../../../src/data/strings/km.js';

const PAGE = readFileSync(new URL('../../../index.html', import.meta.url), 'utf8');
const namedOnPage = [...PAGE.matchAll(/data-i18n(?:-label)?="([^"]+)"/g)].map((match) => match[1]);
const placeholders = (text) => [...text.matchAll(/\{(\w+)\}/g)].map((match) => match[1]).sort();
const BRAND = ['menu.arcade'];

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

  it('name every sum a customer asks, every sum of the mix and every settings row', () => {
    const rows = SETTINGS_ROWS.flatMap((row) => [
      `settings.${row.key}`,
      ...Object.values(row.words ?? {}),
    ]);
    const keys = [...OPERATIONS.flatMap((op) => [`ask.${op}`, `op.${op}`]), ...rows];

    expect(keys.filter((key) => !(key in EN))).toEqual([]);
  });

  it('are written in Khmer script in the Khmer table, but for the arcade’s own name', () => {
    const latinOnly = Object.keys(KM).filter((key) => !/[ក-៿]/.test(KM[key]));

    expect(latinOnly).toEqual(BRAND);
  });

  it('never call the money a note, but to say that it is not one', () => {
    const { 'help.pieces': disclaimer, ...rest } = EN;

    expect(disclaimer).toMatch(/not pictures of riel banknotes/);
    expect(Object.values(rest).filter((text) => /\bnotes?\b|banknote/i.test(text))).toEqual([]);
  });
});
