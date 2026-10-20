// storage can be missing or throw (private windows, blocked site data); the game then just
// forgets between visits
export function readJson(storage, key, fallback) {
  try {
    const text = storage.getItem(key);
    return text ? JSON.parse(text) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(storage, key, value) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    return false;
  }
  return true;
}

function readCount(storage, key) {
  try {
    return parseInt(storage.getItem(key) || '0', 10) || 0;
  } catch {
    return 0;
  }
}

export function loadRecords(storage) {
  return {
    bestCombo: readCount(storage, 'sd_best'),
    bestScore: readCount(storage, 'sd_best_score'),
    bestMission: readCount(storage, 'sd_missions') || 1,
  };
}

export function saveRecords(storage, records) {
  try {
    storage.setItem('sd_best', String(records.bestCombo));
    storage.setItem('sd_best_score', String(records.bestScore));
    storage.setItem('sd_missions', String(records.bestMission ?? 1));
  } catch {
    return false;
  }
  return true;
}
