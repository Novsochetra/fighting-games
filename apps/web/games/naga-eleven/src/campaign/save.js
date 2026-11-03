import { heroAtLevel } from './levels.js';
import { repairSave } from './save-repair.js';
import { DEFAULT_SEED, SAVE_KEY, SAVE_VERSION } from './save-format.js';

export function newSave({ seed = DEFAULT_SEED } = {}) {
  return {
    version: SAVE_VERSION,
    chapter: 0,
    stage: 0,
    hero: heroAtLevel(1),
    cups: {},
    flags: {},
    seed: seed >>> 0,
    attempts: 0,
  };
}

// a private window or blocked site data makes storage throw; the game then starts afresh
function readStored(storage) {
  try {
    const text = storage?.getItem(SAVE_KEY);

    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export function loadSave(storage, options) {
  return repairSave(readStored(storage)) ?? newSave(options);
}

export function storeSave(storage, save) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(save));

    return true;
  } catch {
    return false;
  }
}
