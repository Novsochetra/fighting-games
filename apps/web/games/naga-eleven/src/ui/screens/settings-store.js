export const SETTINGS_KEY = 'naga-eleven/settings';

const VOLUMES = Array.from({ length: 11 }, (_, step) => step);

export const SETTING_CHOICES = Object.freeze({
  lang: ['en', 'km'],
  sound: VOLUMES,
  music: VOLUMES,
  matchLength: ['short', 'normal'],
  touch: ['auto', 'on', 'off'],
});

export const SETTING_KEYS = Object.keys(SETTING_CHOICES);

export const DEFAULT_SETTINGS = Object.freeze({
  lang: 'en',
  sound: 8,
  music: 6,
  matchLength: 'normal',
  touch: 'auto',
});

export const isVolume = (key) => key === 'sound' || key === 'music';

export const preferredLang = (navigator) =>
  (navigator?.languages ?? [navigator?.language]).some((tag) => /^km\b/i.test(tag ?? ''))
    ? 'km'
    : 'en';

// a private window or blocked site data makes storage throw; the game then keeps its defaults
function readStored(storage) {
  try {
    const text = storage?.getItem(SETTINGS_KEY);

    return text ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

const valid = (key, value) => SETTING_CHOICES[key]?.includes(value) ?? false;

export function readSettings(storage, { lang = DEFAULT_SETTINGS.lang } = {}) {
  const stored = readStored(storage) ?? {};
  const fallback = { ...DEFAULT_SETTINGS, lang };

  return Object.fromEntries(
    SETTING_KEYS.map((key) => [key, valid(key, stored[key]) ? stored[key] : fallback[key]]),
  );
}

export function writeSettings(storage, settings) {
  try {
    storage.setItem(SETTINGS_KEY, JSON.stringify(settings));

    return true;
  } catch {
    return false;
  }
}

export function stepSetting(settings, key, by) {
  const choices = SETTING_CHOICES[key];

  if (!choices) {
    return settings;
  }

  const at = Math.max(0, choices.indexOf(settings[key]));
  const count = choices.length;
  const next = isVolume(key)
    ? Math.min(count - 1, Math.max(0, at + by))
    : (((at + by) % count) + count) % count;

  return { ...settings, [key]: choices[next] };
}
