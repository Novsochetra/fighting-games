import { applyValue, EDITABLE, editsOf } from './shot-lists.js';

const KEY = 'naga-eleven/camera-lab';

// a private window or blocked site data makes storage throw; the lab then forgets on reload
export function loadLab(storage) {
  try {
    const saved = JSON.parse(storage?.getItem(KEY) ?? 'null');

    const edits = Object.entries(saved?.edits ?? {}).filter(([key]) => EDITABLE[key]);

    for (const [key, value] of edits) {
      applyValue(key, value);
    }

    return saved?.settings ?? null;
  } catch {
    return null;
  }
}

export function saveLab(storage, settings) {
  try {
    storage?.setItem(KEY, JSON.stringify({ settings, edits: editsOf() }));
  } catch {
    // the lab plays on without storage
  }
}
