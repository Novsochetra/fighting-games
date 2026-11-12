const SWITCH = [true, false];

export const SETTINGS_ROWS = [
  { key: 'sound', values: SWITCH },
  { key: 'music', values: SWITCH },
  { key: 'vibrate', values: SWITCH, needs: 'buzz' },
  { key: 'lang', values: ['km', 'en'], names: { km: 'ខ្មែរ', en: 'English' } },
  { key: 'numerals', values: ['khmer', 'latin'], names: { khmer: '១២៣', latin: '123' } },
];

export function nextValue(row, value) {
  return row.values[(row.values.indexOf(value) + 1) % row.values.length];
}

export const rowsFor = (can) => SETTINGS_ROWS.filter((row) => !row.needs || can[row.needs]);
