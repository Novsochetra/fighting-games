const SWITCH = [true, false];

// a row's value is named as it is (`names`) or by a word of the game's text (`words`)
export const SETTINGS_ROWS = [
  { key: 'sound', values: SWITCH },
  { key: 'vibrate', values: SWITCH, needs: 'buzz' },
  { key: 'lang', values: ['km', 'en'], names: { km: 'ខ្មែរ', en: 'English' } },
  { key: 'numerals', values: ['khmer', 'latin'], names: { khmer: '១២៣', latin: '123' } },
  {
    key: 'total',
    values: ['early', 'always'],
    words: { early: 'settings.total.early', always: 'settings.total.always' },
  },
];

export function nextValue(row, value) {
  return row.values[(row.values.indexOf(value) + 1) % row.values.length];
}

export const rowsFor = (can) => SETTINGS_ROWS.filter((row) => !row.needs || can[row.needs]);
