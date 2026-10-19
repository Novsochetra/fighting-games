import { defaultSettings, migrateSettings } from '../data/settings.js';
import { loadRecords, readJson, saveRecords, writeJson } from './storage.js';

const SETTINGS_KEY = 'sd_settings';
const HINTS_KEY = 'sd_hints';

export function loadSaved(storage, coarsePointer) {
  return {
    settings: {
      ...defaultSettings(coarsePointer),
      ...migrateSettings(readJson(storage, SETTINGS_KEY, {})),
    },
    records: loadRecords(storage),
    hintsSeen: readJson(storage, HINTS_KEY, {}),
  };
}

export function persistencePorts(storage) {
  return {
    saveSettings: (settings) => writeJson(storage, SETTINGS_KEY, settings),
    saveHints: (hintsSeen) => writeJson(storage, HINTS_KEY, hintsSeen),
    saveRecords: (records) => saveRecords(storage, records),
  };
}
