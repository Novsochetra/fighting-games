import { sanitizeLeaderboard } from '../data/leaderboard.js';
import { sanitizeSavedRun } from '../data/saved-run.js';
import { defaultSettings, migrateSettings } from '../data/settings.js';
import { loadRecords, readJson, saveRecords, writeJson } from './storage.js';

const SETTINGS_KEY = 'sd_settings';
const HINTS_KEY = 'sd_hints';
const RUN_KEY = 'sd_run';
const LEADERBOARD_KEY = 'sd_leaderboard';

export function loadSaved(storage, coarsePointer) {
  return {
    settings: {
      ...defaultSettings(coarsePointer),
      ...migrateSettings(readJson(storage, SETTINGS_KEY, {})),
    },
    records: loadRecords(storage),
    hintsSeen: readJson(storage, HINTS_KEY, {}),
    checkpoint: sanitizeSavedRun(readJson(storage, RUN_KEY, null)),
    leaderboard: sanitizeLeaderboard(readJson(storage, LEADERBOARD_KEY, [])),
  };
}

export function persistencePorts(storage) {
  return {
    saveSettings: (settings) => writeJson(storage, SETTINGS_KEY, settings),
    saveHints: (hintsSeen) => writeJson(storage, HINTS_KEY, hintsSeen),
    saveRecords: (records) => saveRecords(storage, records),
    saveRun: (checkpoint) => writeJson(storage, RUN_KEY, checkpoint),
    saveLeaderboard: (board) => writeJson(storage, LEADERBOARD_KEY, board),
  };
}
