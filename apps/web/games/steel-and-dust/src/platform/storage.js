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
  };
}

export function saveRecords(storage, records) {
  try {
    storage.setItem('sd_best', String(records.bestCombo));
    storage.setItem('sd_best_score', String(records.bestScore));
  } catch {
    return false;
  }
  return true;
}
