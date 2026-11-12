import { readJson, writeJson } from '../../../../packages/host/src/json-storage.js';
import { defaultSettings, INPUTS, sanitizeSettings } from '../data/settings.js';
import { sanitizeRecords } from '../sim/records.js';

const KEY = 'kit_luy';

// Counting money and typing on the pad are kept apart, as typing is the quicker. A save from
// before there were two holds the money's records alone.
function recordsOf(saved) {
  const byInput = saved && typeof saved === 'object' && !('best' in saved) ? saved : {};
  const money = 'best' in (saved || {}) ? saved : byInput.money;

  return Object.fromEntries(
    INPUTS.map((input) => [input, sanitizeRecords(input === 'money' ? money : byInput[input])]),
  );
}

export function loadSave(storage, languages) {
  const saved = readJson(storage, KEY, {});

  return {
    records: recordsOf(saved?.records),
    settings: sanitizeSettings(saved?.settings, defaultSettings(languages)),
  };
}

export const storeSave = (storage, { records, settings }) =>
  writeJson(storage, KEY, { records, settings });
