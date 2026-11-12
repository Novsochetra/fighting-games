import { readJson, writeJson } from '../../../../packages/host/src/json-storage.js';
import { defaultSettings, sanitizeSettings } from '../data/settings.js';
import { sanitizeRecords } from '../sim/records.js';

const KEY = 'kit_luy';

export function loadSave(storage, languages) {
  const saved = readJson(storage, KEY, {});

  return {
    records: sanitizeRecords(saved?.records),
    settings: sanitizeSettings(saved?.settings, defaultSettings(languages)),
  };
}

export const storeSave = (storage, { records, settings }) =>
  writeJson(storage, KEY, { records, settings });
